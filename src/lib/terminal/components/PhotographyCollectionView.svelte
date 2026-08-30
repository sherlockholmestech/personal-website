<script lang="ts">
	import type { Photograph, PhotographyCollection } from '../../../content/photography';
	import PhotographyTile from './PhotographyTile.svelte';

	let {
		collection,
		onPhotoOpen
	}: {
		collection: PhotographyCollection;
		onPhotoOpen: (photograph: Photograph) => void;
	} = $props();

	let photographGroups = $derived(
		collection.photographs.reduce(
			(groups, photograph) => {
				groups[photograph.featured ? 'featured' : 'tiled'].push(photograph);
				return groups;
			},
			{ featured: [], tiled: [] } as {
				featured: Photograph[];
				tiled: Photograph[];
			}
		)
	);
</script>

<article class="photography-collection-page">
	<div class="photography-collection-page-scroll">
		{#if collection.photographs.length}
			<div class="photography-collection-page-grid">
				{#each photographGroups.featured as photograph (photograph.id)}
					<PhotographyTile
						{photograph}
						sizes="(max-width: 760px) calc(100vw - 40px), 1080px"
						onOpen={onPhotoOpen}
					/>
				{/each}
				{#if photographGroups.tiled.length}
					<div class="photography-collection-page-columns">
						{#each photographGroups.tiled as photograph (photograph.id)}
							<PhotographyTile
								{photograph}
								sizes="(max-width: 760px) calc(100vw - 40px), 532px"
								onOpen={onPhotoOpen}
							/>
						{/each}
					</div>
				{/if}
			</div>
		{:else}
			<div class="photography-browser-empty">no photographs in this collection</div>
		{/if}
	</div>
	<header class="photography-collection-page-floating-header">
		<h1>{collection.title}</h1>
		{#if collection.description}
			<p>{collection.description}</p>
		{/if}
	</header>
</article>
