<script lang="ts">
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
</script>

{#each blocks as block, blockIndex (blockIndex)}
	{#if block.type === 'heading'}
		<svelte:element this={`h${Math.min(block.level, 3)}`}>{block.text}</svelte:element>
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
		<p>{block.text}</p>
	{:else if block.type === 'list'}
		<svelte:element this={block.ordered ? 'ol' : 'ul'}>
			{#each block.items as item (item)}
				<li>{item}</li>
			{/each}
		</svelte:element>
	{:else if block.type === 'quote'}
		<blockquote>{block.text}</blockquote>
	{:else if block.type === 'code'}
		<div class="bat">
			<div class="bat-header"><span>{block.language}</span></div>
			<div class="bat-body">
				<ol class="bat-lines" aria-hidden="true">
					{#each block.code.split('\n') as _, index (index)}
						<li>{index + 1}</li>
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
