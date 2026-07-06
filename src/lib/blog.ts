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
const BLOG_PREVIEW_MAX_CHARS = 4200;

const posts = Object.entries(modules)
	.map(([filePath, raw]) => toPost(filePath, raw))
	.sort((a, b) => b.date.localeCompare(a.date));
const postMetas = posts.map(toPostMeta);
const postsByPath = new Map(posts.map((post) => [post.path, post]));
const aboutPost = toPost(ABOUT_FILE_PATH, aboutRaw);

function loadPostMetas() {
	return { posts: [...postMetas] };
}

export function loadPost(path: string) {
	return postsByPath.get(normalizePostPath(path));
}

export function loadAboutPost() {
	return aboutPost;
}

export function loadTerminalPageData(
	options: { requestedPath?: string; post?: BlogPost; notFound?: boolean } = {}
) {
	return {
		...loadPostMetas(),
		about: aboutPost,
		...options
	};
}

export function normalizePostPath(path: string) {
	return path
		.replace(/^\/+/, '')
		.replace(/\.mdx?$/, '')
		.replace(/\/index$/, '');
}

export function hasPostOrDirectory(path: string) {
	const normalizedPath = normalizePostPath(path);
	return postMetas.some(
		(post) => post.path === normalizedPath || post.path.startsWith(`${normalizedPath}/`)
	);
}

export function postPreviewMarkdown(markdown: string) {
	if (markdown.length <= BLOG_PREVIEW_MAX_CHARS) return markdown;

	const lines = markdown.split('\n');
	const previewLines: string[] = [];
	let previewLength = 0;
	let inFence = false;

	for (const line of lines) {
		const lineLength = line.length + 1;
		const fence = line.trimStart().startsWith('```');

		if (!inFence && previewLength + lineLength > BLOG_PREVIEW_MAX_CHARS) break;

		previewLines.push(line);
		previewLength += lineLength;

		if (fence) {
			inFence = !inFence;
		}
	}

	if (inFence) {
		previewLines.push('```');
	}

	return `${previewLines.join('\n').trim()}\n\n...`;
}

function toPost(filePath: string, raw: string): BlogPost {
	const { data, content } = matter(raw);
	const meta = toMeta(filePath, data as Frontmatter);

	return {
		...meta,
		markdown: content.trim()
	};
}

function toPostMeta(post: BlogPost): BlogPostMeta {
	return {
		path: post.path,
		title: post.title,
		description: post.description,
		date: post.date,
		tags: post.tags
	};
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
	return normalizePostPath(filePath.replace('/src/content/', ''));
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
