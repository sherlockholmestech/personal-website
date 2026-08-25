import { env } from '$env/dynamic/private';
import { TURNSTILE_EMAIL_ACTION } from '$lib/turnstile';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const siteverifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const testSecretKey = '1x0000000000000000000000000000000AA';
const testSecretKeys = new Set([
	testSecretKey,
	'2x0000000000000000000000000000000AA',
	'3x0000000000000000000000000000000AA'
]);
const attemptWindowMs = 60_000;
const maxAttemptsPerWindow = 6;
const maxAttemptBuckets = 1024;

type AttemptBucket = {
	count: number;
	resetAt: number;
};

type TurnstileResponse = {
	success: boolean;
	hostname?: string;
	action?: string;
};

const attemptBuckets = new Map<string, AttemptBucket>();

function noStoreJson(body: Record<string, unknown>, status = 200, extraHeaders?: HeadersInit) {
	return json(body, {
		status,
		headers: {
			'cache-control': 'private, no-store, max-age=0',
			'x-content-type-options': 'nosniff',
			...extraHeaders
		}
	});
}

function clientAddress(request: Request, fallback: () => string, trustCloudflareHeader: boolean) {
	if (trustCloudflareHeader) {
		const cloudflareAddress = request.headers.get('cf-connecting-ip')?.trim();
		if (cloudflareAddress) return cloudflareAddress;
	}

	return fallback();
}

function consumeAttempt(address: string) {
	const now = Date.now();
	const bucket = attemptBuckets.get(address);

	if (!bucket || bucket.resetAt <= now) {
		if (bucket) attemptBuckets.delete(address);

		if (attemptBuckets.size >= maxAttemptBuckets) {
			for (const [key, value] of attemptBuckets) {
				if (value.resetAt <= now) attemptBuckets.delete(key);
			}
		}

		while (attemptBuckets.size >= maxAttemptBuckets) {
			const oldestKey = attemptBuckets.keys().next().value;
			if (typeof oldestKey !== 'string') break;
			attemptBuckets.delete(oldestKey);
		}

		attemptBuckets.set(address, { count: 1, resetAt: now + attemptWindowMs });
		return 0;
	}

	if (bucket.count >= maxAttemptsPerWindow) {
		return Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
	}

	bucket.count += 1;

	return 0;
}

function contactConfiguration() {
	const email = env.CONTACT_EMAIL?.trim();
	const secretKey = env.TURNSTILE_SECRET_KEY?.trim() || (import.meta.env.DEV ? testSecretKey : '');
	const usingTestSecret = import.meta.env.DEV && testSecretKeys.has(secretKey);
	const configured =
		Boolean(email && secretKey) && (import.meta.env.DEV || !testSecretKeys.has(secretKey));

	return { configured, email, secretKey, usingTestSecret };
}

export const GET: RequestHandler = () => {
	const { configured } = contactConfiguration();
	return noStoreJson({ configured }, configured ? 200 : 503);
};

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const { configured, email, secretKey, usingTestSecret } = contactConfiguration();

	if (!configured || !email || !secretKey) {
		return noStoreJson({ message: 'email reveal is not configured' }, 503);
	}

	const address = clientAddress(
		request,
		getClientAddress,
		env.TRUST_CLOUDFLARE_IP_HEADER?.trim() === 'true'
	);
	const retryAfter = consumeAttempt(address);

	if (retryAfter) {
		return noStoreJson({ message: 'too many verification attempts; try again shortly' }, 429, {
			'retry-after': String(retryAfter)
		});
	}

	const body = (await request.json().catch(() => null)) as { token?: unknown } | null;
	const token = typeof body?.token === 'string' ? body.token.trim() : '';

	if (!token || token.length > 2048) {
		return noStoreJson({ message: 'complete the verification challenge first' }, 400);
	}

	const parameters = new URLSearchParams({
		secret: secretKey,
		response: token,
		remoteip: address,
		idempotency_key: crypto.randomUUID()
	});

	let verification: TurnstileResponse;

	try {
		const response = await fetch(siteverifyUrl, {
			method: 'POST',
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			body: parameters,
			signal: AbortSignal.timeout(10_000)
		});

		if (!response.ok) {
			return noStoreJson({ message: 'verification service is unavailable; try again' }, 502);
		}

		verification = (await response.json()) as TurnstileResponse;
	} catch {
		return noStoreJson({ message: 'verification service is unavailable; try again' }, 502);
	}

	const expectedHostname = env.TURNSTILE_HOSTNAME?.trim();
	const validHostname = !expectedHostname || verification.hostname === expectedHostname;
	const validAction =
		verification.action === TURNSTILE_EMAIL_ACTION || (usingTestSecret && !verification.action);

	if (!verification.success || !validAction || !validHostname) {
		return noStoreJson({ message: 'verification failed; retry the challenge' }, 403);
	}

	return noStoreJson({ email });
};
