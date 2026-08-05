<script lang="ts">
	import type { Photograph, PhotographyCollection } from '../../../content/photography';
	import { isMobileViewport } from '../media';

	let {
		collections,
		initialQuery = '',
		inputRef = $bindable<HTMLInputElement | undefined>(),
		onClose,
		onCollectionOpen,
		onPhotoOpen
	}: {
		collections: PhotographyCollection[];
		initialQuery?: string;
		inputRef?: HTMLInputElement;
		onClose: () => void;
		onCollectionOpen: (collection: PhotographyCollection) => void;
		onPhotoOpen: (collection: PhotographyCollection, photograph: Photograph) => void;
	} = $props();

	let query = $state('');
	let appliedInitialQuery = $state<string>();
	let selectedIndex = $state(0);
	let results = $derived(searchCollections(collections, query));
	let selectedCollection = $derived(results[selectedIndex] ?? results[0]);

	$effect(() => {
		if (initialQuery === appliedInitialQuery) return;
		appliedInitialQuery = initialQuery;
		query = initialQuery;
		selectedIndex = 0;
	});

	$effect(() => {
		if (!results.length) {
			selectedIndex = 0;
		} else if (selectedIndex >= results.length) {
			selectedIndex = results.length - 1;
		}
	});

	function searchCollections(photographyCollections: PhotographyCollection[], searchQuery: string) {
		const terms = normalizeSearchText(searchQuery).split(' ').filter(Boolean);
		if (!terms.length) return photographyCollections;

		return photographyCollections
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
			onCollectionOpen(selectedCollection);
		}
	}

	function selectCollection(index: number) {
		selectedIndex = index;
		if (isMobileViewport()) {
			const collection = results[index];
			if (collection) {
				onCollectionOpen(collection);
			}
		}
	}
</script>

<div class="photography-browser">
	<header class="photography-browser-header">
		<span>~/photography</span>
		<span class="photography-browser-header-meta">
			{results.length}/{collections.length} collections
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
								ondblclick={() => onCollectionOpen(collection)}
							>
								<strong>{collection.title}</strong>
								<span>{collection.description ?? 'No description'}</span>
								<span>~/photography/{collection.slug}</span>
							</button>
							<div class="photography-browser-row-thumbnails">
								{#each collection.photographs.slice(0, 3) as photograph (photograph.id)}
									<button
										type="button"
										class="photography-browser-row-thumbnail"
										aria-label={`View photograph: ${photograph.alt}`}
										onclick={() => onPhotoOpen(collection, photograph)}
									>
										<img
											src={photograph.thumbnailSrc ?? photograph.src}
											srcset={photograph.thumbnailSrcset}
											sizes="84px"
											alt={photograph.alt}
											width={photograph.width}
											height={photograph.height}
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
