<script lang="ts">
	/* eslint-disable svelte/no-dom-manipulating */

	let { html, class: className = '' }: { html: string; class?: string } = $props();
	let container = $state<HTMLDivElement>();

	$effect(() => {
		if (container) container.innerHTML = html;
	});
</script>

<div class={`min-w-0 ${className}`} bind:this={container}></div>
