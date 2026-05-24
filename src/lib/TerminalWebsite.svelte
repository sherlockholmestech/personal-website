<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { commandExamples } from '$lib/terminal/help';
	import {
		buildTree,
		createFileSystem,
		formatPromptPath,
		HOME_DIRECTORY,
		listEntries,
		normalizePath,
		postPathFromFilePath,
		resolveEntry,
		ROOT_DIRECTORY,
		toHomeRelative
	} from '$lib/terminal/filesystem';
	import { highlightMarkdownCode, parseMarkdown } from '$lib/terminal/markdown';
	import { searchPosts } from '$lib/terminal/search';
	import type { BlogPost, ShellLine, Theme } from '$lib/terminal/types';
	import BlogBrowser from '$lib/terminal/components/BlogBrowser.svelte';
	import InlinePost from '$lib/terminal/components/InlinePost.svelte';
	import PromptForm from '$lib/terminal/components/PromptForm.svelte';
	import RouteLinks from '$lib/terminal/components/RouteLinks.svelte';
	import SideReader from '$lib/terminal/components/SideReader.svelte';

	let { data }: { data: { posts: BlogPost[]; requestedPath?: string; notFound?: boolean } } =
		$props();
	let posts = $derived(data.posts);
	let requestedPath = $derived(data.requestedPath);
	let routeNotFound = $derived(data.notFound);

	let input = $state('');
	let cwd = $state(HOME_DIRECTORY);
	let history = $state<ShellLine[]>([
		{ kind: 'success', text: 'Welcome to my terminal website.' },
		{
			kind: 'muted',
			text: 'Type `help` to list commands, or `cat ~/blog/2026/ctf/defcon.md` to read a post.'
		}
	]);
	let selectedPath = $state('');
	let sideReaderVisible = $state(false);
	let blogBrowserVisible = $state(false);
	let fzfQuery = $state('');
	let fzfIndex = $state(0);
	let routeInitialized = $state(false);
	let theme = $state<Theme>('dark');
	let terminalViewport: HTMLDivElement;
	let promptInput = $state<HTMLInputElement>();
	let fzfInput = $state<HTMLInputElement>();
	let highlightedCode = $state<Record<string, string>>({});

	let fileSystem = $derived(createFileSystem(posts));
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
	let parsedPost = $derived(parseMarkdown(selectedPost.markdown, highlightedCode));
	let sidePostBlocks = $derived(
		parsedPost.filter((block, index) => !(index === 0 && block.type === 'heading'))
	);
	let fzfResults = $derived(searchPosts(posts, fzfQuery));

	$effect(() => {
		if (!selectedPath && posts.length) {
			selectedPath = posts[0].path;
		}
	});

	onMount(async () => {
		await tick();
		promptInput?.focus();
	});

	$effect(() => {
		void updateHighlightedCode(selectedPost.markdown, theme);
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
		promptInput?.focus();
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
		history = [
			...history,
			{ kind: 'prompt', command, cwd: formatPromptPath(commandCwd), took: '' }
		];
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
			print([cwd || ROOT_DIRECTORY]);
			return;
		}

		if (name === 'cd') {
			changeDirectory(target || HOME_DIRECTORY);
			return;
		}

		if (name === 'help') {
			print([
				'Commands:',
				...commandExamples.map((entry) => `  ${entry}`),
				'',
				'Unix tips: `ls` lists directories, `cat` reads files, `cd` accepts absolute or ~/ paths.'
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
			listDirectory(target || '.');
			return;
		}

		if (name === 'tree') {
			treeDirectory(target || '.');
			return;
		}

		if (name === 'blog') {
			void openBlogSearch();
			print(['opened blog browser'], 'success');
			return;
		}

		if (name === 'cat' || name === 'open') {
			openPost(target, name);
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

	function elapsedTime(milliseconds: number) {
		return milliseconds < 1000
			? `${Math.max(1, Math.round(milliseconds))}ms`
			: `${Math.round(milliseconds / 1000)}s`;
	}

	function changeDirectory(target: string) {
		const path = normalizePath(target, cwd);
		const entry = resolveEntry(fileSystem, path);
		if (entry.type === 'directory') {
			cwd = entry.path;
			return;
		}
		if (entry.type === 'file') {
			print([`cd: ${target}: Not a directory`], 'error');
			return;
		}
		print([`cd: ${target}: No such file or directory`], 'error');
	}

	function listDirectory(target: string) {
		const path = normalizePath(target, cwd);
		const entry = resolveEntry(fileSystem, path);

		if (entry.type === 'missing') {
			print([`ls: cannot access '${target}': No such file or directory`], 'error');
			return;
		}

		if (entry.type === 'file') {
			const name = entry.filePath.split('/').pop() ?? entry.filePath;
			print([target === '.' ? name : target]);
			return;
		}

		const children = listEntries(fileSystem, entry.path);
		if (children.length) {
			print(children.map((child) => child.name));
		}
	}

	function treeDirectory(target: string) {
		const path = normalizePath(target, cwd);
		const entry = resolveEntry(fileSystem, path);

		if (entry.type === 'missing') {
			print([`tree: ${target}: No such file or directory`], 'error');
			return;
		}

		if (entry.type === 'file') {
			print([`tree: ${target}: Not a directory`], 'error');
			return;
		}

		const label = target === '.' ? '.' : formatPromptPath(entry.path);
		const lines = buildTree(fileSystem, entry.path);
		print([label, ...lines.map((line) => `  ${line}`)]);
	}

	function openPost(target: string, commandName: string) {
		if (!target) {
			print([`${commandName}: missing file operand`], 'error');
			return;
		}

		const path = normalizePath(target, cwd);
		const entry = resolveEntry(fileSystem, path);

		if (entry.type === 'missing') {
			print([`${commandName}: ${target}: No such file or directory`], 'error');
			return;
		}

		if (entry.type === 'directory') {
			print([`${commandName}: ${target}: Is a directory`], 'error');
			return;
		}

		selectedPath = entry.post.path;
		blogBrowserVisible = false;
		sideReaderVisible = false;
		history = [...history, { kind: 'post', path: entry.post.path }];
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

	function moveFzfSelection(delta: number) {
		if (!fzfResults.length) return;
		fzfIndex = (fzfIndex + delta + fzfResults.length) % fzfResults.length;
		selectedPath = fzfResults[fzfIndex].path;
	}

	function openFzfSelection(index = fzfIndex) {
		const post = fzfResults[index];
		if (!post) return;

		selectedPath = post.path;
		sideReaderVisible = true;
		blogBrowserVisible = false;
		promptInput?.focus();
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
			promptInput?.focus();
		}
	}

	function handleQueryInput() {
		fzfIndex = 0;
		selectedPath = fzfResults[0]?.path ?? selectedPath;
	}

	function selectFzfResult(index: number) {
		fzfIndex = index;
		selectedPath = fzfResults[index]?.path ?? selectedPath;
		fzfInput?.focus();
	}

	function findPost(path: string) {
		return posts.find((post) => post.path === path);
	}

	function postBlocks(post: BlogPost) {
		return parseMarkdown(post.markdown, highlightedCode);
	}

	function childLinks(path: string) {
		const directoryPath = normalizePath(path, HOME_DIRECTORY);
		const entries = listEntries(fileSystem, directoryPath);
		return entries.map((entry) => {
			const relativePath =
				entry.type === 'file' ? postPathFromFilePath(entry.path) : toHomeRelative(entry.path);
			return {
				name: entry.type === 'file' ? entry.name.replace(/\.md$/, '') : entry.name,
				path: entry.path,
				directory: entry.type === 'directory',
				url: `/${relativePath}`
			};
		});
	}

	function print(lines: string[], kind: 'output' | 'success' | 'error' | 'muted' = 'output') {
		history = [...history, ...lines.map((text) => ({ kind, text }))];
	}

	async function updateHighlightedCode(markdown: string, nextTheme: Theme) {
		highlightedCode = await highlightMarkdownCode(markdown, nextTheme);
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
							<InlinePost {post} blocks={postBlocks(post)} />
						{/if}
					{:else if line.kind === 'links'}
						<RouteLinks path={line.path} entries={childLinks(line.path)} />
					{:else}
						<pre class={line.kind}>{line.text}</pre>
					{/if}
				{/each}

				{#if blogBrowserVisible}
					<BlogBrowser
						bind:query={fzfQuery}
						bind:inputRef={fzfInput}
						{posts}
						results={fzfResults}
						selectedIndex={fzfIndex}
						{selectedPost}
						onQueryInput={handleQueryInput}
						onKeydown={handleFzfKeydown}
						onSelect={selectFzfResult}
						onOpen={openFzfSelection}
					/>
				{/if}

				<PromptForm
					cwd={formatPromptPath(cwd)}
					bind:input
					bind:inputRef={promptInput}
					onKeydown={handlePromptKeydown}
					onSubmit={submit}
				/>
			</div>
		</article>
		{#if sideReaderVisible}
			<SideReader
				post={selectedPost}
				blocks={sidePostBlocks}
				onClose={() => (sideReaderVisible = false)}
			/>
		{/if}
	</section>
</main>
