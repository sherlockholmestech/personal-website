<script lang="ts">
	import type { BlogPost, MdBlock } from '../types';
	import { formatPostDate } from '../date';
	import MarkdownBlocks from './MarkdownBlocks.svelte';

	let { post, blocks }: { post: BlogPost; blocks: MdBlock[] } = $props();
	let contentViewport = $state<HTMLDivElement>();
	let toc = $derived(blocks.filter((block) => block.type === 'heading'));
	let activeHeading = $derived(toc[0]?.id ?? '');

	function handleScroll() {
		if (!contentViewport) return;

		const headings = Array.from(contentViewport.querySelectorAll<HTMLElement>('[data-heading-id]'));
		const current = headings
			.filter((heading) => heading.offsetTop <= contentViewport!.scrollTop + 36)
			.at(-1);
		activeHeading = current?.dataset.headingId ?? toc[0]?.id ?? '';
	}

	function scrollToHeading(id: string) {
		const heading = contentViewport?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
		heading?.scrollIntoView({ block: 'start' });
	}
</script>

<article class="post-reader">
	<nav class="post-reader-toc" aria-label="table of contents">
		<span>contents</span>
		{#each toc as heading (heading.id)}
			<button
				type="button"
				class:active={heading.id === activeHeading}
				style:--depth={Math.max(0, heading.level - 2)}
				onclick={() => scrollToHeading(heading.id)}
			>
				{heading.text}
			</button>
		{/each}
	</nav>

	<div bind:this={contentViewport} class="post-reader-content" onscroll={handleScroll}>
		<div class="post-reader-main">
			<header class="post-reader-header">
				<h1>{post.title}</h1>
				{#if post.description}
					<p class="post-description">{post.description}</p>
				{/if}
				<div class="post-meta-table">
					<div>
						<span>date</span>
						<strong>{formatPostDate(post.date)}</strong>
					</div>
					<div>
						<span>tags</span>
						<strong>
							{#each post.tags as tag (tag)}
								<span>#{tag}</span>
							{/each}
						</strong>
					</div>
				</div>
			</header>
			<div class="markdown">
				<MarkdownBlocks {blocks} />
			</div>
		</div>
	</div>
</article>
