<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { resolve } from '$app/paths';
	import {
		claimTurnstileReveal,
		loadTurnstile,
		releaseTurnstileReveal,
		type TurnstileApi
	} from '$lib/terminal/turnstile-client';
	import { TURNSTILE_EMAIL_ACTION } from '$lib/turnstile';
	import { onDestroy, tick } from 'svelte';

	type RevealStatus =
		'idle' | 'loading' | 'ready' | 'verifying' | 'revealed' | 'error' | 'rate-limited';

	const githubUrl = 'https://github.com/sherlockholmestech';
	const testSiteKey = '1x00000000000000000000AA';
	const siteKey = env.PUBLIC_TURNSTILE_SITE_KEY || (import.meta.env.DEV ? testSiteKey : '');

	let challengeContainer = $state<HTMLDivElement>();
	let turnstile: TurnstileApi | undefined;
	let widgetId: string | undefined;
	let revealController: AbortController | undefined;
	let destroyed = false;
	let status = $state<RevealStatus>('idle');
	let statusMessage = $state('');
	let email = $state('');

	function deactivateReveal() {
		revealController?.abort();
		revealController = undefined;

		if (turnstile && widgetId) turnstile.remove(widgetId);
		widgetId = undefined;
		releaseTurnstileReveal(deactivateReveal);

		if (!destroyed && status !== 'revealed') {
			status = 'idle';
			statusMessage = '';
		}
	}

	async function startReveal() {
		if (status !== 'idle' && status !== 'error' && status !== 'rate-limited') return;

		if (!siteKey) {
			status = 'error';
			statusMessage = 'email reveal is not configured.';
			return;
		}

		claimTurnstileReveal(deactivateReveal);

		if (turnstile && widgetId) {
			status = 'ready';
			statusMessage = '';
			turnstile.reset(widgetId);
			return;
		}

		status = 'loading';
		statusMessage = 'loading verification...';
		await tick();

		try {
			turnstile = await loadTurnstile();
			if (destroyed || !challengeContainer) return;

			status = 'ready';
			statusMessage = '';
			widgetId = turnstile.render(challengeContainer, {
				sitekey: siteKey,
				action: TURNSTILE_EMAIL_ACTION,
				theme: 'auto',
				size: 'flexible',
				callback: (token) => void revealEmail(token),
				'error-callback': () => {
					if (destroyed) return;
					status = 'error';
					statusMessage = 'verification could not run. try again.';
				},
				'expired-callback': () => {
					if (destroyed) return;
					status = 'error';
					statusMessage = 'verification expired. try again.';
				}
			});
		} catch {
			releaseTurnstileReveal(deactivateReveal);
			if (destroyed) return;
			status = 'error';
			statusMessage = 'verification could not load. try again.';
		}
	}

	async function revealEmail(token: string) {
		status = 'verifying';
		statusMessage = 'verifying...';
		revealController?.abort();
		const controller = new AbortController();
		revealController = controller;

		try {
			const response = await fetch(resolve('/api/contact-email' as const), {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ token }),
				signal: controller.signal
			});
			const result = (await response.json().catch(() => null)) as {
				email?: string;
				message?: string;
			} | null;

			if (destroyed || controller.signal.aborted) return;

			if (!response.ok || !result?.email) {
				status = response.status === 429 ? 'rate-limited' : 'error';
				statusMessage = result?.message ?? 'verification failed. try again.';
				if (turnstile && widgetId) turnstile.reset(widgetId);
				return;
			}

			email = result.email;
			status = 'revealed';
			statusMessage = '';

			if (turnstile && widgetId) {
				turnstile.remove(widgetId);
				widgetId = undefined;
			}
			releaseTurnstileReveal(deactivateReveal);
		} catch {
			if (destroyed || controller.signal.aborted) return;
			status = 'error';
			statusMessage = 'email reveal is unavailable. try again.';
			if (turnstile && widgetId) turnstile.reset(widgetId);
		} finally {
			if (revealController === controller) revealController = undefined;
		}
	}

	onDestroy(() => {
		destroyed = true;
		deactivateReveal();
	});
</script>

<div class="my-[4px] mb-[14px] grid gap-[4px]">
	<div class="leading-[1.45] font-bold text-[var(--green)]">socials</div>
	<a
		href={githubUrl}
		target="_blank"
		rel="external noreferrer"
		class="grid grid-cols-[10ch_minmax(0,1fr)] gap-[10px] leading-[1.45] text-[var(--cyan)] no-underline hover:text-[var(--yellow)] max-[760px]:grid-cols-1 max-[760px]:gap-0 max-[760px]:py-[5px]"
	>
		<span>github</span>
		<strong class="min-w-0 font-normal [overflow-wrap:anywhere]">{githubUrl}</strong>
	</a>
	<div
		class="grid grid-cols-[10ch_minmax(0,1fr)] gap-[10px] leading-[1.45] text-[var(--cyan)] no-underline max-[760px]:grid-cols-1 max-[760px]:gap-0 max-[760px]:py-[5px]"
	>
		<span>email</span>
		<div class="min-w-0">
			{#if status === 'revealed'}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a
					href={`mailto:${email}`}
					class="font-normal [overflow-wrap:anywhere] text-[var(--cyan)] no-underline hover:text-[var(--yellow)]"
				>
					{email}
				</a>
			{:else if status === 'idle'}
				<button
					type="button"
					onclick={startReveal}
					class="cursor-pointer bg-transparent p-0 text-left font-normal text-[var(--cyan)] underline decoration-[color-mix(in_srgb,var(--cyan)_65%,transparent)] underline-offset-[3px] hover:text-[var(--yellow)] focus-visible:text-[var(--yellow)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tx)]"
				>
					verify to reveal
				</button>
			{:else}
				<div bind:this={challengeContainer} class="min-h-[65px] w-full max-w-[300px]"></div>
				{#if statusMessage}
					<div class="mt-[4px] text-[var(--tx-2)]" role="status">{statusMessage}</div>
				{/if}
				{#if status === 'error' || status === 'rate-limited'}
					<button
						type="button"
						onclick={startReveal}
						class="mt-[4px] cursor-pointer bg-transparent p-0 text-left text-[var(--cyan)] underline underline-offset-[3px] hover:text-[var(--yellow)] focus-visible:text-[var(--yellow)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tx)]"
					>
						retry
					</button>
				{/if}
			{/if}
		</div>
	</div>
</div>
