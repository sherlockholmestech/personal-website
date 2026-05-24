import { loadPosts } from '$lib/blog';

export function load({ params }: { params: { slug: string } }) {
	const data = loadPosts();
	const requestedPath = `blog/${params.slug}`;

	return {
		...data,
		requestedPath,
		notFound: !data.posts.some(
			(post) => post.path === requestedPath || post.path.startsWith(`${requestedPath}/`)
		)
	};
}
