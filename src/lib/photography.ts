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

	const collection = photographyCollections.find((entry) => entry.slug === collectionSlug);
	if (!collection) return undefined;
	if (!photoSlug) return { collectionSlug };

	const photograph = collection.photographs.find(
		(entry) => photographRouteSlug(entry) === photoSlug
	);
	if (!photograph) return undefined;

	return { collectionSlug, photoSlug };
}

export function findPhotographyCollection(slug?: string) {
	if (!slug) return undefined;
	return photographyCollections.find((collection) => collection.slug === slug);
}

export function findPhotograph(collectionSlug?: string, photoSlug?: string) {
	const collection = findPhotographyCollection(collectionSlug);
	if (!collection || !photoSlug) return undefined;

	const photograph = collection.photographs.find(
		(entry) => photographRouteSlug(entry) === photoSlug
	);
	if (!photograph) return undefined;

	return { collection, photograph };
}

function normalizePhotographyPath(path: string) {
	return path.replace(/^\/+|\/+$/g, '');
}
