<script lang="ts">
	import { onMount } from 'svelte';
	import './layout.css';

	let { children } = $props();

	onMount(() => {
		void import('./font-variants.css');
	});
</script>

<svelte:head>
	<link rel="icon" href="/icon.svg" />
	<link
		rel="preload"
		href="/fonts/ioskeley-mono-regular.woff2"
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/>
</svelte:head>
{@render children()}
