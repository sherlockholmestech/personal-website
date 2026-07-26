import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { basename, isAbsolute, relative, resolve } from 'node:path';
import { Readable } from 'node:stream';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

const contentTypes: Record<string, string> = {
	'.7z': 'application/x-7z-compressed',
	'.gz': 'application/gzip',
	'.pdf': 'application/pdf',
	'.tar': 'application/x-tar',
	'.tgz': 'application/gzip',
	'.txt': 'text/plain; charset=utf-8',
	'.zip': 'application/zip'
};

const download: RequestHandler = async ({ params, request }) => {
	const requestedFile = params.file;
	if (!requestedFile || requestedFile.includes('\\') || requestedFile.includes('\0')) {
		return notFound();
	}

	try {
		const root = await realpath(env.DIST_DIR ?? resolve(process.cwd(), 'dists'));
		const file = await realpath(resolve(root, requestedFile));
		const relativeFile = relative(root, file);

		if (!relativeFile || relativeFile.startsWith('..') || isAbsolute(relativeFile)) {
			return notFound();
		}

		const fileStat = await stat(file);
		if (!fileStat.isFile()) {
			return notFound();
		}

		const range = parseRange(request.headers.get('range'), fileStat.size);
		if (range === 'invalid') {
			return new Response(null, {
				status: 416,
				headers: {
					'Accept-Ranges': 'bytes',
					'Content-Range': `bytes */${fileStat.size}`
				}
			});
		}

		const start = range?.start ?? 0;
		const end = range?.end ?? Math.max(0, fileStat.size - 1);
		const headers = new Headers({
			'Accept-Ranges': 'bytes',
			'Cache-Control': 'public, max-age=3600',
			'Content-Disposition': contentDisposition(basename(file)),
			'Content-Length': String(range ? end - start + 1 : fileStat.size),
			'Content-Type': contentType(file)
		});

		if (range) {
			headers.set('Content-Range', `bytes ${start}-${end}/${fileStat.size}`);
		}

		if (request.method === 'HEAD' || fileStat.size === 0) {
			return new Response(null, { status: range ? 206 : 200, headers });
		}

		const stream = createReadStream(file, range ? { start, end } : undefined);
		return new Response(Readable.toWeb(stream) as ReadableStream, {
			status: range ? 206 : 200,
			headers
		});
	} catch {
		return notFound();
	}
};

export const GET = download;
export const HEAD = download;

function parseRange(value: string | null, size: number) {
	if (!value) return;

	const match = value.match(/^bytes=(\d*)-(\d*)$/);
	if (!match || size === 0) return 'invalid' as const;

	const startText = match[1];
	const endText = match[2];
	if (!startText && !endText) return 'invalid' as const;

	let start: number;
	let end: number;

	if (!startText) {
		const suffixLength = Number(endText);
		if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) return 'invalid' as const;
		start = Math.max(0, size - suffixLength);
		end = size - 1;
	} else {
		start = Number(startText);
		end = endText ? Number(endText) : size - 1;
	}

	if (
		!Number.isSafeInteger(start) ||
		!Number.isSafeInteger(end) ||
		start < 0 ||
		start >= size ||
		end < start
	) {
		return 'invalid' as const;
	}

	return { start, end: Math.min(end, size - 1) };
}

function contentDisposition(filename: string) {
	const fallback = filename.replace(/[^\x20-\x7e]|["\\]/g, '_');
	return `attachment; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

function contentType(file: string) {
	const extension = file.slice(file.lastIndexOf('.')).toLowerCase();
	return contentTypes[extension] ?? 'application/octet-stream';
}

function notFound() {
	return new Response('Distribution not found', { status: 404 });
}
