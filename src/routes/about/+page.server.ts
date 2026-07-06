import { loadAboutPost, loadTerminalPageData } from '$lib/blog';

export function load() {
	const about = loadAboutPost();

	return loadTerminalPageData({
		post: about,
		requestedPath: about.path
	});
}
