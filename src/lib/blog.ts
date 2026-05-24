import matter from 'gray-matter';

type BlogPost = {
	path: string;
	title: string;
	description: string;
	date: string;
	tags: string[];
	markdown: string;
};

type Frontmatter = {
	title?: string;
	description?: string;
	date?: string | Date;
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
		description: frontmatter.description ?? '',
		date: normalizeDate(frontmatter.date),
		tags: frontmatter.tags ?? [],
		markdown: content.trim()
	};
}

function normalizeDate(value?: string | Date) {
	if (!value) return '1970-01-01';
	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		const year = value.getUTCFullYear();
		const month = String(value.getUTCMonth() + 1).padStart(2, '0');
		const day = String(value.getUTCDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}
	if (typeof value === 'string') {
		const trimmed = value.trim();
		return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : value;
	}
	return String(value);
}

function titleFromPath(path: string) {
	return path
		.split('/')
		.at(-1)!
		.split('-')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}
