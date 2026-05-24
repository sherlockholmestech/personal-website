<script lang="ts">
	const links = [
		{
			label: 'github',
			url: 'https://github.com/sherlockholmestech'
		}
	];
</script>

<div class="social-links">
	<div class="social-links-title">socials</div>
	{#each links as link (link.url)}
		<a href={link.url} target="_blank" rel="external noreferrer">
			<span>{link.label}</span>
			<strong>{link.url}</strong>
		</a>
	{/each}
</div>
