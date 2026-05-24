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

<article class="relative flex h-full min-h-0 flex-1 overflow-hidden">
	<div
		class="hidden max-[760px]:sticky max-[760px]:top-0 max-[760px]:z-[5] max-[760px]:ml-[9px] max-[760px]:flex max-[760px]:min-h-[60px] max-[760px]:w-[calc(100%_-_18px)] max-[760px]:justify-start max-[760px]:gap-[8px] max-[760px]:bg-[var(--bg)] max-[760px]:py-[14px] max-[760px]:pb-[8px]"
	>
		<button
			type="button"
			aria-expanded={mobileTocOpen}
			aria-controls="mobile-post-toc"
			onclick={() => (mobileTocOpen = !mobileTocOpen)}
			class="min-h-[28px] cursor-pointer border border-[var(--border)] bg-[var(--bg)] px-[8px] py-[3px] text-[var(--yellow)]"
		>
			contents
		</button>
	</div>

	<nav
		id="mobile-post-toc"
		class={`absolute top-1/2 left-[max(18px,calc(50%_-_43ch_-_238px))] z-[2] max-h-[62vh] w-[200px] -translate-y-1/2 overflow-auto border border-[var(--border)] bg-[color-mix(in_srgb,_var(--bg)_94%,_transparent)] p-[10px] max-[760px]:hidden ${mobileTocOpen ? 'max-[760px]:absolute max-[760px]:top-[51px] max-[760px]:right-[9px] max-[760px]:left-[9px] max-[760px]:z-[6] max-[760px]:block max-[760px]:h-auto max-[760px]:max-h-[50vh] max-[760px]:w-auto max-[760px]:translate-y-0 max-[760px]:bg-[var(--bg)] max-[760px]:shadow-[0_12px_24px_rgba(0,0,0,0.4)]' : ''}`}
		aria-label="table of contents"
	>
		<span class="mb-[8px] block font-bold text-[var(--yellow)]">contents</span>
		{#each toc as heading (heading.id)}
			<button
				type="button"
				class={`relative block w-full cursor-pointer border-l border-transparent bg-transparent px-[4px] py-[3px] text-left text-[var(--tx-2)] hover:bg-[var(--bg-2)] hover:text-[var(--yellow)] ${tocDepthClasses[tocDepth(heading.level)]} ${heading.id === activeHeading ? 'bg-[var(--bg-2)] text-[var(--yellow)]' : ''}`}
				onclick={() => scrollToHeading(heading.id)}
			>
				{heading.text}
			</button>
		{/each}
	</nav>

	<div
		bind:this={contentViewport}
		class="h-full min-h-0 overflow-auto pb-[32px] max-[760px]:h-[calc(100%_-_51px)]"
		onscroll={handleScroll}
	>
		<div
			class="min-w-0 px-[18px] pt-[18px] pb-[56px] text-[16px] max-[760px]:px-[10px] max-[760px]:pt-[14px] max-[760px]:pb-[42px] max-[760px]:text-[clamp(16px,4vw,18px)]"
		>
			<header class="mx-auto w-full max-w-[86ch]">
				<h1
					id="post-top"
					data-heading-id="post-top"
					class="mb-[10px] text-[32px] leading-[1.15] font-bold text-[var(--yellow)] max-[760px]:text-[clamp(24px,7vw,30px)]"
				>
					{post.title}
				</h1>
				{#if post.description}
					<p
						class="my-[10px] mb-[12px] max-w-[80ch] text-justify text-[var(--tx-2)] [text-justify:inter-word] max-[760px]:max-w-none max-[760px]:text-left"
					>
						{post.description}
					</p>
				{/if}
				<div
					class="mb-[18px] grid gap-[4px] text-[16px] text-[var(--tx-2)] max-[760px]:grid-cols-1 max-[760px]:gap-[2px]"
				>
					<div
						class="grid grid-cols-[8ch_minmax(0,1fr)] items-start gap-[10px] max-[760px]:grid-cols-1 max-[760px]:gap-[2px]"
					>
						<span class="font-bold text-[var(--yellow)]">date</span>
						<strong class="flex min-w-0 flex-wrap gap-[6px] font-normal [overflow-wrap:anywhere]">
							{formatPostDate(post.date)}
						</strong>
					</div>
					<div
						class="grid grid-cols-[8ch_minmax(0,1fr)] items-start gap-[10px] max-[760px]:grid-cols-1 max-[760px]:gap-[2px]"
					>
						<span class="font-bold text-[var(--yellow)]">tags</span>
						<strong class="flex min-w-0 flex-wrap gap-[6px] font-normal [overflow-wrap:anywhere]">
							{#each post.tags as tag (tag)}
								<span>#{tag}</span>
							{/each}
						</strong>
					</div>
				</div>
			</header>
			<div
				class="mx-auto prose max-w-[86ch] text-[16px] leading-[1.58] text-[var(--tx)] max-[760px]:max-w-full max-[760px]:text-[clamp(16px,4vw,18px)] max-[760px]:leading-[1.62] prose-headings:mt-0 prose-headings:mb-[12px] prose-headings:leading-[1.15] prose-headings:font-bold prose-h1:text-[26px] prose-h1:text-[var(--yellow)] max-[760px]:prose-h1:text-[clamp(22px,6vw,26px)] prose-h2:mt-[20px] prose-h2:text-[19px] prose-h2:text-[var(--orange)] max-[760px]:prose-h2:text-[clamp(18px,5vw,22px)] prose-h3:mt-[16px] prose-h3:text-[17px] prose-h3:text-[var(--green)] max-[760px]:prose-h3:text-[clamp(17px,4.6vw,20px)] prose-p:mb-[16px] prose-p:text-justify prose-p:whitespace-pre-line prose-p:[text-justify:inter-word] max-[760px]:prose-p:text-left max-[760px]:prose-p:[overflow-wrap:anywhere] prose-blockquote:mb-[16px] prose-blockquote:border-l-4 prose-blockquote:border-[var(--cyan)] prose-blockquote:bg-[var(--bg-2)] prose-blockquote:px-[12px] prose-blockquote:py-[8px] prose-blockquote:text-justify prose-blockquote:font-normal prose-blockquote:whitespace-pre-line prose-blockquote:text-[var(--tx)] prose-blockquote:not-italic prose-blockquote:[text-justify:inter-word] prose-blockquote:before:content-none prose-blockquote:after:content-none max-[760px]:prose-blockquote:text-left max-[760px]:prose-blockquote:[overflow-wrap:anywhere] prose-strong:font-bold prose-strong:text-[var(--yellow)] prose-em:text-[var(--cyan)] prose-em:italic prose-code:rounded-none prose-code:bg-[var(--bg-2)] prose-code:px-[4px] prose-code:py-0 prose-code:text-[var(--yellow)] prose-code:before:content-none prose-code:after:content-none prose-ol:list-decimal prose-ol:pl-[24px] prose-ul:mb-[16px] prose-ul:list-disc prose-ul:pl-[24px] prose-li:mb-[8px] prose-li:text-justify prose-li:whitespace-pre-line prose-li:[text-justify:inter-word] prose-li:marker:text-[var(--yellow)] max-[760px]:prose-li:text-left max-[760px]:prose-li:[overflow-wrap:anywhere] prose-img:mx-auto prose-img:my-[14px] prose-img:mb-[18px] prose-img:border prose-img:border-[var(--border)] prose-hr:my-[18px] prose-hr:border-t prose-hr:border-[var(--border)]"
			>
				<MarkdownBlocks {blocks} />
			</div>
		</div>
	</div>
</article>
