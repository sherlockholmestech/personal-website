import { loadTerminalPageData } from '$lib/blog';
import { resolvePhotographyPath } from '$lib/photography';

export function load({ params }: { params: { slug: string } }) {
	const requestedPath = ['photography', params.slug].filter(Boolean).join('/');
	const photography = resolvePhotographyPath(requestedPath);

	return loadTerminalPageData({
		requestedPath,
		photography,
		notFound: !photography
	});
}
