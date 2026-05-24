import type { BlogPost } from './types';

export const ROOT_DIRECTORY = '/';
export const HOME_DIRECTORY = '/home/sherlock';

export type FileSystem = {
	files: Map<string, BlogPost>;
	directories: Set<string>;
};

export type FsEntry = {
	name: string;
	path: string;
	type: 'file' | 'directory';
};

export function createFileSystem(posts: BlogPost[]): FileSystem {
	const files = new Map<string, BlogPost>();
	const directories = new Set<string>([ROOT_DIRECTORY, '/home', HOME_DIRECTORY]);

	for (const post of posts) {
		const filePath = filePathFromPostPath(post.path);
		files.set(filePath, post);
		ensureDirectoriesForFile(filePath, directories);
	}

	return { files, directories };
}

export function normalizePath(target: string, cwd: string) {
	if (!target) return cwd;
	const expanded = expandHome(target);
	const baseParts = expanded.startsWith('/') ? [] : cwd.split('/').filter(Boolean);
	const rawParts = expanded.split('/');
	const parts = [...baseParts];

	for (const part of rawParts) {
		if (!part || part === '.') continue;
		if (part === '..') {
			parts.pop();
			continue;
		}
		parts.push(part);
	}

	return `/${parts.join('/')}`.replace(/\/$/, '') || ROOT_DIRECTORY;
}

export function formatPromptPath(path: string) {
	if (path === HOME_DIRECTORY) return '~';
	if (path.startsWith(`${HOME_DIRECTORY}/`)) {
		return `~/${path.slice(HOME_DIRECTORY.length + 1)}`;
	}
	return path || ROOT_DIRECTORY;
}

export function resolveEntry(fileSystem: FileSystem, path: string) {
	if (fileSystem.directories.has(path)) {
		return { type: 'directory' as const, path };
	}

	const file = resolveFile(fileSystem, path);
	if (file) {
		return { type: 'file' as const, ...file };
	}

	return { type: 'missing' as const, path };
}

export function resolveFile(fileSystem: FileSystem, path: string) {
	if (fileSystem.files.has(path)) {
		return { filePath: path, post: fileSystem.files.get(path)! };
	}
	if (!path.endsWith('.md')) {
		const candidate = `${path}.md`;
		if (fileSystem.files.has(candidate)) {
			return { filePath: candidate, post: fileSystem.files.get(candidate)! };
		}
	}

	return undefined;
}

export function listEntries(fileSystem: FileSystem, directoryPath: string) {
	const entries = new Map<string, FsEntry>();
	const prefix = directoryPath === ROOT_DIRECTORY ? '/' : `${directoryPath}/`;

	for (const dir of fileSystem.directories) {
		if (!dir.startsWith(prefix) || dir === directoryPath) continue;
		const rest = dir.slice(prefix.length);
		if (!rest || rest.includes('/')) continue;
		entries.set(rest, { name: rest, path: dir, type: 'directory' });
	}

	for (const filePath of fileSystem.files.keys()) {
		if (!filePath.startsWith(prefix)) continue;
		const rest = filePath.slice(prefix.length);
		if (!rest || rest.includes('/')) continue;
		entries.set(rest, { name: rest, path: filePath, type: 'file' });
	}

	return Array.from(entries.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function buildTree(fileSystem: FileSystem, directoryPath: string, prefix = ''): string[] {
	const entries = listEntries(fileSystem, directoryPath);
	return entries.flatMap((entry, index) => {
		const last = index === entries.length - 1;
		const branch = last ? '└── ' : '├── ';
		const nextPrefix = prefix + (last ? '    ' : '│   ');
		const icon = entry.type === 'directory' ? ' ' : ' ';
		return [
			`${prefix}${branch}${icon}${entry.name}`,
			...(entry.type === 'directory' ? buildTree(fileSystem, entry.path, nextPrefix) : [])
		];
	});
}

export function filePathFromPostPath(postPath: string) {
	return `${HOME_DIRECTORY}/${postPath}.md`;
}

export function postPathFromFilePath(filePath: string) {
	return toHomeRelative(filePath).replace(/\.md$/, '');
}

export function toHomeRelative(path: string) {
	if (path === HOME_DIRECTORY) return '';
	if (path.startsWith(`${HOME_DIRECTORY}/`)) {
		return path.slice(HOME_DIRECTORY.length + 1);
	}
	return path.replace(/^\/+/, '');
}

function expandHome(target: string) {
	if (target === '~') return HOME_DIRECTORY;
	if (target.startsWith('~/')) return `${HOME_DIRECTORY}/${target.slice(2)}`;
	return target;
}

function ensureDirectoriesForFile(filePath: string, directories: Set<string>) {
	const parts = filePath.split('/').filter(Boolean);
	for (let index = 1; index < parts.length; index += 1) {
		const dir = `/${parts.slice(0, index).join('/')}`;
		directories.add(dir);
	}
}
