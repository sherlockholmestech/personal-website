<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */

	import HighlightedCode from '$lib/HighlightedCode.svelte';
	import { formatPostDate } from '../date';
	import type { BlogPost, MdBlock } from '../types';

	let {
		blocks,
		post,
		showHeadingMeta = false
	}: {
		blocks: MdBlock[];
		post?: BlogPost;
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
				<p class="post-description">{post.description}</p>
			{/if}
			<div class="post-title-meta">
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
		<div class="bat">
			<div class="bat-header"><span>{block.language}</span></div>
			<div class="bat-body">
				<ol class="bat-lines" aria-hidden="true">
					{#each lineNumbers(block.code) as line (line)}
						<li>{line}</li>
					{/each}
				</ol>
				<div class="bat-code">
					<HighlightedCode html={block.html} />
				</div>
			</div>
		</div>
	{:else}
		<hr />
	{/if}
{/each}
