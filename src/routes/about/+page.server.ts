import { loadAboutPost, loadPostMetas } from '$lib/blog';

export function load() {
	const about = loadAboutPost();

	return {
		...loadPostMetas(),
		about,
		post: about,
		requestedPath: about.path
	};
}
