<script lang="ts">
	const projects = [
		{
			name: 'softmun-oss',
			updated: '2026-06-05',
			description: 'Open-source Model UN committee management software.',
			url: 'https://github.com/sherlockholmestech/softmun-oss'
		},
		{
			name: 'vol3-symbol-manager',
			updated: '2026-05-10',
			description: 'Fast CLI symbol manager for Volatility 3.',
			url: 'https://github.com/sherlockholmestech/vol3-symbol-manager'
		},
		{
			name: 'pwninit',
			updated: '2026-05-10',
			description: 'Automates setup for pwn and reverse engineering challenges.',
			url: 'https://github.com/sherlockholmestech/pwninit'
		}
	].sort((left, right) => right.updated.localeCompare(left.updated));
</script>

<div class="my-[12px] border-y border-[var(--hard-border)] max-[760px]:my-[10px]">
	<div
		class="flex items-center justify-between gap-[12px] border-b border-[var(--border)] bg-[var(--bg-2)] px-[8px] py-[6px] font-bold text-[var(--yellow)] max-[760px]:grid max-[760px]:grid-cols-1 max-[760px]:gap-[2px]"
	>
		<span>projects</span>
		<span>{projects.length} repos · newest first</span>
	</div>

	<div
		class="grid grid-cols-[minmax(150px,0.25fr)_110px_minmax(210px,0.45fr)_minmax(220px,0.55fr)] gap-[12px] border-b border-[var(--border)] px-[8px] py-[6px] text-[var(--green)] max-[760px]:hidden"
	>
		<span>name</span>
		<span>updated</span>
		<span>description</span>
		<span>url</span>
	</div>

	{#each projects as project (project.url)}
		<a
			href={project.url}
			target="_blank"
			rel="external noreferrer"
			class="grid grid-cols-[minmax(150px,0.25fr)_110px_minmax(210px,0.45fr)_minmax(220px,0.55fr)] gap-[12px] border-b border-[var(--border)] px-[8px] py-[8px] leading-[1.4] text-[var(--cyan)] no-underline last:border-b-0 hover:text-[var(--yellow)] max-[760px]:grid-cols-1 max-[760px]:gap-[3px] max-[760px]:py-[10px]"
		>
			<strong class="font-normal">{project.name}</strong>
			<span class="text-[var(--tx-2)]">{project.updated}</span>
			<span class="min-w-0 text-[var(--tx)]">{project.description}</span>
			<span class="min-w-0 [overflow-wrap:anywhere]">{project.url}</span>
		</a>
	{/each}
</div>
