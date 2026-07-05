<script lang="ts">
	import { tick } from 'svelte';
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
	let zoomedImage = $state<{ src: string; alt: string } | null>(null);
	let imageZoomLevel = $state(0);
	let imageZoomScroll = $state<HTMLDivElement>();
	let imageZoomTarget = $state<HTMLImageElement>();
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

		const viewportTop = contentViewport.getBoundingClientRect().top;
		const scrollOffset = headingScrollOffset();
		const headings = Array.from(contentViewport.querySelectorAll<HTMLElement>('[data-heading-id]'));
		const current = headings
			.filter((heading) => heading.getBoundingClientRect().top - viewportTop <= scrollOffset + 1)
			.at(-1);
		activeHeading = current?.dataset.headingId ?? toc[0]?.id ?? '';
	}

	function scrollToHeading(id: string) {
		const heading = contentViewport?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
		if (heading && contentViewport) {
			const viewportTop = contentViewport.getBoundingClientRect().top;
			const headingTop = heading.getBoundingClientRect().top - viewportTop;
			const top = Math.max(0, contentViewport.scrollTop + headingTop - headingScrollOffset());
			contentViewport.scrollTo({ top });
		}
		mobileTocOpen = false;
	}

	function headingScrollOffset() {
		if (!contentViewport) return 0;

		const scrollPaddingTop = getComputedStyle(contentViewport).scrollPaddingTop;
		return Number.parseFloat(scrollPaddingTop) || 0;
	}

	function tocDepth(level: number) {
		return Math.min(4, Math.max(0, level - 1));
	}

	const tocDepthClasses = [
		'text-[var(--tx)] font-bold',
		'mt-[2px] pl-[20px] border-l border-[var(--border)] text-[14px]',
		'mt-[4px] pl-[36px] border-l border-[var(--border)] text-[13px]',
		'mt-[4px] pl-[52px] border-l border-[var(--border)] text-[12px]',
		'mt-[4px] pl-[52px] border-l border-[var(--border)] text-[12px]'
	];
	const imageZoomClasses = ['image-zoom-level-1', 'image-zoom-level-2'];

	$effect(() => {
		decorateMarkdownImages(blocks);
	});

	$effect(() => {
		const viewport = contentViewport;
		if (!viewport) return;

		viewport.addEventListener('click', handleContentClick);
		viewport.addEventListener('keydown', handleContentKeydown);

		return () => {
			viewport.removeEventListener('click', handleContentClick);
			viewport.removeEventListener('keydown', handleContentKeydown);
		};
	});

	function decorateMarkdownImages(currentBlocks: MdBlock[]) {
		if (!contentViewport || !currentBlocks.length) return;

		const images = contentViewport.querySelectorAll<HTMLImageElement>('.terminal-prose-body img');
		for (const image of images) {
			image.tabIndex = 0;
			image.setAttribute('role', 'button');
			image.setAttribute('aria-label', image.alt ? `Zoom image: ${image.alt}` : 'Zoom image');
		}
	}

	function imageFromTarget(target: EventTarget | null) {
		if (!(target instanceof Element)) return null;
		return target.closest<HTMLImageElement>('.terminal-prose-body img');
	}

	async function openImageZoom(image: HTMLImageElement, xRatio = 0.5, yRatio = 0.5) {
		zoomedImage = {
			src: image.currentSrc || image.src,
			alt: image.alt || 'Zoomed post image'
		};
		imageZoomLevel = 0;
		await tick();
		centerZoomPoint(xRatio, yRatio);
	}

	function handleContentClick(event: MouseEvent) {
		const image = imageFromTarget(event.target);
		if (!image) return;

		event.preventDefault();
		const rect = image.getBoundingClientRect();
		void openImageZoom(
			image,
			clamp((event.clientX - rect.left) / rect.width, 0, 1),
			clamp((event.clientY - rect.top) / rect.height, 0, 1)
		);
	}

	function handleContentKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter' && event.key !== ' ') return;

		const image = imageFromTarget(event.target);
		if (!image) return;

		event.preventDefault();
		void openImageZoom(image);
	}

	function closeImageZoom() {
		zoomedImage = null;
		imageZoomLevel = 0;
	}

	async function toggleImageZoom(event: MouseEvent) {
		const targetRect = imageZoomTarget?.getBoundingClientRect();
		const xRatio = targetRect
			? clamp((event.clientX - targetRect.left) / targetRect.width, 0, 1)
			: 0.5;
		const yRatio = targetRect
			? clamp((event.clientY - targetRect.top) / targetRect.height, 0, 1)
			: 0.5;

		imageZoomLevel = imageZoomLevel === 0 ? 1 : 0;
		await tick();
		centerZoomPoint(xRatio, yRatio);
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && zoomedImage) {
			closeImageZoom();
		}
	}

	function centerZoomPoint(xRatio: number, yRatio: number) {
		if (!imageZoomScroll || !imageZoomTarget) return;

		const scrollRect = imageZoomScroll.getBoundingClientRect();
		const targetRect = imageZoomTarget.getBoundingClientRect();
		const pointX = targetRect.left + targetRect.width * xRatio;
		const pointY = targetRect.top + targetRect.height * yRatio;

		imageZoomScroll.scrollLeft += pointX - (scrollRect.left + imageZoomScroll.clientWidth / 2);
		imageZoomScroll.scrollTop += pointY - (scrollRect.top + imageZoomScroll.clientHeight / 2);
	}

	function clamp(value: number, min: number, max: number) {
		return Math.min(max, Math.max(min, value));
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<article class="post-reader">
	<div class="post-toc-bar">
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
		role="region"
		aria-label="post content"
		onscroll={handleScroll}
	>
		<div class="post-content">
			<header class="post-header">
				<h1 id="post-top" data-heading-id="post-top" class="post-title">
					{post.title}
				</h1>
				{#if post.description}
					<p class="post-description">
						{post.description}
					</p>
				{/if}
				<div class="post-meta">
					<div class="post-meta-row">
						<span class="post-meta-label">date</span>
						<strong class="post-meta-value">
							{formatPostDate(post.date)}
						</strong>
					</div>
					<div class="post-meta-row">
						<span class="post-meta-label">tags</span>
						<strong class="post-meta-value">
							{#each post.tags as tag (tag)}
								<span>#{tag}</span>
							{/each}
						</strong>
					</div>
				</div>
			</header>
			<div class="terminal-prose terminal-prose-body">
				<MarkdownBlocks {blocks} />
			</div>
		</div>
	</div>

	{#if zoomedImage}
		<div class="image-zoom-overlay" role="dialog" aria-modal="true" aria-label="Zoomed image">
			<div bind:this={imageZoomScroll} class="image-zoom-scroll">
				<div class="image-zoom-stage">
					<button
						type="button"
						class="image-zoom-frame"
						aria-label="Toggle image zoom"
						onclick={toggleImageZoom}
					>
						<img
							bind:this={imageZoomTarget}
							src={zoomedImage.src}
							alt={zoomedImage.alt}
							class={`image-zoom-target ${imageZoomClasses[imageZoomLevel]}`}
						/>
					</button>
				</div>
			</div>
			<button
				type="button"
				class="image-zoom-close"
				aria-label="Close zoomed image"
				onclick={closeImageZoom}
			>
				X
			</button>
		</div>
	{/if}
</article>
