<script lang="ts">
	import { resolve } from '$app/paths';

	let {
		path,
		entries
	}: { path: string; entries: { name: string; directory: boolean; url: string }[] } = $props();
</script>

<div class="route-links">
	<div class="post-meta">
		<span class="green">listing</span>
		<span>{path}</span>
	</div>
	{#each entries as entry (entry.url)}
		<a href={resolve(entry.url as `/blog/${string}`)}>{entry.directory ? '' : ''} {entry.name}</a>
	{/each}
</div>
