export type CommandHelp = {
	name: string;
	command: string;
	description: string;
	group: 'start' | 'blog' | 'filesystem' | 'display';
	completion?: 'path' | 'directory';
	shortcutOrder?: number;
};

export const commandCatalog: CommandHelp[] = [
	{
		name: 'banner',
		command: 'banner',
		description: 'Show the Sherlock Holmes welcome banner again.',
		group: 'start'
	},
	{
		name: 'help',
		command: 'help',
		description: 'Open this command reference.',
		group: 'start',
		shortcutOrder: 6
	},
	{
		name: 'about',
		command: 'about',
		description: 'Open the about article.',
		group: 'start',
		shortcutOrder: 4
	},
	{
		name: 'info',
		command: 'info',
		description: 'Show site and stack notes.',
		group: 'start'
	},
	{
		name: 'socials',
		command: 'socials',
		description: 'Show social and contact links.',
		group: 'start',
		shortcutOrder: 5
	},
	{
		name: 'projects',
		command: 'projects',
		description: 'Show recent projects.',
		group: 'start',
		shortcutOrder: 3
	},
	{
		name: 'photography',
		command: 'photography [collection]',
		description: 'Fuzzy-find photography collections and preview their frames.',
		group: 'start',
		shortcutOrder: 2
	},
	{
		name: 'home',
		command: 'home',
		description: 'Return to the welcome banner.',
		group: 'start',
		shortcutOrder: 7
	},
	{
		name: 'blog',
		command: 'blog [query]',
		description: 'Browse posts with search, sort, and markdown preview.',
		group: 'blog',
		shortcutOrder: 1
	},
	{
		name: 'cat',
		command: 'cat <file>',
		description: 'Render a post or open a photograph.',
		group: 'filesystem',
		completion: 'path'
	},
	{
		name: 'pwd',
		command: 'pwd',
		description: 'Print the current virtual directory.',
		group: 'filesystem'
	},
	{
		name: 'cd',
		command: 'cd [path]',
		description: 'Move around the virtual blog filesystem.',
		group: 'filesystem',
		completion: 'directory'
	},
	{
		name: 'ls',
		command: 'ls [path]',
		description: 'List files and folders.',
		group: 'filesystem',
		completion: 'path'
	},
	{
		name: 'tree',
		command: 'tree [path]',
		description: 'Print a folder tree.',
		group: 'filesystem',
		completion: 'directory'
	},
	{
		name: 'clear',
		command: 'clear',
		description: 'Clear terminal output.',
		group: 'display',
		shortcutOrder: 8
	}
];

export const helpfulCommands = commandCatalog
	.filter((command): command is CommandHelp & { shortcutOrder: number } =>
		Number.isInteger(command.shortcutOrder)
	)
	.sort((left, right) => left.shortcutOrder - right.shortcutOrder)
	.map(({ name }) => name);
