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

<div class="mt-[12px] border border-[var(--hard-border)] bg-[var(--bg)]">
	<div
		class="flex justify-between gap-[12px] border-b border-[var(--hard-border)] bg-[var(--bg-2)] px-[8px] py-[4px] text-[var(--yellow)] max-[760px]:grid max-[760px]:grid-cols-1 max-[760px]:gap-[2px]"
	>
		<span>~/blog</span>
		<span>{results.length}/{posts.length} posts</span>
	</div>
	<div
		class="grid grid-cols-[minmax(0,1fr)_auto] gap-[12px] border-b border-[var(--border)] px-[8px] py-[6px] max-[760px]:grid-cols-1 max-[760px]:gap-[8px]"
	>
		<label
			class="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-[10px] max-[760px]:grid-cols-1 max-[760px]:gap-[4px]"
		>
			<span class="text-[var(--tx-2)]">query</span>
			<input
				bind:this={inputRef}
				bind:value={query}
				aria-label="search blog posts"
				autocomplete="off"
				oninput={onQueryInput}
				onkeydown={onKeydown}
				class="min-w-0 border-0 bg-transparent text-[var(--tx)] caret-[var(--yellow)] outline-none max-[760px]:min-h-[34px] max-[760px]:text-[16px]"
			/>
		</label>
		<label
			class="grid min-w-0 grid-cols-[auto_minmax(104px,1fr)] items-center gap-[10px] max-[760px]:grid-cols-1 max-[760px]:gap-[4px]"
		>
			<span class="text-[var(--tx-2)]">sort</span>
			<div class="relative min-w-0" onfocusout={handleSortFocusOut}>
				<button
					type="button"
					class="inline-flex h-[26px] w-full cursor-pointer items-center justify-between gap-[10px] border border-[var(--border)] bg-[var(--bg)] px-[8px] text-[var(--yellow)] shadow-[inset_0_-1px_0_var(--ui-2)] focus-visible:border-[var(--yellow)] focus-visible:ring-1 focus-visible:ring-[var(--yellow)] focus-visible:outline-none max-[760px]:min-h-[34px] max-[760px]:text-[16px]"
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
					<div
						id="fzf-sort-menu"
						class="absolute top-[calc(100%_+_6px)] right-0 left-0 z-[6] border border-[var(--border)] bg-[var(--bg)] shadow-[0_8px_18px_rgba(0,0,0,0.35)]"
						role="listbox"
					>
						{#each sortOptions as option (option.value)}
							<button
								type="button"
								class={`w-full cursor-pointer px-[8px] py-[4px] text-left ${option.value === sort ? 'bg-[var(--yellow)] text-[var(--bg)]' : 'text-[var(--tx)]'} hover:bg-[var(--yellow)] hover:text-[var(--bg)]`}
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
	<div
		class="grid min-h-[220px] grid-cols-[minmax(360px,1fr)_minmax(220px,0.55fr)] max-[760px]:grid-cols-1"
	>
		<div
			class="min-w-0 border-r border-[var(--border)] p-[6px] max-[760px]:border-r-0 max-[760px]:border-b max-[760px]:border-[var(--border)]"
			style="counter-reset: post-row"
		>
			{#if results.length}
				<div
					class="grid grid-cols-[minmax(180px,1.4fr)_10ch_minmax(120px,0.8fr)_minmax(140px,1fr)] gap-[12px] border-b border-[var(--border)] px-[6px] pb-[4px] font-bold text-[var(--yellow)] max-[760px]:hidden"
					aria-hidden="true"
				>
					<span>title</span>
					<span>date</span>
					<span>tags</span>
					<span>path</span>
				</div>
				{#each results as post, index (post.path)}
					<button
						type="button"
						class={`grid w-full cursor-pointer grid-cols-[minmax(180px,1.4fr)_10ch_minmax(120px,0.8fr)_minmax(140px,1fr)] gap-[12px] px-[6px] py-[4px] text-left ${index === selectedIndex ? 'bg-[var(--yellow)] text-[var(--bg)]' : 'text-[var(--tx)]'} max-[760px]:min-h-[84px] max-[760px]:touch-manipulation max-[760px]:grid-cols-1 max-[760px]:gap-[2px] max-[760px]:border-b max-[760px]:border-[var(--border)] max-[760px]:px-[8px] max-[760px]:py-[10px] max-[760px]:before:text-[var(--tx-2)] max-[760px]:before:content-[counter(post-row,decimal-leading-zero)]`}
						style="counter-increment: post-row"
						onclick={() => handleResultClick(index)}
						ondblclick={() => onOpen(index)}
					>
						<span
							class="overflow-hidden [overflow-wrap:anywhere] text-ellipsis max-[760px]:pointer-events-none max-[760px]:font-bold"
						>
							{post.title}
						</span>
						<span class="opacity-[0.85] max-[760px]:pointer-events-none">
							{formatPostDate(post.date)}
						</span>
						<span class="flex flex-wrap gap-[6px] opacity-[0.75] max-[760px]:pointer-events-none">
							{#each post.tags as tag (tag)}
								<span>#{tag}</span>
							{/each}
						</span>
						<span
							class="[overflow-wrap:anywhere] opacity-[0.55] max-[760px]:pointer-events-none max-[760px]:before:content-['cat_']"
						>
							{post.path}
						</span>
					</button>
				{/each}
			{:else}
				<div class="px-[8px] py-[8px] text-[var(--tx-2)]">no matching posts</div>
			{/if}
		</div>
		<div class="flex min-h-0 min-w-0 flex-col max-[760px]:hidden">
			{#if results.length}
				<div
					class="mb-[6px] flex justify-between gap-[12px] text-[var(--tx-2)] max-[760px]:grid max-[760px]:grid-cols-1 max-[760px]:gap-[2px]"
				>
					<span>preview</span>
					<span>cat {selectedPost.path}</span>
				</div>
				<div
					class="prose max-h-[380px] max-w-none flex-1 overflow-auto pr-[4px] text-[16px] leading-[1.58] text-[var(--tx)] prose-headings:mt-0 prose-headings:mb-[12px] prose-headings:leading-[1.15] prose-headings:font-bold prose-h1:text-[19px] prose-h1:text-[var(--yellow)] prose-h2:text-[16px] prose-h2:text-[var(--orange)] prose-h3:text-[17px] prose-h3:text-[var(--green)] prose-p:mb-[16px] prose-p:text-justify prose-p:whitespace-pre-line prose-p:[text-justify:inter-word] prose-blockquote:mb-[16px] prose-blockquote:border-l-4 prose-blockquote:border-[var(--cyan)] prose-blockquote:bg-[var(--bg-2)] prose-blockquote:px-[12px] prose-blockquote:py-[8px] prose-blockquote:text-justify prose-blockquote:font-normal prose-blockquote:whitespace-pre-line prose-blockquote:text-[var(--tx)] prose-blockquote:not-italic prose-blockquote:[text-justify:inter-word] prose-blockquote:before:content-none prose-blockquote:after:content-none prose-strong:font-bold prose-strong:text-[var(--yellow)] prose-em:text-[var(--cyan)] prose-em:italic prose-code:rounded-none prose-code:bg-[var(--bg-2)] prose-code:px-[4px] prose-code:py-0 prose-code:text-[var(--yellow)] prose-code:before:content-none prose-code:after:content-none prose-ol:list-decimal prose-ol:pl-[24px] prose-ul:mb-[16px] prose-ul:list-disc prose-ul:pl-[24px] prose-li:mb-[8px] prose-li:text-justify prose-li:whitespace-pre-line prose-li:[text-justify:inter-word] prose-li:marker:text-[var(--yellow)] prose-img:mx-auto prose-img:my-[14px] prose-img:mb-[18px] prose-img:border prose-img:border-[var(--border)] prose-hr:my-[18px] prose-hr:border-t prose-hr:border-[var(--border)]"
				>
					<MarkdownBlocks blocks={previewBlocks} post={selectedPost} showHeadingMeta />
				</div>
			{:else}
				<div class="px-[8px] py-[8px] text-[var(--tx-2)]">
					adjust query or clear it to see posts
				</div>
			{/if}
		</div>
	</div>
</div>
