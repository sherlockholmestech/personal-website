import { loadPosts } from '$lib/blog';

export function load() {
	return loadPosts();
}
