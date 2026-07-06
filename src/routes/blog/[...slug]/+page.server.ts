import { hasPostOrDirectory, loadPost, loadTerminalPageData, normalizePostPath } from '$lib/blog';

export function load({ params }: { params: { slug: string } }) {
	const requestedPath = normalizePostPath(`blog/${params.slug}`);
	const post = loadPost(requestedPath);

	return loadTerminalPageData({
		post,
		requestedPath,
		notFound: !hasPostOrDirectory(requestedPath)
	});
}
