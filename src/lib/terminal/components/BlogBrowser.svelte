<script lang="ts">
	import type { BlogPost, BlogSort, MdBlock } from '../types';
	import { formatPostDate } from '../date';
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
		onOpen
	}: {
		posts: BlogPost[];
		results: BlogPost[];
		selectedIndex: number;
		selectedPost: BlogPost;
		previewBlocks: MdBlock[];
		sort: BlogSort;
		query?: string;
		inputRef?: HTMLInputElement;
		onQueryInput: () => void;
		onKeydown: (event: KeyboardEvent) => void;
		onSortChange: (sort: BlogSort) => void;
		onSelect: (index: number) => void;
		onOpen: (index: number) => void;
	} = $props();

	const sortOptions: { value: BlogSort; label: string }[] = [
		{ value: 'date-desc', label: 'newest' },
		{ value: 'date-asc', label: 'oldest' },
		{ value: 'title-asc', label: 'title' },
		{ value: 'path-asc', label: 'path' }
	];

	let sortOpen = $state(false);
	let sortLabel = $derived(sortOptions.find((option) => option.value === sort)?.label ?? 'newest');

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
		if (window.matchMedia('(max-width: 760px)').matches) {
			onOpen(index);
		}
	}
</script>

<div class="blog-browser">
	<div class="blog-browser-header">
		<span>~/blog</span>
		<span>{results.length}/{posts.length} posts</span>
	</div>
	<div class="blog-browser-toolbar">
		<label class="blog-browser-field blog-browser-field-query">
			<span class="text-[var(--tx-2)]">query</span>
			<input
				bind:this={inputRef}
				bind:value={query}
				aria-label="search blog posts"
				autocomplete="off"
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
						{#each sortOptions as option (option.value)}
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
		<div class="blog-browser-results" style="counter-reset: post-row">
			{#if results.length}
				<div class="blog-browser-results-header" aria-hidden="true">
					<span>title</span>
					<span>date</span>
					<span>tags</span>
					<span>path</span>
				</div>
				{#each results as post, index (post.path)}
					<button
						type="button"
						class={`blog-browser-row ${index === selectedIndex ? 'bg-[var(--yellow)] text-[var(--bg)]' : 'text-[var(--tx)]'}`}
						style="counter-increment: post-row"
						onclick={() => handleResultClick(index)}
						ondblclick={() => onOpen(index)}
					>
						<span
							class="min-w-0 [overflow-wrap:anywhere] whitespace-normal max-[760px]:pointer-events-none max-[760px]:font-bold"
						>
							{post.title}
						</span>
						<span class="min-w-0 whitespace-normal opacity-[0.85] max-[760px]:pointer-events-none">
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
		<div class="blog-browser-preview">
			{#if results.length}
				<div class="blog-browser-preview-header">
					<span>preview</span>
					<span>cat {selectedPost.path}</span>
				</div>
				<div class="terminal-prose terminal-prose-preview">
					<MarkdownBlocks blocks={previewBlocks} post={selectedPost} showHeadingMeta />
				</div>
			{:else}
				<div class="blog-browser-empty">adjust query or clear it to see posts</div>
			{/if}
		</div>
	</div>
</div>
