import type { BlogPost, BlogSort } from './types';
import { formatPostDate } from './date';

export function searchPosts(posts: BlogPost[], query: string) {
	const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

	if (!terms.length) return posts;

	return posts.filter((post) => {
		const tagTerms = terms.filter((term) => term.startsWith('#')).map((term) => term.slice(1));
		const pathTerms = terms.filter((term) => term.startsWith('/')).map((term) => term.slice(1));
		const textTerms = terms.filter((term) => !term.startsWith('#') && !term.startsWith('/'));
		const haystack = [
			post.title,
			post.description,
			post.path,
			post.date,
			formatPostDate(post.date),
			post.tags.join(' '),
			post.markdown
		]
			.join('\n')
			.toLowerCase();
		const tags = post.tags.map((tag) => tag.toLowerCase());
		const path = post.path.toLowerCase();
		return (
			tagTerms.every((term) => tags.some((tag) => tag.includes(term))) &&
			pathTerms.every((term) => path.includes(term)) &&
			textTerms.every((term) => haystack.includes(term))
		);
	});
}

export function sortPosts(posts: BlogPost[], sort: BlogSort) {
	return [...posts].sort((a, b) => {
		if (sort === 'date-asc') return a.date.localeCompare(b.date);
		if (sort === 'title-asc') return a.title.localeCompare(b.title);
		if (sort === 'path-asc') return a.path.localeCompare(b.path);
		return b.date.localeCompare(a.date);
	});
}

export function postExcerpt(post: BlogPost) {
	return (
		post.markdown
			.split('\n')
			.find((line) => line.trim() && !line.startsWith('#') && !line.startsWith('```')) ?? ''
	);
}

export function matchingPreview(post: BlogPost, query: string) {
	const terms = query
		.toLowerCase()
		.split(/\s+/)
		.filter((term) => term && !term.startsWith('#') && !term.startsWith('/'));

	if (!terms.length) return postExcerpt(post);

	return (
		post.markdown
			.split('\n')
			.find((line) => terms.some((term) => line.toLowerCase().includes(term))) ?? postExcerpt(post)
	);
}
