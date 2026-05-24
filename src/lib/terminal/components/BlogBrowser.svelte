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
</script>

<div class="fzf-browser">
	<div class="fzf-header">
		<span>~/blog</span>
		<span>{results.length}/{posts.length} posts</span>
	</div>
	<div class="fzf-controls">
		<label class="fzf-search">
			<span>query</span>
			<input
				bind:this={inputRef}
				bind:value={query}
				aria-label="search blog posts"
				autocomplete="off"
				oninput={onQueryInput}
				onkeydown={onKeydown}
			/>
		</label>
		<label class="fzf-sort">
			<span>sort</span>
			<div class="fzf-select" onfocusout={handleSortFocusOut}>
				<button
					type="button"
					class="fzf-select-trigger"
					aria-haspopup="listbox"
					aria-expanded={sortOpen}
					aria-controls="fzf-sort-menu"
					onclick={toggleSortMenu}
					onkeydown={handleSortKeydown}
				>
					<span>{sortLabel}</span>
					<span class="fzf-select-chevron" aria-hidden="true">v</span>
				</button>
				{#if sortOpen}
					<div id="fzf-sort-menu" class="fzf-select-menu" role="listbox">
						{#each sortOptions as option (option.value)}
							<button
								type="button"
								class="fzf-select-option"
								class:selected={option.value === sort}
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
	<div class="fzf-body">
		<div class="fzf-results">
			{#if results.length}
				<div class="fzf-table-head" aria-hidden="true">
					<span>title</span>
					<span>date</span>
					<span>tags</span>
					<span>path</span>
				</div>
				{#each results as post, index (post.path)}
					<button
						type="button"
						class:selected={index === selectedIndex}
						class="fzf-row"
						onclick={() => onSelect(index)}
						ondblclick={() => onOpen(index)}
					>
						<span class="fzf-title">{post.title}</span>
						<span class="fzf-date">{formatPostDate(post.date)}</span>
						<span class="fzf-tags">
							{#each post.tags as tag (tag)}
								<span>#{tag}</span>
							{/each}
						</span>
						<span class="fzf-path">{post.path}</span>
					</button>
				{/each}
			{:else}
				<div class="fzf-empty">no matching posts</div>
			{/if}
		</div>
		<div class="fzf-preview">
			{#if results.length}
				<div class="fzf-preview-label">
					<span>preview</span>
					<span>cat {selectedPost.path}</span>
				</div>
				<div class="markdown fzf-preview-markdown">
					<MarkdownBlocks blocks={previewBlocks} post={selectedPost} showHeadingMeta />
				</div>
			{:else}
				<div class="fzf-empty">adjust query or clear it to see posts</div>
			{/if}
		</div>
	</div>
</div>
