<script lang="ts">
	import { resolve } from '$app/paths';

	let {
		path,
		onCommand
	}: {
		path: string;
		onCommand?: (command: string) => void;
	} = $props();

	const suggestions = [
		{ command: 'home', label: 'home', href: resolve('/') },
		{ command: 'blog', label: 'blog', href: resolve('/') },
		{ command: 'help', label: 'help', href: resolve('/') }
	];
</script>

<section class="not-found-panel" aria-labelledby="not-found-title">
	<h1 id="not-found-title" class="not-found-title">
		<span class="not-found-code">404</span>
		<span>No such file or directory</span>
	</h1>

	<div class="not-found-trace" aria-label="failed command trace">
		<span class="text-[var(--cyan)]">~</span>
		<span class="text-[var(--yellow)]">❯</span>
		<span>cat {path || '/'}</span>
	</div>

	<p class="not-found-message">
		<span class="not-found-label">reason</span>
		route lookup failed; the requested path is not mapped to a page, post, or directory.
	</p>

	<div class="not-found-suggestions">
		<span class="not-found-label">try</span>
		<div class="not-found-actions" aria-label="suggested commands">
			{#each suggestions as suggestion (suggestion.command)}
				{#if onCommand}
					<button
						type="button"
						class="welcome-command not-found-action"
						aria-label={`run ${suggestion.command}`}
						onclick={() => onCommand?.(suggestion.command)}
					>
						{suggestion.label}
					</button>
				{:else}
					<a class="welcome-command not-found-action" href={suggestion.href}>
						{suggestion.label}
					</a>
				{/if}
			{/each}
		</div>
	</div>
</section>
