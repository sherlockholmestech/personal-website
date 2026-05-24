<script lang="ts">
	import type { BlogPost, MdBlock } from '../types';
	import { formatPostDate } from '../date';
	import MarkdownBlocks from './MarkdownBlocks.svelte';

	type TocItem = {
		id: string;
		level: number;
		text: string;
	};

	let { post, blocks }: { post: BlogPost; blocks: MdBlock[] } = $props();
	let contentViewport = $state<HTMLDivElement>();
	let mobileTocOpen = $state(false);
	let toc = $derived<TocItem[]>([
		{ id: 'post-top', level: 1, text: post.title },
		...blocks
			.filter((block) => block.type === 'heading')
			.map((heading) => ({
				id: heading.id,
				level: heading.level,
				text: heading.text
			}))
	]);
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
		mobileTocOpen = false;
	}

	function tocDepth(level: number) {
		return Math.min(4, Math.max(0, level - 1));
	}
</script>

<article class="post-reader">
	<div class="post-reader-mobile-toolbar">
		<button
			type="button"
			aria-expanded={mobileTocOpen}
			aria-controls="mobile-post-toc"
			onclick={() => (mobileTocOpen = !mobileTocOpen)}
		>
			contents
		</button>
	</div>

	<nav
		id="mobile-post-toc"
		class="post-reader-toc"
		class:mobile-open={mobileTocOpen}
		aria-label="table of contents"
	>
		<span>contents</span>
		{#each toc as heading (heading.id)}
			<button
				type="button"
				class={`toc-depth-${tocDepth(heading.level)}`}
				class:active={heading.id === activeHeading}
				onclick={() => scrollToHeading(heading.id)}
			>
				{heading.text}
			</button>
		{/each}
	</nav>

	<div bind:this={contentViewport} class="post-reader-content" onscroll={handleScroll}>
		<div class="post-reader-main">
			<header class="post-reader-header">
				<h1 id="post-top" data-heading-id="post-top">{post.title}</h1>
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
