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
		slug: 'ndp-2026',
		title: 'NDP 2026',
		description: "Fireworks!",
		photographs: [
			{
				id: 'ndp-2026-2026-08-09-201532',
				src: '/photography/ndp-2026/20260809_201532_watermark.jpg',
				alt: 'White fireworks blooming above the National Day celebrations.',
				date: '2026-08-09',
				width: 2879,
				height: 2879
			},
			{
				id: 'ndp-2026-2026-08-09-201536',
				src: '/photography/ndp-2026/20260809_201536_watermark.jpg',
				alt: 'Two white fireworks against the night sky.',
				date: '2026-08-09',
				width: 3824,
				height: 2864
			},
			{
				id: 'ndp-2026-2026-08-09-201544',
				src: '/photography/ndp-2026/20260809_201544_watermark.jpg',
				alt: 'Red and white fireworks bursting through a smoky sky.',
				date: '2026-08-09',
				width: 3833,
				height: 2877
			},
			{
				id: 'ndp-2026-2026-08-09-201547-1',
				src: '/photography/ndp-2026/20260809_201547_1_watermark.jpg',
				alt: 'Red fireworks filling the night sky.',
				date: '2026-08-09',
				width: 2952,
				height: 1968
			},
			{
				id: 'ndp-2026-2026-08-09-201555',
				src: '/photography/ndp-2026/20260809_201555_watermark.jpg',
				alt: 'A large white firework with trailing sparks.',
				date: '2026-08-09',
				width: 3824,
				height: 2864
			},
			{
				id: 'ndp-2026-2026-08-09-201556',
				src: '/photography/ndp-2026/20260809_201556_watermark.jpg',
				alt: 'White and red fireworks above rising golden trails.',
				date: '2026-08-09',
				width: 3824,
				height: 2864
			},
			{
				id: 'ndp-2026-2026-08-09-201605',
				src: '/photography/ndp-2026/20260809_201605_watermark.jpg',
				alt: 'Overlapping white and red fireworks framed by palm leaves.',
				date: '2026-08-09',
				width: 3824,
				height: 2864
			},
			{
				id: 'ndp-2026-2026-08-09-201609',
				src: '/photography/ndp-2026/20260809_201609_watermark.jpg',
				alt: 'Teal and violet fireworks glowing against the night sky.',
				date: '2026-08-09',
				width: 2516,
				height: 2516
			},
			{
				id: 'ndp-2026-2026-08-09-201614',
				src: '/photography/ndp-2026/20260809_201614_watermark.jpg',
				alt: 'Bright red and white fireworks above smaller golden bursts.',
				date: '2026-08-09',
				width: 3824,
				height: 2864
			},
			{
				id: 'ndp-2026-2026-08-09-201629-1',
				src: '/photography/ndp-2026/20260809_201629_1_watermark.jpg',
				alt: 'A dense red firework above vertical launch trails.',
				date: '2026-08-09',
				width: 2863,
				height: 2863
			},
			{
				id: 'ndp-2026-2026-08-09-201832',
				src: '/photography/ndp-2026/20260809_201832_watermark.jpg',
				alt: 'A spectator filming golden fireworks on a smartphone.',
				date: '2026-08-09',
				width: 3824,
				height: 2864
			},
			{
				id: 'ndp-2026-2026-08-09-201833',
				src: '/photography/ndp-2026/20260809_201833_watermark.jpg',
				alt: 'A spectator filming two white fireworks on a smartphone.',
				date: '2026-08-09',
				width: 3824,
				height: 2864
			},
			{
				id: 'ndp-2026-2026-08-09-201835',
				src: '/photography/ndp-2026/20260809_201835_watermark.jpg',
				alt: 'A phone screen beneath red, white, and blue fireworks.',
				date: '2026-08-09',
				width: 3824,
				height: 2864
			},
			{
				id: 'ndp-2026-2026-08-09-201845',
				src: '/photography/ndp-2026/20260809_201845_watermark.jpg',
				alt: 'Green and red fireworks above silhouettes of spectators.',
				date: '2026-08-09',
				width: 3824,
				height: 2864
			},
			{
				id: 'ndp-2026-2026-08-09-201912',
				src: '/photography/ndp-2026/20260809_201912_watermark.jpg',
				alt: 'Golden fireworks and launch trails across the night sky.',
				date: '2026-08-09',
				width: 2862,
				height: 1908
			},
			{
				id: 'ndp-2026-2026-08-09-201913-1',
				src: '/photography/ndp-2026/20260809_201913_1_watermark.jpg',
				alt: 'A broad canopy of white fireworks over a red glow.',
				featured: true,
				date: '2026-08-09',
				width: 3822,
				height: 2548
			},
			{
				id: 'ndp-2026-2026-08-09-201937',
				src: '/photography/ndp-2026/20260809_201937_watermark.jpg',
				alt: 'A spectator framing golden fireworks on a smartphone.',
				date: '2026-08-09',
				width: 3824,
				height: 2864
			},
			{
				id: 'ndp-2026-2026-08-09-202149',
				src: '/photography/ndp-2026/20260809_202149_watermark.jpg',
				alt: 'A row of white fireworks above thin launch trails.',
				date: '2026-08-09',
				width: 3824,
				height: 2864
			},
			{
				id: 'ndp-2026-2026-08-09-202152',
				src: '/photography/ndp-2026/20260809_202152_watermark.jpg',
				alt: 'A row of red fireworks glowing through smoke.',
				date: '2026-08-09',
				width: 3824,
				height: 2864
			},
			{
				id: 'ndp-2026-2026-08-09-202155',
				src: '/photography/ndp-2026/20260809_202155_watermark.jpg',
				alt: 'Five white fireworks blooming in a line.',
				date: '2026-08-09',
				width: 3822,
				height: 2548
			},
			{
				id: 'ndp-2026-2026-08-09-202203',
				src: '/photography/ndp-2026/20260809_202203_watermark.jpg',
				alt: 'Layered golden and white fireworks at the finale.',
				date: '2026-08-09',
				width: 3822,
				height: 2548
			}
		]
	},
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
