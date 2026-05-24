import matter from 'gray-matter';

type BlogPost = {
	path: string;
	title: string;
	date: string;
	tags: string[];
	markdown: string;
};

type Frontmatter = {
	title?: string;
	date?: string;
	tags?: string[];
};

const modules = import.meta.glob('/src/content/blog/**/*.mdx', {
	eager: true,
	import: 'default',
	query: '?raw'
}) as Record<string, string>;

export function loadPosts() {
	const posts = Object.entries(modules)
		.map(([filePath, raw]) => toPost(filePath, raw))
		.sort((a, b) => b.date.localeCompare(a.date));

	return { posts };
}

function toPost(filePath: string, raw: string): BlogPost {
	const { data, content } = matter(raw);
	const frontmatter = data as Frontmatter;
	const path = filePath
		.replace('/src/content/', '')
		.replace(/\.mdx$/, '')
		.replace(/\/index$/, '');

	return {
		path,
		title: frontmatter.title ?? titleFromPath(path),
		date: frontmatter.date ?? '1970-01-01',
		tags: frontmatter.tags ?? [],
		markdown: content.trim()
	};
}

function titleFromPath(path: string) {
	return path
		.split('/')
		.at(-1)!
		.split('-')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}
