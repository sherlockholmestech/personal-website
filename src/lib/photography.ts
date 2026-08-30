import {
	photographyCollections,
	type Photograph,
	type PhotographyCollection
} from '../content/photography';

export type { Photograph, PhotographyCollection } from '../content/photography';

export type PhotographyRouteState = {
	collectionSlug?: string;
	photoSlug?: string;
};

const collectionsBySlug = new Map<string, PhotographyCollection>();
const photographsByCollectionSlug = new Map<string, Map<string, Photograph>>();

for (const collection of photographyCollections) {
	if (collectionsBySlug.has(collection.slug)) {
		throw new Error(`Duplicate photography collection slug: ${collection.slug}`);
	}
	collectionsBySlug.set(collection.slug, collection);

	const photographsBySlug = new Map<string, Photograph>();
	for (const photograph of collection.photographs) {
		const slug = photographRouteSlug(photograph);
		if (photographsBySlug.has(slug)) {
			throw new Error(`Duplicate photograph slug in ${collection.slug}: ${slug}`);
		}
		photographsBySlug.set(slug, photograph);
	}
	photographsByCollectionSlug.set(collection.slug, photographsBySlug);
}

export function photographFileName(photograph: Photograph) {
	return photograph.src.split('/').at(-1) ?? photograph.id;
}

export function photographRouteSlug(photograph: Photograph) {
	return photographFileName(photograph).replace(/\.[^.]+$/, '');
}

export function photographRoutePath(collection: PhotographyCollection, photograph: Photograph) {
	return `photography/${collection.slug}/${photographRouteSlug(photograph)}`;
}

export function resolvePhotographyPath(path: string): PhotographyRouteState | undefined {
	const normalizedPath = normalizePhotographyPath(path);
	if (normalizedPath === 'photography') return {};

	const [, collectionSlug, photoSlug, ...rest] = normalizedPath.split('/');
	if (!collectionSlug || rest.length) return undefined;

	const collection = collectionsBySlug.get(collectionSlug);
	if (!collection) return undefined;
	if (!photoSlug) return { collectionSlug };

	const photograph = photographsByCollectionSlug.get(collectionSlug)?.get(photoSlug);
	if (!photograph) return undefined;

	return { collectionSlug, photoSlug };
}

export function findPhotographyCollection(slug?: string) {
	if (!slug) return undefined;
	return collectionsBySlug.get(slug);
}

export function findPhotograph(collectionSlug?: string, photoSlug?: string) {
	if (!collectionSlug || !photoSlug) return undefined;

	const collection = findPhotographyCollection(collectionSlug);
	if (!collection) return undefined;

	const photograph = photographsByCollectionSlug.get(collectionSlug)?.get(photoSlug);
	if (!photograph) return undefined;

	return { collection, photograph };
}

function normalizePhotographyPath(path: string) {
	return path.replace(/^\/+|\/+$/g, '');
}
