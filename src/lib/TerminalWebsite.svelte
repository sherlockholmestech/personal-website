<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount, tick } from 'svelte';
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
	import { searchPosts, sortPosts } from '$lib/terminal/search';
	import type { BlogPost, BlogSort, ShellLine, Theme } from '$lib/terminal/types';
	import BlogBrowser from '$lib/terminal/components/BlogBrowser.svelte';
	import HelpPanel from '$lib/terminal/components/HelpPanel.svelte';
	import MarkdownBlocks from '$lib/terminal/components/MarkdownBlocks.svelte';
	import PostReader from '$lib/terminal/components/PostReader.svelte';
	import PromptForm from '$lib/terminal/components/PromptForm.svelte';
	import RouteLinks from '$lib/terminal/components/RouteLinks.svelte';
	import SocialLinks from '$lib/terminal/components/SocialLinks.svelte';
	import WelcomeBanner from '$lib/terminal/components/WelcomeBanner.svelte';

	const ABOUT_MARKDOWN = `# About

Hello! I'm Sherlock, an average programmer that enjoys CTFs as a side quest.

You can also find me in the Model United Nations circuit occasionally.

I primarily program in Rust, though I have dipped my toes (maybe a bit too much) into web development.`;

	let { data }: { data: { posts: BlogPost[]; requestedPath?: string; notFound?: boolean } } =
		$props();
	let posts = $derived(data.posts);
	let requestedPath = $derived(data.requestedPath);
	let routeNotFound = $derived(data.notFound);

	let input = $state('');
	let cwd = $state(HOME_DIRECTORY);
	let history = $state<ShellLine[]>([{ kind: 'banner' }]);
	let selectedPath = $state('');
	let currentView = $state<'terminal' | 'post'>('terminal');
	let blogBrowserVisible = $state(false);
	let fzfQuery = $state('');
	let fzfIndex = $state(0);
	let blogSort = $state<BlogSort>('date-desc');
	let routeInitialized = $state(false);
	let theme = $state<Theme>('dark');
	let terminalViewport = $state<HTMLDivElement>();
	let promptInput = $state<HTMLInputElement>();
	let fzfInput = $state<HTMLInputElement>();
	let highlightedCode = $state<Record<string, string>>({});
	const mobileShortcuts = ['help', 'blog', 'links', 'clear', 'home'];

	let fileSystem = $derived(createFileSystem(posts));
	let selectedPost = $derived(
		posts.find((post) => post.path === selectedPath) ??
			posts[0] ?? {
				path: '',
				title: '',
				description: '',
				date: '',
				tags: [],
				markdown: ''
			}
	);
	let parsedPost = $derived(parseMarkdown(selectedPost.markdown, highlightedCode));
	let postViewBlocks = $derived(parsedPost);
	let fzfResults = $derived(sortPosts(searchPosts(posts, fzfQuery), blogSort));
	let browserSelectedPost = $derived(fzfResults[fzfIndex] ?? selectedPost);
	let browserPreviewBlocks = $derived(postBlocks(browserSelectedPost));

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
					currentView = 'post';
				} else {
					history = [...history, { kind: 'links', path: requestedPath }];
				}
			}
			routeInitialized = true;
		}
	});

	function focusPrompt(event: PointerEvent) {
		if (event.target instanceof HTMLInputElement) return;
		if (event.target instanceof HTMLElement) {
			const interactive = event.target.closest(
				'button, a, input, textarea, select, [role="button"]'
			);
			if (interactive) return;
		}
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

	async function submit() {
		const command = input.trim();
		if (!command) return;

		const commandCwd = cwd;
		history = [...history, { kind: 'prompt', command, cwd: formatPromptPath(commandCwd) }];
		input = '';
		runCommand(command);
		await scrollToPrompt();
	}

	function runCommand(command: string) {
		const [name, ...args] = command.split(/\s+/);
		const target = args.join(' ');

		if (name === 'clear') {
			history = [];
			blogBrowserVisible = false;
			if (currentView === 'post') closePostView();
			return;
		}

		if (name === 'home') {
			history = [{ kind: 'banner' }];
			blogBrowserVisible = false;
			if (currentView === 'post') closePostView();
			return;
		}

		if (name === 'banner') {
			history = [...history, { kind: 'banner' }];
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
			history = [...history, { kind: 'help' }];
			return;
		}

		if (name === 'about') {
			history = [...history, { kind: 'markdown', markdown: ABOUT_MARKDOWN }];
			return;
		}

		if (name === 'info') {
			print([
				'Sherlock Holmes',
				'  site: personal blog in a terminal shell',
				'  stack: SvelteKit, TypeScript, Flexoki, Sarasa SC Mono Nerd Font',
				'  focus: Rust, CTF notes, web development, and MUN'
			]);
			return;
		}

		if (name === 'links') {
			history = [...history, { kind: 'socials' }];
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
			fzfQuery = target;
			void openBlogSearch();
			return;
		}

		if (name === 'cat') {
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
		currentView = 'post';
		void updateUrlForView(entry.post.path);
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
		currentView = 'post';
		blogBrowserVisible = false;
		void updateUrlForView(post.path);
		promptInput?.focus();
	}

	function closePostView() {
		currentView = 'terminal';
		void updateUrlForView();
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

	function handleBlogSortChange(nextSort: BlogSort) {
		blogSort = nextSort;
		const nextResults = sortPosts(searchPosts(posts, fzfQuery), nextSort);
		fzfIndex = 0;
		selectedPath = nextResults[0]?.path ?? selectedPath;
		fzfInput?.focus();
	}

	function selectFzfResult(index: number) {
		fzfIndex = index;
		selectedPath = fzfResults[index]?.path ?? selectedPath;
		fzfInput?.focus();
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
		if (!terminalViewport) return;
		terminalViewport.scrollTop = terminalViewport.scrollHeight;
	}

	async function updateUrlForView(path?: string) {
		const route = path ? resolve(`/${path}` as `/blog/${string}`) : resolve('/');
		await goto(route, {
			keepFocus: true,
			noScroll: true,
			replaceState: false
		});
	}

	async function runShortcut(command: string) {
		input = command;
		await submit();
	}
</script>

<svelte:head>
	<title>Sherlock Holmes</title>
	<meta
		name="description"
		content="Sherlock Holmes' terminal-style personal blog on CTFs, Rust, web development, and Model United Nations."
	/>
</svelte:head>

<main class:light={theme === 'light'} class="workspace terminal-workspace">
	<section class="terminal-shell">
		<article class="terminal-window">
			<div class="terminal-titlebar">
				<span class="terminal-title">
					{currentView === 'post' ? selectedPost.title : 'Sherlock Holmes // personal blog'}
				</span>
				{#if currentView === 'post'}
					<button
						type="button"
						class="terminal-close-button"
						aria-label="close blog reader"
						onclick={closePostView}
					>
						X
					</button>
				{/if}
			</div>
			{#if currentView === 'post'}
				<PostReader post={selectedPost} blocks={postViewBlocks} />
			{:else}
				<div
					bind:this={terminalViewport}
					class="terminal-viewport"
					aria-live="polite"
					role="application"
					onpointerdown={focusPrompt}
				>
					{#each history as line, index (index)}
						{#if line.kind === 'prompt'}
							<div class="mb-[14px]">
								<div class="leading-[1.45] text-[var(--tx)]">
									<span
										class="text-[var(--cyan)] max-[760px]:text-[0px] max-[760px]:after:text-[16px] max-[760px]:after:content-['~']"
									>
										{line.cwd}
									</span>
								</div>
								<pre class="terminal-prompt-line">
									<span class="text-[var(--yellow)]">❯</span> {line.command}
								</pre>
							</div>
						{:else if line.kind === 'links'}
							<RouteLinks path={line.path} entries={childLinks(line.path)} />
						{:else if line.kind === 'socials'}
							<SocialLinks />
						{:else if line.kind === 'banner'}
							<WelcomeBanner {posts} onCommand={runShortcut} />
						{:else if line.kind === 'help'}
							<HelpPanel />
						{:else if line.kind === 'markdown'}
							<div class="mt-3 border-b border-[var(--border)]">
								<div class="terminal-prose terminal-prose-body">
									<MarkdownBlocks blocks={parseMarkdown(line.markdown, {})} />
								</div>
							</div>
						{:else}
							<pre
								class={`terminal-output-line ${line.kind === 'success' ? 'text-[var(--green)]' : line.kind === 'error' ? 'text-[var(--red)]' : line.kind === 'muted' ? 'text-[var(--tx-2)]' : ''}`}>{line.text}</pre>
						{/if}
					{/each}

					{#if blogBrowserVisible}
						<BlogBrowser
							bind:query={fzfQuery}
							bind:inputRef={fzfInput}
							{posts}
							results={fzfResults}
							selectedIndex={fzfIndex}
							selectedPost={browserSelectedPost}
							previewBlocks={browserPreviewBlocks}
							sort={blogSort}
							onQueryInput={handleQueryInput}
							onKeydown={handleFzfKeydown}
							onSortChange={handleBlogSortChange}
							onSelect={selectFzfResult}
							onOpen={openFzfSelection}
						/>
					{/if}

					<div class="terminal-shortcuts" aria-label="quick commands">
						{#each mobileShortcuts as command (command)}
							<button
								type="button"
								class="terminal-shortcut-button"
								onclick={() => runShortcut(command)}
							>
								{command}
							</button>
						{/each}
					</div>

					<PromptForm
						cwd={formatPromptPath(cwd)}
						bind:input
						bind:inputRef={promptInput}
						onKeydown={handlePromptKeydown}
						onSubmit={submit}
					/>
				</div>
			{/if}
		</article>
	</section>
</main>
