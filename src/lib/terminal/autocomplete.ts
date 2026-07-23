import { listEntries, normalizePath, type FileSystem, type FsEntry } from './filesystem';
import { commandCatalog } from './help';

const commands = commandCatalog.map((entry) => entry.command.split(/\s+/, 1)[0]);
const pathCommands = new Set(['cat', 'cd', 'ls', 'tree']);

export type CompletionResult = {
	input: string;
	cursor: number;
	candidates: string[];
};

export function completeTerminalInput(
	input: string,
	cursor: number,
	cwd: string,
	fileSystem: FileSystem
): CompletionResult | undefined {
	const beforeCursor = input.slice(0, cursor);
	const leadingWhitespace = beforeCursor.match(/^\s*/)?.[0] ?? '';
	const commandFragment = beforeCursor.slice(leadingWhitespace.length);

	if (!/\s/.test(commandFragment)) {
		const matches = commands.filter((command) => command.startsWith(commandFragment));
		return completeToken(input, leadingWhitespace.length, cursor, matches, commandFragment, true);
	}

	const command = beforeCursor.trimStart().split(/\s+/, 1)[0];
	if (!pathCommands.has(command)) return undefined;

	const tokenMatch = beforeCursor.match(/(?:^|\s)(\S*)$/);
	if (!tokenMatch) return undefined;

	const token = tokenMatch[1];
	const tokenStart = cursor - token.length;
	const lastSlash = token.lastIndexOf('/');
	const directoryToken = lastSlash >= 0 ? token.slice(0, lastSlash + 1) : '';
	const fragment = token.slice(lastSlash + 1);
	const directoryPath = normalizePath(directoryToken || '.', cwd);
	const entries = listEntries(fileSystem, directoryPath).filter(
		(entry) => command !== 'cd' || entry.type === 'directory'
	);
	const matches = entries
		.filter((entry) => entry.name.startsWith(fragment))
		.map((entry) => pathCompletion(directoryToken, entry));

	return completeToken(input, tokenStart, cursor, matches, token, false);
}

function pathCompletion(directoryToken: string, entry: FsEntry) {
	return `${directoryToken}${entry.name}${entry.type === 'directory' ? '/' : ''}`;
}

function completeToken(
	input: string,
	tokenStart: number,
	cursor: number,
	matches: string[],
	currentToken: string,
	appendSpace: boolean
): CompletionResult | undefined {
	if (!matches.length) return undefined;

	const tokenEnd = findTokenEnd(input, cursor);
	if (matches.length === 1) {
		const match = matches[0];
		const directory = match.endsWith('/');
		const needsSpace = appendSpace || !directory;
		const suffix = needsSpace && !/\s/.test(input[tokenEnd] ?? '') ? ' ' : '';
		const replacement = `${match}${suffix}`;
		const nextInput = `${input.slice(0, tokenStart)}${replacement}${input.slice(tokenEnd)}`;

		return {
			input: nextInput,
			cursor: tokenStart + replacement.length,
			candidates: []
		};
	}

	const commonPrefix = longestCommonPrefix(matches);
	if (commonPrefix.length > currentToken.length) {
		const nextInput = `${input.slice(0, tokenStart)}${commonPrefix}${input.slice(tokenEnd)}`;
		return {
			input: nextInput,
			cursor: tokenStart + commonPrefix.length,
			candidates: []
		};
	}

	return {
		input,
		cursor,
		candidates: matches
	};
}

function findTokenEnd(input: string, cursor: number) {
	const nextWhitespace = input.slice(cursor).search(/\s/);
	return nextWhitespace === -1 ? input.length : cursor + nextWhitespace;
}

function longestCommonPrefix(values: string[]) {
	return values.slice(1).reduce((prefix, value) => {
		let index = 0;
		while (index < prefix.length && prefix[index] === value[index]) {
			index += 1;
		}
		return prefix.slice(0, index);
	}, values[0] ?? '');
}
