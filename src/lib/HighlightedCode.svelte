<script lang="ts">
	/* eslint-disable svelte/no-at-html-tags */

	let { html, class: className = '' }: { html: string; class?: string } = $props();
</script>

<div class={`min-w-0 ${className}`}>{@html html}</div>
