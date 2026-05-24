<script lang="ts">
	import HighlightedCode from '$lib/HighlightedCode.svelte';
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
</script>

{#each blocks as block, blockIndex (blockIndex)}
	{#if block.type === 'heading'}
		<svelte:element this={`h${Math.min(block.level, 3)}`}>{block.text}</svelte:element>
		{#if showHeadingMeta && blockIndex === 0 && post}
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
