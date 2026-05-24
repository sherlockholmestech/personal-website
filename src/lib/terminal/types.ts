export type Theme = 'dark' | 'light';
export type BlogSort = 'date-desc' | 'date-asc' | 'title-asc' | 'path-asc';
export type LineKind = 'prompt' | 'output' | 'success' | 'error' | 'muted';
export type ShellLine =
	| { kind: Exclude<LineKind, 'prompt'>; text: string }
	| { kind: 'prompt'; command: string; cwd: string }
	| { kind: 'links'; path: string }
	| { kind: 'banner' }
	| { kind: 'help' }
	| { kind: 'markdown'; markdown: string };

export type BlogPost = {
	path: string;
	title: string;
	description: string;
	date: string;
	tags: string[];
	markdown: string;
};

export type MdBlock =
	| { type: 'heading'; level: number; text: string; html: string; id: string }
	| { type: 'paragraph'; html: string }
	| { type: 'list'; items: string[]; ordered: boolean }
	| { type: 'code'; language: string; code: string; html: string }
	| { type: 'quote'; html: string }
	| { type: 'hr' };
