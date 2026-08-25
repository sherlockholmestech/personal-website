export type CommandHelp = {
	command: string;
	description: string;
	group: 'start' | 'blog' | 'filesystem' | 'display';
	shortcutOrder?: number;
};

export const commandCatalog: CommandHelp[] = [
	{
		command: 'banner',
		description: 'Show the Sherlock Holmes welcome banner again.',
		group: 'start'
	},
	{
		command: 'help',
		description: 'Open this command reference.',
		group: 'start',
		shortcutOrder: 6
	},
	{
		command: 'about',
		description: 'Open the about article.',
		group: 'start',
		shortcutOrder: 4
	},
	{
		command: 'info',
		description: 'Show site and stack notes.',
		group: 'start'
	},
	{
		command: 'socials',
		description: 'Show social and contact links.',
		group: 'start',
		shortcutOrder: 5
	},
	{
		command: 'projects',
		description: 'Show recent projects.',
		group: 'start',
		shortcutOrder: 3
	},
	{
		command: 'photography [collection]',
		description: 'Fuzzy-find photography collections and preview their frames.',
		group: 'start',
		shortcutOrder: 2
	},
	{
		command: 'home',
		description: 'Return to the welcome banner.',
		group: 'start',
		shortcutOrder: 7
	},
	{
		command: 'blog [query]',
		description: 'Browse posts with search, sort, and markdown preview.',
		group: 'blog',
		shortcutOrder: 1
	},
	{
		command: 'cat <file>',
		description: 'Render a post or open a photograph.',
		group: 'filesystem'
	},
	{
		command: 'pwd',
		description: 'Print the current virtual directory.',
		group: 'filesystem'
	},
	{
		command: 'cd [path]',
		description: 'Move around the virtual blog filesystem.',
		group: 'filesystem'
	},
	{
		command: 'ls [path]',
		description: 'List files and folders.',
		group: 'filesystem'
	},
	{
		command: 'tree [path]',
		description: 'Print a folder tree.',
		group: 'filesystem'
	},
	{
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
	.map(({ command }) => command.split(' ')[0]);
