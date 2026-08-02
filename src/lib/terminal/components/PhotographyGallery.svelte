<script lang="ts">
	import { tick } from 'svelte';
	import { photographRouteSlug } from '$lib/photography';
	import {
		photographyCollections,
		type Photograph,
		type PhotographyCollection
	} from '../../../content/photography';
	import { isMobileViewport } from '../media';

	let {
		initialQuery = '',
		initialCollectionSlug = '',
		initialPhotoSlug = '',
		inputRef = $bindable<HTMLInputElement | undefined>(),
		onClose,
		onCollectionOpen,
		onCollectionClose,
		onPhotoOpen,
		onPhotoClose
	}: {
		initialQuery?: string;
		initialCollectionSlug?: string;
		initialPhotoSlug?: string;
		inputRef?: HTMLInputElement;
		onClose: () => void;
		onCollectionOpen: (collection: PhotographyCollection) => void;
		onCollectionClose: () => void;
		onPhotoOpen: (collection: PhotographyCollection, photograph: Photograph) => void;
		onPhotoClose: (collection: PhotographyCollection) => void;
	} = $props();

	const browserId = $props.id();
	const dialogTitleId = `${browserId}-photography-dialog-title`;
	let query = $state('');
	let appliedInitialQuery = $state<string>();
	let selectedIndex = $state(0);
	let activeCollectionSlug = $state('');
	let selectedPhoto = $state<Photograph>();
	let selectedPhotoCollection = $state<PhotographyCollection>();
	let photoDialog = $state<HTMLDialogElement>();
	let photoViewerScroll = $state<HTMLDivElement>();
	let photoViewerImage = $state<HTMLImageElement>();
	let photoViewerMeta = $state<HTMLDivElement>();
	let photoViewerMetaHeight = $state(120);
	let photoZoomed = $state(false);
	let openedRoutePhoto = $state('');
	let suppressPhotoCloseRoute = $state(false);
	let results = $derived(searchCollections(photographyCollections, query));
	let selectedCollection = $derived(results[selectedIndex] ?? results[0]);
	let activeCollection = $derived(
		photographyCollections.find((collection) => collection.slug === activeCollectionSlug)
	);

	$effect(() => {
		if (initialQuery === appliedInitialQuery) return;
		appliedInitialQuery = initialQuery;
		query = initialQuery;
		selectedIndex = 0;
	});

	$effect(() => {
		activeCollectionSlug = initialCollectionSlug;
	});

	$effect(() => {
		if (!results.length) {
			selectedIndex = 0;
		} else if (selectedIndex >= results.length) {
			selectedIndex = results.length - 1;
		}
	});

	$effect(() => {
		const photoSlug = initialPhotoSlug;
		if (!photoSlug) {
			openedRoutePhoto = '';
			if (photoDialog?.open && selectedPhoto) {
				suppressPhotoCloseRoute = true;
				photoDialog.close();
			}
			return;
		}
		if (openedRoutePhoto === photoSlug) return;

		const collection = photographyCollections.find(
			(entry) =>
				(!initialCollectionSlug || entry.slug === initialCollectionSlug) &&
				entry.photographs.some((photograph) => photographRouteSlug(photograph) === photoSlug)
		);
		const photograph = collection?.photographs.find(
			(entry) => photographRouteSlug(entry) === photoSlug
		);
		if (!collection || !photograph) return;

		openedRoutePhoto = photoSlug;
		void openPhoto(collection, photograph, false);
	});

	$effect(() => {
		const meta = photoViewerMeta;
		if (!meta) return;

		const updateHeight = () => {
			photoViewerMetaHeight = Math.ceil(meta.getBoundingClientRect().height);
		};
		const resizeObserver = new ResizeObserver(updateHeight);
		resizeObserver.observe(meta);
		updateHeight();

		return () => resizeObserver.disconnect();
	});

	function searchCollections(collections: PhotographyCollection[], searchQuery: string) {
		const terms = normalizeSearchText(searchQuery).split(' ').filter(Boolean);
		if (!terms.length) return collections;

		return collections
			.map((collection) => ({
				collection,
				score: terms.reduce((score, term) => {
					const haystack = normalizeSearchText(
						`${collection.title} ${collection.slug} ${collection.description ?? ''}`
					);
					const matchScore = fuzzyScore(haystack, term);
					return score === -1 || matchScore === -1 ? -1 : score + matchScore;
				}, 0)
			}))
			.filter((entry) => entry.score >= 0)
			.sort((left, right) => left.score - right.score)
			.map((entry) => entry.collection);
	}

	function normalizeSearchText(value: string) {
		return value
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, ' ')
			.trim();
	}

	function fuzzyScore(haystack: string, needle: string) {
		const exactIndex = haystack.indexOf(needle);
		if (exactIndex >= 0) return exactIndex;

		let haystackIndex = 0;
		let score = haystack.length;
		for (const character of needle) {
			const matchIndex = haystack.indexOf(character, haystackIndex);
			if (matchIndex === -1) return -1;
			score += matchIndex - haystackIndex;
			haystackIndex = matchIndex + 1;
		}
		return score;
	}

	function handleQueryInput() {
		selectedIndex = 0;
	}

	function moveSelection(delta: number) {
		if (!results.length) return;
		selectedIndex = (selectedIndex + delta + results.length) % results.length;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowUp') {
			event.preventDefault();
			moveSelection(-1);
		}
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			moveSelection(1);
		}
		if (event.key === 'Enter' && selectedCollection) {
			event.preventDefault();
			openCollection(selectedCollection);
		}
	}

	function selectCollection(index: number) {
		selectedIndex = index;
		if (isMobileViewport()) {
			const collection = results[index];
			if (collection) {
				openCollection(collection);
			}
		}
	}

	function openCollection(collection: PhotographyCollection) {
		activeCollectionSlug = collection.slug;
		onCollectionOpen(collection);
	}

	function closeCollection() {
		activeCollectionSlug = '';
		onCollectionClose();
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape' || selectedPhoto) return;

		event.preventDefault();
		event.stopPropagation();
		if (activeCollection) {
			closeCollection();
			return;
		}
		onClose();
	}

	async function openPhoto(
		collection: PhotographyCollection,
		photograph: Photograph,
		updateRoute = true
	) {
		selectedPhotoCollection = collection;
		selectedPhoto = photograph;
		photoZoomed = false;
		if (updateRoute) {
			openedRoutePhoto = photographRouteSlug(photograph);
		}
		await tick();
		if (photoDialog && !photoDialog.open) {
			photoDialog.showModal();
		}
		if (updateRoute) {
			onPhotoOpen(collection, photograph);
		}
	}

	function closePhoto() {
		photoDialog?.close();
	}

	function handleDialogClose() {
		const collection = selectedPhotoCollection;
		selectedPhoto = undefined;
		selectedPhotoCollection = undefined;
		photoZoomed = false;
		if (collection && !suppressPhotoCloseRoute) {
			onPhotoClose(collection);
		}
		suppressPhotoCloseRoute = false;
	}

	function handleDialogClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			closePhoto();
		}
	}

	async function togglePhotoZoom(event: MouseEvent) {
		const targetRect = photoViewerImage?.getBoundingClientRect();
		const keyboardActivation = event.detail === 0;
		const xRatio =
			targetRect && !keyboardActivation
				? clamp((event.clientX - targetRect.left) / targetRect.width, 0, 1)
				: 0.5;
		const yRatio =
			targetRect && !keyboardActivation
				? clamp((event.clientY - targetRect.top) / targetRect.height, 0, 1)
				: 0.5;

		photoZoomed = !photoZoomed;
		await tick();
		centerPhotoZoomPoint(xRatio, yRatio);
	}

	function centerPhotoZoomPoint(xRatio: number, yRatio: number) {
		if (!photoViewerScroll || !photoViewerImage) return;

		const scrollRect = photoViewerScroll.getBoundingClientRect();
		const targetRect = photoViewerImage.getBoundingClientRect();
		const pointX = targetRect.left + targetRect.width * xRatio;
		const pointY = targetRect.top + targetRect.height * yRatio;

		photoViewerScroll.scrollLeft += pointX - (scrollRect.left + photoViewerScroll.clientWidth / 2);
		photoViewerScroll.scrollTop += pointY - (scrollRect.top + photoViewerScroll.clientHeight / 2);
	}

	function clamp(value: number, min: number, max: number) {
		return Math.min(max, Math.max(min, value));
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

{#if activeCollection}
	<article class="photography-collection-page">
		<header class="photography-collection-page-header">
			<div>
				<h1>{activeCollection.title}</h1>
				{#if activeCollection.description}
					<p>{activeCollection.description}</p>
				{/if}
			</div>
			<span class="photography-collection-page-count">
				{activeCollection.photographs.length}
				{activeCollection.photographs.length === 1 ? 'frame' : 'frames'}
			</span>
		</header>

		<div class="photography-collection-page-scroll">
			{#if activeCollection.photographs.length}
				<div class="photography-collection-page-grid">
					{#each activeCollection.photographs as photo (photo.id)}
						<figure class="photography-collection-page-frame">
							<button
								type="button"
								class="photography-collection-page-image"
								aria-label={`View ${photo.title}`}
								onclick={() => openPhoto(activeCollection, photo)}
							>
								<img
									src={photo.thumbnailSrc ?? photo.src}
									srcset={photo.thumbnailSrcset}
									sizes="(max-width: 760px) calc(100vw - 40px), 50vw"
									alt={photo.alt}
									width={photo.width}
									height={photo.height}
									loading="lazy"
									decoding="async"
								/>
							</button>
							<figcaption>
								<strong>{photo.title}</strong>
								<span>{photo.description ?? photo.alt}</span>
								{#if photo.location || photo.date || photo.camera}
									<small>
										{[photo.location, photo.date, photo.camera].filter(Boolean).join(' · ')}
									</small>
								{/if}
							</figcaption>
						</figure>
					{/each}
				</div>
			{:else}
				<div class="photography-browser-empty">no photographs in this collection</div>
			{/if}
		</div>
	</article>
{:else}
	<div class="photography-browser">
		<header class="photography-browser-header">
			<span>~/photography</span>
			<span class="photography-browser-header-meta">
				{results.length}/{photographyCollections.length} collections
			</span>
			<button
				type="button"
				class="photography-browser-close"
				aria-label="close photography browser"
				onclick={onClose}
			>
				X
			</button>
		</header>

		<div class="photography-browser-toolbar">
			<label class="photography-browser-field">
				<span class="text-[var(--tx-2)]">query</span>
				<input
					bind:this={inputRef}
					bind:value={query}
					aria-label="search photography collections"
					placeholder="type to filter collections"
					autocomplete="off"
					autocapitalize="none"
					autocorrect="off"
					enterkeyhint="search"
					spellcheck={false}
					oninput={handleQueryInput}
					onkeydown={handleKeydown}
					class="photography-browser-input"
				/>
			</label>
		</div>

		<div class="photography-browser-grid">
			<div class="photography-browser-results-shell">
				{#if results.length}
					<div class="photography-browser-results-header" aria-hidden="true">
						<div>
							<span>collection</span>
							<span>description</span>
							<span>path</span>
						</div>
						<span>preview</span>
					</div>
				{/if}
				<div class="photography-browser-results" style="counter-reset: collection-row">
					{#if results.length}
						{#each results as collection, index (collection.slug)}
							<div
								class={`photography-browser-row ${index === selectedIndex ? 'photography-browser-row-selected' : 'text-[var(--tx)]'}`}
								style="counter-increment: collection-row"
							>
								<button
									type="button"
									class="photography-browser-row-details"
									onclick={() => selectCollection(index)}
									ondblclick={() => openCollection(collection)}
								>
									<strong>{collection.title}</strong>
									<span>{collection.description ?? 'No description'}</span>
									<span>~/photography/{collection.slug}</span>
								</button>
								<div class="photography-browser-row-thumbnails">
									{#each collection.photographs.slice(0, 3) as photo (photo.id)}
										<button
											type="button"
											class="photography-browser-row-thumbnail"
											aria-label={`View ${photo.title}`}
											onclick={() => openPhoto(collection, photo)}
										>
											<img
												src={photo.thumbnailSrc ?? photo.src}
												srcset={photo.thumbnailSrcset}
												sizes="84px"
												alt={photo.alt}
												width={photo.width}
												height={photo.height}
												loading="lazy"
												decoding="async"
											/>
										</button>
									{/each}
								</div>
							</div>
						{/each}
					{:else}
						<div class="photography-browser-empty">no matching collections</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<dialog
	bind:this={photoDialog}
	class="photography-photo-viewer"
	aria-labelledby={dialogTitleId}
	onclose={handleDialogClose}
	onclick={handleDialogClick}
>
	{#if selectedPhoto}
		<div
			class="photography-photo-viewer-stage"
			style={`--photography-meta-height: ${photoViewerMetaHeight}px`}
		>
			<div bind:this={photoViewerScroll} class="photography-photo-viewer-scroll">
				<div class="photography-photo-viewer-image-stage">
					<button
						type="button"
						class={`photography-photo-viewer-image-button ${photoZoomed ? 'photography-photo-viewer-image-button-zoomed' : ''}`}
						aria-label={photoZoomed ? 'Zoom photograph out' : 'Zoom photograph in'}
						onclick={togglePhotoZoom}
					>
						<img
							bind:this={photoViewerImage}
							src={selectedPhoto.src}
							alt={selectedPhoto.alt}
							width={selectedPhoto.width}
							height={selectedPhoto.height}
							class="photography-photo-viewer-image"
						/>
					</button>
				</div>
			</div>
			<div bind:this={photoViewerMeta} class="photography-photo-viewer-meta">
				<h2 id={dialogTitleId}>{selectedPhoto.title}</h2>
				<p>{selectedPhoto.description ?? selectedPhoto.alt}</p>
				{#if selectedPhoto.location || selectedPhoto.date || selectedPhoto.camera}
					<div>
						<span>
							{[selectedPhoto.location, selectedPhoto.date, selectedPhoto.camera]
								.filter(Boolean)
								.join('; ')}
						</span>
					</div>
				{/if}
			</div>
			<button
				type="button"
				class="photography-photo-viewer-close"
				aria-label="Close photograph"
				onclick={closePhoto}
			>
				X
			</button>
		</div>
	{/if}
</dialog>
