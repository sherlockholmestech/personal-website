<script lang="ts">
	/* eslint-disable svelte/no-dom-manipulating */

	let { html }: { html: string } = $props();
	let container = $state<HTMLDivElement>();

	$effect(() => {
		if (container) container.innerHTML = html;
	});
</script>

<div class="bat-code" bind:this={container}></div>
