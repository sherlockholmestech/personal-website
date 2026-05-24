export type Theme = 'dark' | 'light';
export type LineKind = 'prompt' | 'output' | 'success' | 'error' | 'muted';
export type ShellLine =
	| { kind: Exclude<LineKind, 'prompt'>; text: string }
	| { kind: 'prompt'; command: string; cwd: string; took: string }
	| { kind: 'post'; path: string }
	| { kind: 'links'; path: string };

export type BlogPost = {
	path: string;
	title: string;
	date: string;
	tags: string[];
	markdown: string;
};

export type MdBlock =
	| { type: 'heading'; level: number; text: string }
	| { type: 'paragraph'; text: string }
	| { type: 'list'; items: string[] }
	| { type: 'code'; language: string; code: string; html: string }
	| { type: 'quote'; text: string }
	| { type: 'hr' };
