import { marked, type Tokens } from 'marked';
import { codeToHtml } from 'shiki';
import type { MdBlock, Theme } from './types';

export function parseMarkdown(
	markdown: string,
	highlightedCode: Record<string, string>
): MdBlock[] {
	return marked.lexer(markdown).flatMap((token): MdBlock[] => {
		if (token.type === 'heading') {
			return [{ type: 'heading', level: token.depth, text: token.text }];
		}
		if (token.type === 'paragraph') {
			return [{ type: 'paragraph', text: token.text }];
		}
		if (token.type === 'list') {
			return [{ type: 'list', items: token.items.map((item: Tokens.ListItem) => item.text) }];
		}
		if (token.type === 'code') {
			const code = token as Tokens.Code;
			return [
				{
					type: 'code',
					language: code.lang || 'text',
					code: code.text,
					html: highlightedCode[codeKey(code.text, code.lang || 'text')] ?? escapeHtml(code.text)
				}
			];
		}
		if (token.type === 'blockquote') {
			return [{ type: 'quote', text: token.text }];
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

	const entries = await Promise.all(
		codeBlocks.map(async (block) => {
			const language = block.lang || 'text';
			const html = await codeToHtml(block.text, {
				lang: language,
				theme: theme === 'dark' ? 'vitesse-dark' : 'vitesse-light'
			});
			return [codeKey(block.text, language), html] as const;
		})
	);

	return Object.fromEntries(entries);
}

export function codeKey(code: string, language: string) {
	return `${language}:${code}`;
}

function escapeHtml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}
