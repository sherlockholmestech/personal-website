const maxAttemptBuckets = 2048;

type AttemptBucket = {
	count: number;
	resetAt: number;
};

const attemptBuckets = new Map<string, AttemptBucket>();

export function consumeRateLimit(key: string, maxAttempts = 6, windowMs = 60_000): number {
	const now = Date.now();
	const bucket = attemptBuckets.get(key);

	if (!bucket || bucket.resetAt <= now) {
		if (bucket) attemptBuckets.delete(key);
		pruneBuckets(now);
		attemptBuckets.set(key, { count: 1, resetAt: now + windowMs });
		return 0;
	}

	if (bucket.count >= maxAttempts) {
		return Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
	}

	bucket.count += 1;
	return 0;
}

function pruneBuckets(now: number) {
	if (attemptBuckets.size < maxAttemptBuckets) return;

	for (const [key, value] of attemptBuckets) {
		if (value.resetAt <= now) attemptBuckets.delete(key);
	}

	while (attemptBuckets.size >= maxAttemptBuckets) {
		const oldestKey = attemptBuckets.keys().next().value;
		if (typeof oldestKey !== 'string') break;
		attemptBuckets.delete(oldestKey);
	}
}
