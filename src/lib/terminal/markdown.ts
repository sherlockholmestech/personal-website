import { marked, type Tokens } from 'marked';
import type { MdBlock, Theme } from './types';

marked.use({
	breaks: true
});

const highlightedCodeCache = new Map<string, string>();

export function parseMarkdown(
	markdown: string,
	highlightedCode: Record<string, string>
): MdBlock[] {
	const usedHeadingIds = new Map<string, number>();

	return marked.lexer(markdown).flatMap((token): MdBlock[] => {
		if (token.type === 'heading') {
			return [
				{
					type: 'heading',
					level: token.depth,
					text: token.text,
					html: inlineHtml(token.text),
					id: headingId(token.text, usedHeadingIds)
				}
			];
		}
		if (token.type === 'paragraph') {
			return [{ type: 'paragraph', html: inlineHtml(token.text) }];
		}
		if (token.type === 'list') {
			const list = token as Tokens.List;
			const items = list.items.map((item: Tokens.ListItem) => item.text);
			return [
				{
					type: 'list',
					items: items.map((item) => inlineHtml(item.replace(/^\s*\d+\.\s+/, ''))),
					ordered: list.ordered
				}
			];
		}
		if (token.type === 'code') {
			const code = token as Tokens.Code;
			const text = normalizeCodeBlock(code.text);
			const language = code.lang || 'text';
			return [
				{
					type: 'code',
					language,
					code: text,
					html:
						highlightedCode[codeKey(text, language)] ??
						`<pre><code>${escapeHtml(text)}</code></pre>`
				}
			];
		}
		if (token.type === 'blockquote') {
			return [{ type: 'quote', html: inlineHtml(token.text) }];
		}
		if (token.type === 'hr') {
			return [{ type: 'hr' }];
		}
		return [];
	});
}

export async function highlightMarkdownCode(markdown: string, theme: Theme) {
	const codeBlocks = marked
		.lexer(markdown)
		.filter((token): token is Tokens.Code => token.type === 'code');

	if (!codeBlocks.length) return {};

	const { codeToHtml } = await import('shiki');
	const entries = await Promise.all(
		codeBlocks.map(async (block) => {
			const language = block.lang || 'text';
			const text = normalizeCodeBlock(block.text);
			const key = highlightCacheKey(text, language, theme);
			const cachedHtml = highlightedCodeCache.get(key);
			const html =
				cachedHtml ??
				(await codeToHtml(text, {
					lang: language,
					theme: theme === 'dark' ? 'vitesse-dark' : 'vitesse-light'
				}));
			highlightedCodeCache.set(key, html);
			return [codeKey(text, language), html] as const;
		})
	);

	return Object.fromEntries(entries);
}

export function codeKey(code: string, language: string) {
	return `${language}:${code}`;
}

function highlightCacheKey(code: string, language: string, theme: Theme) {
	return `${theme}:${language}:${code}`;
}

function inlineHtml(value: string) {
	return decorateImages(marked.parseInline(value) as string);
}

function headingId(text: string, used: Map<string, number>) {
	const base = slugify(text) || 'section';
	const count = used.get(base) ?? 0;
	used.set(base, count + 1);
	return count ? `${base}-${count + 1}` : base;
}

function slugify(text: string) {
	return text
		.toLowerCase()
		.replace(/<[^>]*>/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function normalizeCodeBlock(value: string) {
	return value
		.replace(/\r\n?/g, '\n')
		.split('\n')
		.map((line) => line.replace(/[ \t]+$/g, ''))
		.join('\n')
		.replace(/^\n+|\n+$/g, '')
		.replace(/\n{3,}/g, '\n\n');
}

function escapeHtml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function decorateImages(html: string) {
	return html.replace(/<img\b([^>]*)>/g, (_match, attributes: string) => {
		const loading = /\sloading=/.test(attributes) ? '' : ' loading="lazy"';
		const decoding = /\sdecoding=/.test(attributes) ? '' : ' decoding="async"';
		return `<img${attributes}${loading}${decoding}>`;
	});
}
