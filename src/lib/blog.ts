import matter from 'gray-matter';
import type { BlogPost, BlogPostMeta } from '$lib/terminal/types';
import aboutRaw from '../content/about.md?raw';

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

const ABOUT_FILE_PATH = '/src/content/about.md';

export function loadPosts() {
	const posts = Object.entries(modules)
		.map(([filePath, raw]) => toPost(filePath, raw))
		.sort((a, b) => b.date.localeCompare(a.date));

	return { posts };
}

export function loadPostMetas() {
	const posts = Object.entries(modules)
		.map(([filePath, raw]) => toPostMeta(filePath, raw))
		.sort((a, b) => b.date.localeCompare(a.date));

	return { posts };
}

export function loadPost(path: string) {
	const normalizedPath = path.replace(/^\/+/, '').replace(/\.mdx?$/, '');
	const entry = Object.entries(modules).find(([filePath]) => postPath(filePath) === normalizedPath);

	return entry ? toPost(entry[0], entry[1]) : undefined;
}

export function loadAboutPost() {
	return toPost(ABOUT_FILE_PATH, aboutRaw);
}

function toPost(filePath: string, raw: string): BlogPost {
	const { data, content } = matter(raw);
	const meta = toMeta(filePath, data as Frontmatter);

	return {
		...meta,
		markdown: content.trim()
	};
}

function toPostMeta(filePath: string, raw: string): BlogPostMeta {
	const { data } = matter(raw);
	return toMeta(filePath, data as Frontmatter);
}

function toMeta(filePath: string, frontmatter: Frontmatter): BlogPostMeta {
	const path = postPath(filePath);

	return {
		path,
		title: frontmatter.title ?? titleFromPath(path),
		description: frontmatter.description ?? '',
		date: normalizeDate(frontmatter.date),
		tags: frontmatter.tags ?? []
	};
}

function postPath(filePath: string) {
	return filePath
		.replace('/src/content/', '')
		.replace(/\.mdx?$/, '')
		.replace(/\/index$/, '');
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
