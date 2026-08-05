export type Photograph = {
	id: string;
	src: string;
	thumbnailSrc?: string;
	thumbnailSrcset?: string;
	alt: string;
	featured?: boolean;
	date?: string;
	camera?: string;
	width: number;
	height: number;
};

export type PhotographyCollection = {
	slug: string;
	title: string;
	description?: string;
	photographs: Photograph[];
};

// Add published collections here after copying image files to
// static/photography/<collection>. Keep alt text descriptive and factual.
export const photographyCollections: PhotographyCollection[] = [
	{
		slug: 'natural-phenomena',
		title: 'Natural Phenomena',
		description: 'The fleeting phenomena of nature that we see in concrete jungles.',
		photographs: [
			{
				id: 'natural-phenomena-2026-06-13',
				src: '/photography/natural-phenomena/20260613_184334_watermark.jpg',
				alt: 'Pink as ever...',
				date: '2026-06-13',
				camera: 'Honor Magic6 Pro (HONOR BVL-N49)',
				width: 3813,
				height: 2850
			},
			{
				id: 'natural-phenomena-2026-04-24',
				src: '/photography/natural-phenomena/20260424_075448_watermark.jpg',
				alt: 'Rainbow..?',
				date: '2026-04-24',
				camera: 'Honor Magic6 Pro (HONOR BVL-N49)',
				width: 2814,
				height: 2211
			}
		]
	},
	{
		slug: 'new-year-2026',
		title: 'New Year 2026',
		description: 'Fireworks over Marina Bay at the turn of the year.',
		photographs: [
			{
				id: 'new-year-2026-2025-12-31-234817',
				src: '/photography/new-year-2026/IMG_20251231_234817_watermark.jpg',
				alt: 'A white firework framed by dark tree branches.',
				featured: true,
				date: '2025-12-31',
				camera: 'Honor Magic6 Pro (HONOR BVL-N49)',
				width: 4096,
				height: 3072
			},
			{
				id: 'new-year-2026-2025-12-31-234910',
				src: '/photography/new-year-2026/IMG_20251231_234910_watermark.jpg',
				alt: 'Green fireworks beneath Marina Bay Sands, framed by trees.',
				date: '2025-12-31',
				camera: 'Honor Magic6 Pro (HONOR BVL-N49)',
				width: 4096,
				height: 3072
			},
			{
				id: 'new-year-2026-2025-12-31-234911',
				src: '/photography/new-year-2026/IMG_20251231_234911_watermark.jpg',
				alt: 'Green and white fireworks in front of Marina Bay Sands.',
				date: '2025-12-31',
				camera: 'Honor Magic6 Pro (HONOR BVL-N49)',
				width: 4096,
				height: 3072
			},
			{
				id: 'new-year-2026-2025-12-31-234925',
				src: '/photography/new-year-2026/IMG_20251231_234925_watermark.jpg',
				alt: 'Fireworks and smoke rising before Marina Bay Sands above a crowd.',
				date: '2025-12-31',
				camera: 'Honor Magic6 Pro (HONOR BVL-N49)',
				width: 2485,
				height: 2485
			},
			{
				id: 'new-year-2026-2026-01-01-011916',
				src: '/photography/new-year-2026/IMG_20260101_011916_watermark.jpg',
				alt: 'The moon glowing through layered clouds after midnight.',
				date: '2026-01-01',
				camera: 'Honor Magic6 Pro (HONOR BVL-N49)',
				width: 1950,
				height: 2346
			},
			{
				id: 'new-year-2026-2026-01-01-000219',
				src: '/photography/new-year-2026/IMG_20260101_000219_watermark.jpg',
				alt: 'Orange and white fireworks blooming through a smoke-filled sky.',
				date: '2026-01-01',
				camera: 'Honor Magic6 Pro (HONOR BVL-N49)',
				width: 4096,
				height: 3072
			},
			{
				id: 'new-year-2026-2026-01-01-000228-1',
				src: '/photography/new-year-2026/IMG_20260101_000228_1_watermark.jpg',
				alt: 'Three orange, white, and green fireworks against the night sky.',
				date: '2026-01-01',
				camera: 'Honor Magic6 Pro (HONOR BVL-N49)',
				width: 4096,
				height: 3072
			},
			{
				id: 'new-year-2026-2026-01-01-000228',
				src: '/photography/new-year-2026/IMG_20260101_000228_watermark.jpg',
				alt: 'Red, orange, and pale green fireworks filling the night sky.',
				date: '2026-01-01',
				camera: 'Honor Magic6 Pro (HONOR BVL-N49)',
				width: 4096,
				height: 3072
			},
			{
				id: 'new-year-2026-2026-01-01-000945',
				src: '/photography/new-year-2026/IMG_20260101_000945_watermark.jpg',
				alt: 'Firework trails above trees, a bridge, and a historic building.',
				date: '2026-01-01',
				camera: 'Honor Magic6 Pro (HONOR BVL-N49)',
				width: 4051,
				height: 3012
			}
		]
	}
];
