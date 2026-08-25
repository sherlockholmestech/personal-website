export type TurnstileApi = {
	render: (
		container: HTMLElement,
		options: {
			sitekey: string;
			action: string;
			theme: 'auto';
			size: 'flexible';
			callback: (token: string) => void;
			'error-callback': () => void;
			'expired-callback': () => void;
		}
	) => string;
	remove: (widgetId: string) => void;
	reset: (widgetId: string) => void;
};

type TurnstileWindow = Window & {
	turnstile?: TurnstileApi;
};

let loadPromise: Promise<TurnstileApi> | undefined;
let activeRevealCleanup: (() => void) | undefined;

export function loadTurnstile() {
	const turnstileWindow = window as TurnstileWindow;
	if (turnstileWindow.turnstile) return Promise.resolve(turnstileWindow.turnstile);
	if (loadPromise) return loadPromise;

	loadPromise = new Promise<TurnstileApi>((resolve, reject) => {
		const existingScript = document.querySelector<HTMLScriptElement>('script[data-turnstile-api]');
		const script = existingScript ?? document.createElement('script');

		const cleanupListeners = () => {
			script.removeEventListener('load', handleLoad);
			script.removeEventListener('error', handleError);
		};

		const fail = (message: string) => {
			cleanupListeners();
			script.remove();
			loadPromise = undefined;
			reject(new Error(message));
		};

		const handleLoad = () => {
			const api = (window as TurnstileWindow).turnstile;

			if (!api) {
				fail('Turnstile API did not initialize');
				return;
			}

			cleanupListeners();
			resolve(api);
		};

		const handleError = () => fail('Turnstile API failed to load');

		script.addEventListener('load', handleLoad);
		script.addEventListener('error', handleError);

		if (turnstileWindow.turnstile) {
			handleLoad();
		} else if (!existingScript) {
			script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
			script.defer = true;
			script.dataset.turnstileApi = '';
			document.head.append(script);
		}
	});

	return loadPromise;
}

export function claimTurnstileReveal(cleanup: () => void) {
	if (activeRevealCleanup === cleanup) return;

	const previousCleanup = activeRevealCleanup;
	activeRevealCleanup = cleanup;
	previousCleanup?.();
}

export function releaseTurnstileReveal(cleanup: () => void) {
	if (activeRevealCleanup === cleanup) activeRevealCleanup = undefined;
}
