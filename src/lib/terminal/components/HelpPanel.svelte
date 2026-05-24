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

<div class="my-[12px] border-y border-[var(--hard-border)] max-[760px]:my-[10px]">
	<div class="flex items-center justify-between gap-[12px] border-b border-[var(--border)] bg-[var(--bg-2)] px-[8px] py-[6px] text-[var(--yellow)] font-bold max-[760px]:grid max-[760px]:grid-cols-1 max-[760px]:gap-[2px]">
		<span>help</span>
		<span>{commandCatalog.length} commands</span>
	</div>

	{#each groups as group (group.key)}
		<section class="grid grid-cols-[120px_minmax(0,1fr)] gap-[12px] border-b border-[var(--border)] px-[8px] py-[10px] last:border-b-0 max-[760px]:grid-cols-1 max-[760px]:gap-[6px]">
			<h2 class="m-0 text-[14px] text-[var(--cyan)]">{group.label}</h2>
			<div class="grid min-w-0 gap-[6px]">
				{#each group.commands as entry (entry.command)}
					<div class="grid grid-cols-[minmax(190px,0.42fr)_minmax(0,1fr)] items-start gap-[12px] max-[760px]:gap-[4px] max-[760px]:border-b max-[760px]:border-[var(--border)] max-[760px]:border-dashed max-[760px]:pb-[6px] max-[760px]:last:border-b-0">
						<code class="bg-[var(--yellow)] px-[5px] py-[1px] text-[13px] text-[var(--bg)]">
							{entry.command}
						</code>
						<span class="min-w-0 text-[var(--tx-2)] leading-[1.35]">{entry.description}</span>
					</div>
				{/each}
			</div>
		</section>
	{/each}
</div>
