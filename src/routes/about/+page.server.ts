import { loadAboutPost } from '$lib/blog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const about = loadAboutPost();

	return {
		post: about,
		requestedPath: about.path
	};
};
