import type { BlogPostMeta, BlogSort } from './types';
import { formatPostDate } from './date';

type SearchablePost = {
	post: BlogPostMeta;
	haystack: string;
	path: string;
	tags: string[];
};

export function createPostSearchIndex(posts: BlogPostMeta[]): SearchablePost[] {
	return posts.map((post) => ({
		post,
		haystack: [
			post.title,
			post.description,
			post.path,
			post.date,
			formatPostDate(post.date),
			post.tags.join(' ')
		]
			.join('\n')
			.toLowerCase(),
		path: post.path.toLowerCase(),
		tags: post.tags.map((tag) => tag.toLowerCase())
	}));
}

export function searchPosts(index: SearchablePost[], query: string) {
	const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

	if (!terms.length) return index.map(({ post }) => post);

	const tagTerms = terms.filter((term) => term.startsWith('#')).map((term) => term.slice(1));
	const pathTerms = terms.filter((term) => term.startsWith('/')).map((term) => term.slice(1));
	const textTerms = terms.filter((term) => !term.startsWith('#') && !term.startsWith('/'));

	return index
		.filter(
			({ haystack, path, tags }) =>
				tagTerms.every((term) => tags.some((tag) => tag.includes(term))) &&
				pathTerms.every((term) => path.includes(term)) &&
				textTerms.every((term) => haystack.includes(term))
		)
		.map(({ post }) => post);
}

export function sortPosts(posts: BlogPostMeta[], sort: BlogSort) {
	return [...posts].sort((a, b) => {
		if (sort === 'date-asc') return a.date.localeCompare(b.date);
		if (sort === 'title-asc') return a.title.localeCompare(b.title);
		if (sort === 'path-asc') return a.path.localeCompare(b.path);
		return b.date.localeCompare(a.date);
	});
}
