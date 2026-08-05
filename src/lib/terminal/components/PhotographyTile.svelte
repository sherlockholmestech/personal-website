<script lang="ts">
	import type { Photograph } from '../../../content/photography';

	let {
		photograph,
		sizes,
		onOpen
	}: {
		photograph: Photograph;
		sizes: string;
		onOpen: (photograph: Photograph) => void;
	} = $props();
</script>

<figure class="photography-collection-page-frame">
	<button
		type="button"
		class="photography-collection-page-image"
		aria-label={`View photograph: ${photograph.alt}`}
		onclick={() => onOpen(photograph)}
	>
		<img
			src={photograph.thumbnailSrc ?? photograph.src}
			srcset={photograph.thumbnailSrcset}
			{sizes}
			alt={photograph.alt}
			width={photograph.width}
			height={photograph.height}
			loading="lazy"
			decoding="async"
		/>
	</button>
</figure>
