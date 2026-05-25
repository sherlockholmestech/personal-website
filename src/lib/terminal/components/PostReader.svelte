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

	const tocDepthClasses = [
		'text-[var(--tx)] font-bold',
		"mt-[2px] pl-[24px] border-l border-[var(--border)] text-[14px] before:absolute before:left-[8px] before:text-[var(--border)] before:content-['└']",
		"mt-[4px] pl-[44px] border-l border-[var(--border)] text-[13px] before:absolute before:left-[24px] before:text-[var(--border)] before:content-['└']",
		"mt-[4px] pl-[64px] border-l border-[var(--border)] text-[12px] before:absolute before:left-[44px] before:text-[var(--border)] before:content-['└']",
		"mt-[4px] pl-[64px] border-l border-[var(--border)] text-[12px] before:absolute before:left-[44px] before:text-[var(--border)] before:content-['└']"
	];
</script>

<article class="post-reader">
	<div
		class="post-toc-bar"
	>
		<button
			type="button"
			aria-expanded={mobileTocOpen}
			aria-controls="mobile-post-toc"
			onclick={() => (mobileTocOpen = !mobileTocOpen)}
			class="post-toc-toggle"
		>
			contents
		</button>
	</div>

	<nav
		id="mobile-post-toc"
		class={`post-toc ${mobileTocOpen ? 'max-[760px]:absolute max-[760px]:top-[51px] max-[760px]:right-[9px] max-[760px]:left-[9px] max-[760px]:z-[6] max-[760px]:block max-[760px]:h-auto max-[760px]:max-h-[50vh] max-[760px]:w-auto max-[760px]:translate-y-0 max-[760px]:bg-[var(--bg)] max-[760px]:shadow-[0_12px_24px_rgba(0,0,0,0.4)]' : ''}`}
		aria-label="table of contents"
	>
		<span class="post-toc-heading">contents</span>
		{#each toc as heading (heading.id)}
			<button
				type="button"
				class={`post-toc-item ${tocDepthClasses[tocDepth(heading.level)]} ${heading.id === activeHeading ? 'bg-[var(--bg-2)] text-[var(--yellow)]' : ''}`}
				onclick={() => scrollToHeading(heading.id)}
			>
				{heading.text}
			</button>
		{/each}
	</nav>

	<div
		bind:this={contentViewport}
		class="post-content-viewport"
		onscroll={handleScroll}
	>
		<div
			class="post-content"
		>
			<header class="post-header">
				<h1
					id="post-top"
					data-heading-id="post-top"
					class="post-title"
				>
					{post.title}
				</h1>
				{#if post.description}
					<p
						class="post-description"
					>
						{post.description}
					</p>
				{/if}
				<div
					class="post-meta"
				>
					<div
						class="post-meta-row"
					>
						<span class="post-meta-label">date</span>
						<strong class="post-meta-value">
							{formatPostDate(post.date)}
						</strong>
					</div>
					<div
						class="post-meta-row"
					>
						<span class="post-meta-label">tags</span>
						<strong class="post-meta-value">
							{#each post.tags as tag (tag)}
								<span>#{tag}</span>
							{/each}
						</strong>
					</div>
				</div>
			</header>
			<div
				class="terminal-prose terminal-prose-body"
			>
				<MarkdownBlocks {blocks} />
			</div>
		</div>
	</div>
</article>
