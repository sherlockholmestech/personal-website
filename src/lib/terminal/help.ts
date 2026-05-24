export type CommandHelp = {
	command: string;
	description: string;
	group: 'start' | 'blog' | 'filesystem' | 'display';
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
		group: 'start'
	},
	{
		command: 'about',
		description: 'Read the short bio.',
		group: 'start'
	},
	{
		command: 'info',
		description: 'Show site and stack notes.',
		group: 'start'
	},
	{
		command: 'links',
		description: 'Show social links.',
		group: 'start'
	},
	{
		command: 'home',
		description: 'Return to the welcome banner.',
		group: 'start'
	},
	{
		command: 'blog [query]',
		description: 'Browse posts with search, sort, and markdown preview.',
		group: 'blog'
	},
	{
		command: 'cat <post.md>',
		description: 'Render a post inline.',
		group: 'blog'
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
		command: 'theme dark|light',
		description: 'Switch between Flexoki themes.',
		group: 'display'
	},
	{
		command: 'clear',
		description: 'Clear terminal output.',
		group: 'display'
	}
];

export const helpfulCommands = ['blog', 'about', 'links', 'help', 'home', 'clear'];
export const commandExamples = commandCatalog.map((entry) => entry.command);
