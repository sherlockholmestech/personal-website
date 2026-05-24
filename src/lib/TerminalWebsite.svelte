<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { marked, type Tokens } from 'marked';
	import { codeToHtml } from 'shiki';
	import HighlightedCode from '$lib/HighlightedCode.svelte';

	type Theme = 'dark' | 'light';
	type LineKind = 'prompt' | 'output' | 'success' | 'error' | 'muted';
	type ShellLine =
		| { kind: Exclude<LineKind, 'prompt'>; text: string }
		| { kind: 'prompt'; command: string; cwd: string; took: string }
		| { kind: 'post'; path: string }
		| { kind: 'links'; path: string };
	type BlogPost = {
		path: string;
		title: string;
		date: string;
		tags: string[];
		markdown: string;
	};
	type MdBlock =
		| { type: 'heading'; level: number; text: string }
		| { type: 'paragraph'; text: string }
		| { type: 'list'; items: string[] }
		| { type: 'code'; language: string; code: string; html: string }
		| { type: 'quote'; text: string }
		| { type: 'hr' };

	const commands = [
		'help',
		'about',
		'info',
		'pwd',
		'cd blog',
		'cd ..',
		'ls',
		'ls blog',
		'tree blog',
		'cat blog/2026/ctf/defcon',
		'open blog/2026/ctf/defcon',
		'theme dark',
		'theme light',
		'clear'
	];

	let { data }: { data: { posts: BlogPost[]; requestedPath?: string; notFound?: boolean } } =
		$props();
	let posts = $derived(data.posts);
	let requestedPath = $derived(data.requestedPath);
	let routeNotFound = $derived(data.notFound);

	let input = $state('');
	let cwd = $state('~');
	let history = $state<ShellLine[]>([
		{ kind: 'success', text: 'Welcome to my terminal website.' },
		{
			kind: 'muted',
			text: 'Type `help` to list commands, or `cat blog/2026/ctf/defcon` to read a post.'
		}
	]);
	let selectedPath = $state('blog/2026/ctf/defcon');
	let sideReaderVisible = $state(false);
	let blogBrowserVisible = $state(false);
	let fzfQuery = $state('');
	let fzfIndex = $state(0);
	let routeInitialized = $state(false);
	let theme = $state<Theme>('dark');
	let terminalViewport: HTMLDivElement;
	let promptInput: HTMLInputElement;
	let fzfInput = $state<HTMLInputElement>();
	let highlightedCode = $state<Record<string, string>>({});

	let selectedPost = $derived(
		posts.find((post) => post.path === selectedPath) ??
			posts[0] ?? {
				path: '',
				title: '',
				date: '',
				tags: [],
				markdown: ''
			}
	);
	let parsedPost = $derived(parseMarkdown(selectedPost.markdown));
	let sidePostBlocks = $derived(
		parsedPost.filter((block, index) => !(index === 0 && block.type === 'heading'))
	);
	let tree = $derived(renderTree(posts.map((post) => post.path)));
	let fzfResults = $derived(searchPosts(fzfQuery));

	onMount(async () => {
		await tick();
		promptInput.focus();
	});

	$effect(() => {
		void highlightCodeBlocks(selectedPost.markdown);
	});

	$effect(() => {
		if (!routeInitialized && requestedPath) {
			if (routeNotFound) {
				history = [
					...history,
					{ kind: 'error', text: `404: no blog post found at ${requestedPath}` }
				];
			} else {
				if (posts.some((post) => post.path === requestedPath)) {
					selectedPath = requestedPath;
					sideReaderVisible = true;
				} else {
					history = [...history, { kind: 'links', path: requestedPath }];
				}
			}
			routeInitialized = true;
		}
	});

	function focusPrompt(event: PointerEvent) {
		if (event.target instanceof HTMLInputElement) return;
		promptInput.focus();
	}

	function handlePromptKeydown(event: KeyboardEvent) {
		if (blogBrowserVisible && event.key === 'ArrowUp') {
			event.preventDefault();
			fzfInput?.focus();
		}
		if (blogBrowserVisible && event.key === 'Escape') {
			event.preventDefault();
			blogBrowserVisible = false;
		}
	}

	async function copySelection() {
		const selectedText = globalThis.getSelection()?.toString().trim();
		if (!selectedText) return;

		await navigator.clipboard?.writeText(selectedText);
	}

	async function submit() {
		const command = input.trim();
		if (!command) return;

		const commandCwd = cwd;
		const start = performance.now();
		const promptIndex = history.length;
		history = [...history, { kind: 'prompt', command, cwd: commandCwd, took: '' }];
		input = '';
		runCommand(command);
		const took = elapsedTime(performance.now() - start);
		history = history.map((line, index) =>
			index === promptIndex && line.kind === 'prompt' ? { ...line, took } : line
		);
		await scrollToPrompt();
	}

	function runCommand(command: string) {
		const [name, ...args] = command.split(/\s+/);
		const target = args.join(' ');

		if (name === 'clear') {
			history = [];
			blogBrowserVisible = false;
			return;
		}

		if (name === 'pwd') {
			print([cwd === '~' ? '/home/sherlock' : `/home/sherlock/${cwd}`]);
			return;
		}

		if (name === 'cd') {
			changeDirectory(target || '~');
			return;
		}

		if (name === 'help') {
			print([
				'Commands:',
				...commands.map((entry) => `  ${entry}`),
				'',
				'Tip: `ls` renders the blog folder tree; `cat <path>` opens a post inline.'
			]);
			return;
		}

		if (name === 'about') {
			print([
				'About',
				'  I build security-focused software, terminal tools, and write CTF notes.',
				'  This site behaves like a tiny multiplexer for posts, links, and experiments.'
			]);
			return;
		}

		if (name === 'info') {
			print([
				'Info',
				'  stack: SvelteKit, TypeScript, Flexoki, Sarasa SC Mono Nerd Font',
				'  links: github / blog / contact placeholders',
				'  focus: security, systems, web, and terminal-first workflows'
			]);
			return;
		}

		if (name === 'ls') {
			listDirectory(target);
			return;
		}

		if (name === 'tree') {
			treeDirectory(target);
			return;
		}

		if (name === 'blog') {
			void openBlogSearch();
			print(['opened blog browser'], 'success');
			return;
		}

		if (name === 'cat' || name === 'open') {
			const path = resolvePath(target);
			const post = posts.find((entry) => entry.path === path);
			if (!post) {
				print([`${name}: ${target}: no such markdown file`], 'error');
				return;
			}
			selectedPath = post.path;
			blogBrowserVisible = false;
			sideReaderVisible = false;
			history = [...history, { kind: 'post', path: post.path }];
			return;
		}

		if (name === 'theme') {
			if (target === 'dark' || target === 'light') {
				theme = target;
				print([`theme set to flexoki ${target}`], 'success');
			} else {
				print(['usage: theme dark|light'], 'error');
			}
			return;
		}

		print([`${name}: command not found`], 'error');
	}

	function promptLabel() {
		return cwd;
	}

	function elapsedTime(milliseconds: number) {
		return milliseconds < 1000
			? `${Math.max(1, Math.round(milliseconds))}ms`
			: `${Math.round(milliseconds / 1000)}s`;
	}

	function changeDirectory(target: string) {
		const path = normalizePath(target);
		if (path === '~' || directoryExists(path)) {
			cwd = path;
			return;
		}
		print([`cd: no such file or directory: ${target}`], 'error');
	}

	function listDirectory(target: string) {
		const path = target ? normalizePath(target) : cwd;

		if (path === '~') {
			print(['blog']);
			return;
		}

		const children = childNames(path);
		if (children.length) {
			print(children);
			return;
		}

		const post = posts.find((entry) => entry.path === path);
		if (post) {
			print([`${post.path}.md`]);
			return;
		}

		print([`ls: cannot access '${target}': no such directory`], 'error');
	}

	function treeDirectory(target: string) {
		const path = target ? normalizePath(target) : cwd;

		if (path === '~') {
			print(['blog', ...tree.map((line) => `  ${line}`)]);
			return;
		}

		if (path === 'blog') {
			print(['blog', ...tree.map((line) => `  ${line}`)]);
			return;
		}

		const entries = childEntries(path);
		if (!entries.length) {
			print([`tree: ${target}: no such directory`], 'error');
			return;
		}

		print([path, ...drawEntriesTree(path).map((line) => `  ${line}`)]);
	}

	function normalizePath(target: string) {
		if (!target || target === '~' || target === '/') return '~';
		const base =
			cwd === '~' || target.startsWith('/') || target.startsWith('~') ? [] : cwd.split('/');
		const rawParts = target.replace(/^~\/?/, '').replace(/^\//, '').split('/');
		const parts = [...base];

		for (const part of rawParts) {
			if (!part || part === '.') continue;
			if (part === '..') parts.pop();
			else parts.push(part);
		}

		return parts.length ? parts.join('/') : '~';
	}

	function resolvePath(target: string) {
		const path = normalizePath(target);
		if (posts.find((post) => post.path === path)) return path;
		if (!path.startsWith('blog/') && posts.find((post) => post.path === `blog/${path}`)) {
			return `blog/${path}`;
		}
		return undefined;
	}

	function directoryExists(path: string) {
		return posts.some((post) => post.path === path || post.path.startsWith(`${path}/`));
	}

	function childNames(path: string) {
		return childEntries(path).map((entry) => entry.name);
	}

	function childEntries(path: string) {
		const prefix = path === '~' ? '' : `${path}/`;
		const children: { name: string; path: string; directory: boolean }[] = [];

		for (const post of posts) {
			if (!post.path.startsWith(prefix)) continue;
			const child = post.path.slice(prefix.length).split('/')[0];
			if (!child) continue;

			const childPath = prefix ? `${path}/${child}` : child;
			const directory = post.path !== childPath;
			const name = child;

			if (!children.some((entry) => entry.path === childPath)) {
				children.push({ name, path: childPath, directory });
			}
		}

		return children.sort(
			(a, b) => Number(b.directory) - Number(a.directory) || a.name.localeCompare(b.name)
		);
	}

	async function openBlogSearch() {
		blogBrowserVisible = true;
		fzfIndex = Math.max(
			0,
			fzfResults.findIndex((post) => post.path === selectedPath)
		);
		await tick();
		fzfInput?.focus();
	}

	function searchPosts(query: string) {
		const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

		if (!terms.length) return posts;

		return posts.filter((post) => {
			const tagTerms = terms.filter((term) => term.startsWith('#')).map((term) => term.slice(1));
			const pathTerms = terms.filter((term) => term.startsWith('/')).map((term) => term.slice(1));
			const textTerms = terms.filter((term) => !term.startsWith('#') && !term.startsWith('/'));
			const haystack = [post.title, post.path, post.date, post.tags.join(' '), post.markdown]
				.join('\n')
				.toLowerCase();
			const tags = post.tags.map((tag) => tag.toLowerCase());
			const path = post.path.toLowerCase();
			return (
				tagTerms.every((term) => tags.some((tag) => tag.includes(term))) &&
				pathTerms.every((term) => path.includes(term)) &&
				textTerms.every((term) => haystack.includes(term))
			);
		});
	}

	function moveFzfSelection(delta: number) {
		if (!fzfResults.length) return;
		fzfIndex = (fzfIndex + delta + fzfResults.length) % fzfResults.length;
		selectedPath = fzfResults[fzfIndex].path;
	}

	function openFzfSelection() {
		const post = fzfResults[fzfIndex];
		if (!post) return;

		selectedPath = post.path;
		sideReaderVisible = true;
		blogBrowserVisible = false;
		promptInput.focus();
	}

	function handleFzfKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowUp') {
			event.preventDefault();
			moveFzfSelection(-1);
		}
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			moveFzfSelection(1);
		}
		if (event.key === 'Enter') {
			event.preventDefault();
			openFzfSelection();
		}
		if (event.key === 'Escape') {
			event.preventDefault();
			blogBrowserVisible = false;
			promptInput.focus();
		}
	}

	function selectFzfResult(index: number) {
		fzfIndex = index;
		selectedPath = fzfResults[index]?.path ?? selectedPath;
		fzfInput?.focus();
	}

	function postExcerpt(post: BlogPost) {
		return (
			post.markdown
				.split('\n')
				.find((line) => line.trim() && !line.startsWith('#') && !line.startsWith('```')) ?? ''
		);
	}

	function findPost(path: string) {
		return posts.find((post) => post.path === path);
	}

	function postBlocks(post: BlogPost) {
		return parseMarkdown(post.markdown);
	}

	function childLinks(path: string) {
		return childEntries(path).map((entry) => ({
			...entry,
			url: `/${entry.path}`
		}));
	}

	function matchingPreview(post: BlogPost) {
		const terms = fzfQuery
			.toLowerCase()
			.split(/\s+/)
			.filter((term) => term && !term.startsWith('#') && !term.startsWith('/'));

		if (!terms.length) return postExcerpt(post);

		return (
			post.markdown
				.split('\n')
				.find((line) => terms.some((term) => line.toLowerCase().includes(term))) ??
			postExcerpt(post)
		);
	}

	function print(lines: string[], kind: Exclude<LineKind, 'prompt'> = 'output') {
		history = [...history, ...lines.map((text) => ({ kind, text }))];
	}

	function renderTree(paths: string[]) {
		const root: Record<string, unknown> = {};
		for (const path of paths) {
			let node = root;
			for (const part of path.split('/')) {
				node[part] ??= {};
				node = node[part] as Record<string, unknown>;
			}
		}
		return drawNode(root.blog as Record<string, unknown>);
	}

	function drawNode(node: Record<string, unknown>, prefix = ''): string[] {
		const entries = Object.keys(node).sort();
		return entries.flatMap((entry, index) => {
			const last = index === entries.length - 1;
			const branch = last ? '└── ' : '├── ';
			const nextPrefix = prefix + (last ? '    ' : '│   ');
			const child = node[entry] as Record<string, unknown>;
			const directory = Object.keys(child).length > 0;
			return [
				`${prefix}${branch}${directory ? ' ' : ' '}${entry}`,
				...drawNode(child, nextPrefix)
			];
		});
	}

	function drawEntriesTree(path: string, prefix = ''): string[] {
		const entries = childEntries(path);

		return entries.flatMap((entry, index) => {
			const last = index === entries.length - 1;
			const branch = last ? '└── ' : '├── ';
			const nextPrefix = prefix + (last ? '    ' : '│   ');

			return [
				`${prefix}${branch}${entry.directory ? ' ' : ' '}${entry.name}`,
				...(entry.directory ? drawEntriesTree(entry.path, nextPrefix) : [])
			];
		});
	}

	function parseMarkdown(markdown: string): MdBlock[] {
		return marked.lexer(markdown).flatMap((token): MdBlock[] => {
			if (token.type === 'heading') {
				return [{ type: 'heading', level: token.depth, text: token.text }];
			}
			if (token.type === 'paragraph') {
				return [{ type: 'paragraph', text: token.text }];
			}
			if (token.type === 'list') {
				return [{ type: 'list', items: token.items.map((item: Tokens.ListItem) => item.text) }];
			}
			if (token.type === 'code') {
				const code = token as Tokens.Code;
				return [
					{
						type: 'code',
						language: code.lang || 'text',
						code: code.text,
						html: highlightedCode[codeKey(code.text, code.lang || 'text')] ?? escapeHtml(code.text)
					}
				];
			}
			if (token.type === 'blockquote') {
				return [{ type: 'quote', text: token.text }];
			}
			if (token.type === 'hr') {
				return [{ type: 'hr' }];
			}
			return [];
		});
	}

	async function highlightCodeBlocks(markdown: string) {
		const codeBlocks = marked
			.lexer(markdown)
			.filter((token): token is Tokens.Code => token.type === 'code');

		const entries = await Promise.all(
			codeBlocks.map(async (block) => {
				const language = block.lang || 'text';
				const html = await codeToHtml(block.text, {
					lang: language,
					theme: theme === 'dark' ? 'vitesse-dark' : 'vitesse-light'
				});
				return [codeKey(block.text, language), html] as const;
			})
		);

		highlightedCode = Object.fromEntries(entries);
	}

	function codeKey(code: string, language: string) {
		return `${language}:${code}`;
	}

	function escapeHtml(value: string) {
		return value
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;')
			.replaceAll("'", '&#39;');
	}

	async function scrollToPrompt() {
		await tick();
		terminalViewport.scrollTop = terminalViewport.scrollHeight;
	}
</script>

<svelte:head>
	<title>personal-website</title>
	<meta
		name="description"
		content="A terminal multiplexer inspired personal website with blog posts as folders."
	/>
</svelte:head>

<main class:light={theme === 'light'} class="workspace">
	<section class:side-open={sideReaderVisible} class="panes">
		<article class="pane shell-pane active">
			<div class="pane-chrome">
				<span class="pane-title">Terminal-Style Personal Website</span>
			</div>
			<div
				bind:this={terminalViewport}
				class="terminal-output"
				aria-live="polite"
				role="application"
				onpointerdown={focusPrompt}
				onpointerup={copySelection}
			>
				{#each history as line, index (index)}
					{#if line.kind === 'prompt'}
						<div class="prompt-block">
							<div class="prompt-meta">
								<span class="cwd">{line.cwd}</span>
								{#if line.took}
									<span> took </span>
									<span class="duration">{line.took}</span>
								{/if}
							</div>
							<pre class="prompt-command"><span class="chevron">❯</span> {line.command}</pre>
						</div>
					{:else if line.kind === 'post'}
						{@const post = findPost(line.path)}
						{#if post}
							<div class="inline-reader">
								<div class="post-meta">
									<span class="green">opened</span>
									<span>{post.path}.md</span>
								</div>
								<div class="markdown">
									{#each postBlocks(post) as block, blockIndex (blockIndex)}
										{#if block.type === 'heading'}
											<svelte:element this={`h${Math.min(block.level, 3)}`}
												>{block.text}</svelte:element
											>
											{#if blockIndex === 0}
												<div class="post-title-meta">
													<span>{post.date}</span>
													{#each post.tags as tag (tag)}
														<span>#{tag}</span>
													{/each}
												</div>
											{/if}
										{:else if block.type === 'paragraph'}
											<p>{block.text}</p>
										{:else if block.type === 'list'}
											<ul>
												{#each block.items as item (item)}
													<li>{item}</li>
												{/each}
											</ul>
										{:else if block.type === 'quote'}
											<blockquote>{block.text}</blockquote>
										{:else if block.type === 'code'}
											<div class="bat">
												<HighlightedCode html={block.html} />
											</div>
										{:else}
											<hr />
										{/if}
									{/each}
								</div>
							</div>
						{/if}
					{:else if line.kind === 'links'}
						<div class="route-links">
							<div class="post-meta">
								<span class="green">listing</span>
								<span>{line.path}</span>
							</div>
							{#each childLinks(line.path) as entry (entry.path)}
								<a href={entry.url}>{entry.directory ? '' : ''} {entry.name}</a>
							{/each}
						</div>
					{:else}
						<pre class={line.kind}>{line.text}</pre>
					{/if}
				{/each}

				{#if blogBrowserVisible}
					<div class="fzf-browser">
						<div class="fzf-header">
							<span>~/blog</span>
							<span>{fzfResults.length}/{posts.length} posts</span>
						</div>
						<label class="fzf-search">
							<span>query</span>
							<input
								bind:this={fzfInput}
								bind:value={fzfQuery}
								aria-label="search blog posts"
								autocomplete="off"
								oninput={() => (
									(fzfIndex = 0),
									(selectedPath = fzfResults[0]?.path ?? selectedPath)
								)}
								onkeydown={handleFzfKeydown}
							/>
						</label>
						<div class="fzf-body">
							<div class="fzf-results">
								{#each fzfResults as post, index (post.path)}
									<button
										type="button"
										class:selected={index === fzfIndex}
										class="fzf-row"
										onclick={() => selectFzfResult(index)}
										ondblclick={openFzfSelection}
									>
										<span class="fzf-title">{post.title}</span>
										<span class="fzf-meta">
											<span class="fzf-tags">
												{#each post.tags as tag (tag)}
													<span>#{tag}</span>
												{/each}
											</span>
											<span class="fzf-path">{post.path}</span>
										</span>
									</button>
								{/each}
							</div>
							<div class="fzf-preview">
								<div class="fzf-preview-label">preview</div>
								<div class="preview-title">{selectedPost.title}</div>
								<div class="preview-meta">{selectedPost.date} · {selectedPost.tags.join(', ')}</div>
								<p>{matchingPreview(selectedPost)}</p>
								<div class="preview-hint">cat {selectedPost.path}</div>
							</div>
						</div>
					</div>
				{/if}

				<form class="prompt" onsubmit={(event) => (event.preventDefault(), submit())}>
					<div class="prompt-meta">
						<span class="cwd">{promptLabel()}</span>
					</div>
					<label class="prompt-input">
						<span class="chevron">❯</span>
						<input
							bind:this={promptInput}
							bind:value={input}
							aria-label="terminal command"
							autocomplete="off"
							onkeydown={handlePromptKeydown}
						/>
					</label>
				</form>
			</div>
		</article>
		{#if sideReaderVisible}
			<aside class="side-reader pane active">
				<div class="pane-chrome">
					<span class="pane-title">{selectedPost.title}</span>
					<button
						type="button"
						class="close-pane"
						aria-label="close side reader"
						onclick={() => (sideReaderVisible = false)}
					>
						×
					</button>
					<span class="pane-title-spacer"></span>
				</div>
				<div class="side-reader-content">
					<header class="side-post-header">
						<h1>{selectedPost.title}</h1>
						<div class="post-meta">
							<span>{selectedPost.date}</span>
							{#each selectedPost.tags as tag (tag)}
								<span>#{tag}</span>
							{/each}
						</div>
					</header>
					<div class="markdown">
						{#each sidePostBlocks as block, blockIndex (blockIndex)}
							{#if block.type === 'heading'}
								<svelte:element this={`h${Math.min(block.level, 3)}`}>{block.text}</svelte:element>
							{:else if block.type === 'paragraph'}
								<p>{block.text}</p>
							{:else if block.type === 'list'}
								<ul>
									{#each block.items as item (item)}
										<li>{item}</li>
									{/each}
								</ul>
							{:else if block.type === 'quote'}
								<blockquote>{block.text}</blockquote>
							{:else if block.type === 'code'}
								<div class="bat">
									<HighlightedCode html={block.html} />
								</div>
							{:else}
								<hr />
							{/if}
						{/each}
					</div>
				</div>
			</aside>
		{/if}
	</section>
</main>
