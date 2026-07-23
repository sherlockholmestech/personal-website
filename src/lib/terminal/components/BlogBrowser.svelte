<script lang="ts">
	import { tick } from 'svelte';
	import { blogSortOptions, type BlogPostMeta, type BlogSort, type MdBlock } from '../types';
	import { formatPostDate } from '../date';
	import { isMobileViewport } from '../media';
	import MarkdownBlocks from './MarkdownBlocks.svelte';

	let {
		posts,
		results,
		selectedIndex,
		selectedPost,
		previewBlocks,
		sort,
		query = $bindable(''),
		inputRef = $bindable<HTMLInputElement | undefined>(),
		onQueryInput,
		onKeydown,
		onSortChange,
		onSelect,
		onOpen,
		onClose
	}: {
		posts: BlogPostMeta[];
		results: BlogPostMeta[];
		selectedIndex: number;
		selectedPost: BlogPostMeta;
		previewBlocks: MdBlock[];
		sort: BlogSort;
		query?: string;
		inputRef?: HTMLInputElement;
		onQueryInput: () => void;
		onKeydown: (event: KeyboardEvent) => void;
		onSortChange: (sort: BlogSort) => void;
		onSelect: (index: number) => void;
		onOpen: (index: number) => void;
		onClose: () => void;
	} = $props();

	let sortOpen = $state(false);
	let resultsViewport = $state<HTMLDivElement>();
	let canScrollUp = $state(false);
	let canScrollDown = $state(false);
	let sortLabel = $derived(
		blogSortOptions.find((option) => option.value === sort)?.label ?? blogSortOptions[0].label
	);

	$effect(() => {
		const viewport = resultsViewport;
		const selectedPath = results[selectedIndex]?.path;
		void scrollSelectedResultIntoView(viewport, selectedPath);
	});

	$effect(() => {
		const viewport = resultsViewport;
		if (!viewport) return;

		const resizeObserver = new ResizeObserver(updateScrollIndicators);
		resizeObserver.observe(viewport);
		void tick().then(updateScrollIndicators);

		return () => resizeObserver.disconnect();
	});

	function updateScrollIndicators() {
		const viewport = resultsViewport;
		if (!viewport || !results.length) {
			canScrollUp = false;
			canScrollDown = false;
			return;
		}

		const threshold = 2;
		canScrollUp = viewport.scrollTop > threshold;
		canScrollDown = viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight - threshold;
	}

	async function scrollSelectedResultIntoView(viewport = resultsViewport, selectedPath?: string) {
		if (!viewport || !selectedPath) {
			updateScrollIndicators();
			return;
		}

		await tick();
		const selectedRow = viewport.querySelector<HTMLElement>('.blog-browser-row-selected');
		const header = viewport.querySelector<HTMLElement>('.blog-browser-results-header');
		if (!selectedRow) return;

		const viewportRect = viewport.getBoundingClientRect();
		const rowRect = selectedRow.getBoundingClientRect();
		const topLimit = viewportRect.top + (header?.offsetHeight ?? 0) + 14;
		const bottomLimit = viewportRect.bottom - 30;

		if (rowRect.top < topLimit) {
			viewport.scrollTop -= topLimit - rowRect.top;
		} else if (rowRect.bottom > bottomLimit) {
			viewport.scrollTop += rowRect.bottom - bottomLimit;
		}

		updateScrollIndicators();
	}

	function toggleSortMenu() {
		sortOpen = !sortOpen;
	}

	function handleSortFocusOut(event: FocusEvent) {
		const next = event.relatedTarget as Node | null;
		const currentTarget = event.currentTarget as HTMLElement | null;
		if (!currentTarget) return;
		if (!next || !currentTarget.contains(next)) {
			sortOpen = false;
		}
	}

	function handleSortKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			sortOpen = false;
		}
	}

	function selectSort(nextSort: BlogSort) {
		onSortChange(nextSort);
		sortOpen = false;
	}

	function handleResultClick(index: number) {
		onSelect(index);
		if (isMobileViewport()) {
			onOpen(index);
		}
	}
</script>

<div class="blog-browser">
	<div class="blog-browser-header">
		<span>~/blog</span>
		<span class="blog-browser-header-meta">{results.length}/{posts.length} posts</span>
		<button
			type="button"
			class="blog-browser-close"
			aria-label="close blog browser"
			onclick={onClose}
		>
			X
		</button>
	</div>
	<div class="blog-browser-toolbar">
		<label class="blog-browser-field blog-browser-field-query">
			<span class="text-[var(--tx-2)]">query</span>
			<input
				bind:this={inputRef}
				bind:value={query}
				aria-label="search blog posts"
				placeholder="type to filter posts"
				autocomplete="off"
				autocapitalize="none"
				autocorrect="off"
				enterkeyhint="search"
				spellcheck={false}
				oninput={onQueryInput}
				onkeydown={onKeydown}
				class="blog-browser-input"
			/>
		</label>
		<label class="blog-browser-field blog-browser-field-sort">
			<span class="text-[var(--tx-2)]">sort</span>
			<div class="relative min-w-0" onfocusout={handleSortFocusOut}>
				<button
					type="button"
					class="blog-browser-sort-button"
					aria-haspopup="listbox"
					aria-expanded={sortOpen}
					aria-controls="fzf-sort-menu"
					onclick={toggleSortMenu}
					onkeydown={handleSortKeydown}
				>
					<span>{sortLabel}</span>
					<span class="text-[12px] text-[var(--yellow)]" aria-hidden="true">v</span>
				</button>
				{#if sortOpen}
					<div id="fzf-sort-menu" class="blog-browser-sort-menu" role="listbox">
						{#each blogSortOptions as option (option.value)}
							<button
								type="button"
								class={`blog-browser-sort-option ${option.value === sort ? 'bg-[var(--yellow)] text-[var(--bg)]' : 'text-[var(--tx)]'}`}
								role="option"
								aria-selected={option.value === sort}
								onclick={() => selectSort(option.value)}
								onkeydown={handleSortKeydown}
							>
								{option.label}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</label>
	</div>
	<div class="blog-browser-grid">
		<div class="blog-browser-results-shell">
			{#if results.length}
				<div class="blog-browser-results-header" aria-hidden="true">
					<span>title</span>
					<span>date</span>
					<span>tags</span>
					<span>path</span>
				</div>
			{/if}
			<div
				bind:this={resultsViewport}
				class="blog-browser-results"
				style="counter-reset: post-row"
				onscroll={updateScrollIndicators}
			>
				{#if results.length}
					{#each results as post, index (post.path)}
						<button
							type="button"
							class={`blog-browser-row ${index === selectedIndex ? 'blog-browser-row-selected' : 'text-[var(--tx)]'}`}
							style="counter-increment: post-row"
							onclick={() => handleResultClick(index)}
							ondblclick={() => onOpen(index)}
						>
							<span
								class="min-w-0 [overflow-wrap:anywhere] whitespace-normal max-[760px]:pointer-events-none max-[760px]:font-bold"
							>
								{post.title}
							</span>
							<span
								class="min-w-0 whitespace-normal opacity-[0.85] max-[760px]:pointer-events-none"
							>
								{formatPostDate(post.date)}
							</span>
							<span
								class="flex min-w-0 flex-wrap gap-[6px] whitespace-normal opacity-[0.75] max-[760px]:pointer-events-none"
							>
								{#each post.tags as tag (tag)}
									<span class="min-w-0 [overflow-wrap:anywhere]">#{tag}</span>
								{/each}
							</span>
							<span
								class="min-w-0 [overflow-wrap:anywhere] whitespace-normal opacity-[0.55] max-[760px]:pointer-events-none max-[760px]:before:content-['cat_']"
							>
								{post.path}
							</span>
						</button>
					{/each}
				{:else}
					<div class="blog-browser-empty">no matching posts</div>
				{/if}
			</div>
			{#if canScrollUp}
				<div class="blog-browser-scroll-hint blog-browser-scroll-hint-top" aria-hidden="true">
					more above ↑
				</div>
			{/if}
			{#if canScrollDown}
				<div class="blog-browser-scroll-hint blog-browser-scroll-hint-bottom" aria-hidden="true">
					more posts below ↓
				</div>
			{/if}
		</div>
		<div class="blog-browser-preview">
			{#if results.length}
				<div class="blog-browser-preview-header">
					<span>preview</span>
					<span>cat {selectedPost.path}</span>
				</div>
				<div class="terminal-prose terminal-prose-preview">
					<h1>{selectedPost.title}</h1>
					{#if selectedPost.description}
						<p class="text-[var(--tx-2)]">{selectedPost.description}</p>
					{/if}
					<p class="flex flex-wrap gap-x-[10px] gap-y-[3px] text-[var(--tx-2)]">
						{formatPostDate(selectedPost.date)}
						{#each selectedPost.tags as tag (tag)}
							<span>#{tag}</span>
						{/each}
					</p>
					{#if previewBlocks.length}
						<MarkdownBlocks blocks={previewBlocks} compactCode />
					{/if}
				</div>
			{:else}
				<div class="blog-browser-empty">adjust query or clear it to see posts</div>
			{/if}
		</div>
	</div>
</div>
