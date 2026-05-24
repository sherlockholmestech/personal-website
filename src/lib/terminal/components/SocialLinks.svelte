<script lang="ts">
	const links = [
		{
			label: 'github',
			url: 'https://github.com/sherlockholmestech'
		}
	];
</script>

<div class="my-[4px] mb-[14px] grid gap-[4px]">
	<div class="leading-[1.45] font-bold text-[var(--green)]">socials</div>
	{#each links as link (link.url)}
		<a
			href={link.url}
			target="_blank"
			rel="external noreferrer"
			class="grid grid-cols-[10ch_minmax(0,1fr)] gap-[10px] leading-[1.45] text-[var(--cyan)] no-underline hover:text-[var(--yellow)] max-[760px]:grid-cols-1 max-[760px]:gap-0 max-[760px]:py-[5px]"
		>
			<span>{link.label}</span>
			<strong class="min-w-0 font-normal [overflow-wrap:anywhere]">{link.url}</strong>
		</a>
	{/each}
</div>
