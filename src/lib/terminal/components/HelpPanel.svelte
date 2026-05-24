<script lang="ts">
	import { commandCatalog } from '../help';

	const groupLabels = {
		start: 'Start',
		blog: 'Blog',
		filesystem: 'Filesystem',
		display: 'Display'
	};

	const groups = Object.entries(groupLabels).map(([key, label]) => ({
		key,
		label,
		commands: commandCatalog.filter((entry) => entry.group === key)
	}));
</script>

<div class="help-panel">
	<div class="help-header">
		<span>help</span>
		<span>{commandCatalog.length} commands</span>
	</div>

	{#each groups as group (group.key)}
		<section class="help-section">
			<h2>{group.label}</h2>
			<div class="help-commands">
				{#each group.commands as entry (entry.command)}
					<div class="help-row">
						<code>{entry.command}</code>
						<span>{entry.description}</span>
					</div>
				{/each}
			</div>
		</section>
	{/each}
</div>
