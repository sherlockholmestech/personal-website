import { loadPost, loadPostMetas } from '$lib/blog';

export function load({ params }: { params: { slug: string } }) {
	const data = loadPostMetas();
	const requestedPath = `blog/${params.slug}`;
	const post = loadPost(requestedPath);

	return {
		...data,
		post,
		requestedPath,
		notFound: !data.posts.some(
			(postMeta) => postMeta.path === requestedPath || postMeta.path.startsWith(`${requestedPath}/`)
		)
	};
}
