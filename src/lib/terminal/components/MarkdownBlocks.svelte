<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */

	import HighlightedCode from '$lib/HighlightedCode.svelte';
	import { formatPostDate } from '../date';
	import type { BlogPostMeta, MdBlock } from '../types';

	let {
		blocks,
		post,
		showHeadingMeta = false
	}: {
		blocks: MdBlock[];
		post?: BlogPostMeta;
		showHeadingMeta?: boolean;
	} = $props();

	function lineNumbers(code: string) {
		return Array.from({ length: code.split('\n').length }, (_, index) => index + 1);
	}
</script>

{#each blocks as block, blockIndex (blockIndex)}
	{#if block.type === 'heading'}
		<svelte:element this={`h${Math.min(block.level, 3)}`} id={block.id} data-heading-id={block.id}>
			{@html block.html}
		</svelte:element>
		{#if showHeadingMeta && blockIndex === 0 && post}
			{#if post.description}
				<p
					class="my-[10px] mb-[12px] max-w-[80ch] text-justify text-[var(--tx-2)] [text-justify:inter-word] max-[760px]:max-w-none max-[760px]:text-left"
				>
					{post.description}
				</p>
			{/if}
			<div class="my-[-6px] mb-[16px] flex flex-wrap gap-[8px] text-[var(--tx-2)]">
				<span>{formatPostDate(post.date)}</span>
				{#each post.tags as tag (tag)}
					<span>#{tag}</span>
				{/each}
			</div>
		{/if}
	{:else if block.type === 'paragraph'}
		<p>{@html block.html}</p>
	{:else if block.type === 'list'}
		<svelte:element this={block.ordered ? 'ol' : 'ul'}>
			{#each block.items as item (item)}
				<li>{@html item}</li>
			{/each}
		</svelte:element>
	{:else if block.type === 'quote'}
		<blockquote>{@html block.html}</blockquote>
	{:else if block.type === 'code'}
		<div
			class="relative my-[14px] overflow-visible border-y border-[var(--border)] bg-[var(--bg)] max-[760px]:mx-[-2px]"
		>
			<span
				class="absolute top-0 right-[12px] z-[1] -translate-y-1/2 bg-[var(--bg)] px-[6px] text-[12px] leading-none text-[var(--yellow)] lowercase"
				>{block.language}</span
			>
			<div class="grid grid-cols-[calc(5ch_+_20px)_minmax(0,1fr)] items-start max-[760px]:block">
				<ol
					class="code-line-numbers m-0 list-none justify-self-stretch border-r border-[var(--border)] py-[10px] pr-[8px] pl-[12px] text-right text-[var(--tx-2)] tabular-nums max-[760px]:hidden"
					aria-hidden="true"
				>
					{#each lineNumbers(block.code) as line (line)}
						<li>{line}</li>
					{/each}
				</ol>
				<HighlightedCode
					html={block.html}
					class="min-w-0 [&_code]:block [&_code]:bg-transparent [&_code]:text-[16px] [&_code]:leading-[1.45] [&_pre]:m-0 [&_pre]:overflow-x-auto [&_pre]:bg-transparent [&_pre]:p-[10px_12px] max-[760px]:[&_pre]:px-[10px]"
				/>
			</div>
		</div>
	{:else}
		<hr />
	{/if}
{/each}
