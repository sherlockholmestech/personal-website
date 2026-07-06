import { json } from '@sveltejs/kit';
import { loadPost, postPreviewMarkdown } from '$lib/blog';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
	const path = url.searchParams.get('path') ?? '';
	const post = path ? loadPost(path) : undefined;

	if (!post) {
		return json({ message: 'post not found' }, { status: 404 });
	}

	return json({ markdown: postPreviewMarkdown(post.markdown) });
};
