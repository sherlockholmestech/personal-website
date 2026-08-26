import { env } from '$env/dynamic/private';
import {
	noStoreJson,
	turnstileConfiguration,
	validateTurnstileRequest
} from '$lib/server/turnstile';
import { TURNSTILE_EMAIL_ACTION } from '$lib/turnstile';
import type { RequestHandler } from './$types';

function contactConfiguration() {
	const email = env.CONTACT_EMAIL?.trim();
	const { configured: turnstileConfigured } = turnstileConfiguration();
	const configured = Boolean(email && turnstileConfigured);

	return { configured, email };
}

export const GET: RequestHandler = () => {
	const { configured } = contactConfiguration();
	return noStoreJson({ configured }, configured ? 200 : 503);
};

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const { configured, email } = contactConfiguration();

	if (!configured || !email) {
		return noStoreJson({ message: 'email reveal is not configured' }, 503);
	}

	const failure = await validateTurnstileRequest(
		request,
		getClientAddress,
		TURNSTILE_EMAIL_ACTION,
		'contact-email'
	);
	if (failure) return failure;

	return noStoreJson({ email });
};
