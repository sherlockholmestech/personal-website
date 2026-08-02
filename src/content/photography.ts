export type Photograph = {
	id: string;
	src: string;
	thumbnailSrc?: string;
	thumbnailSrcset?: string;
	alt: string;
	title: string;
	description?: string;
	location?: string;
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
				title: 'Sunset_1',
				date: '2026-06-13',
				camera: 'Honor Magic6 Pro (HONOR BVL-N49)',
				width: 3813,
				height: 2850
			},
			{
				id: 'natural-phenomena-2026-04-24',
				src: '/photography/natural-phenomena/20260424_075448_watermark.jpg',
				alt: 'Rainbow..?',
				title: 'Rainbow_1',
				date: '2026-04-24',
				camera: 'Honor Magic6 Pro (HONOR BVL-N49)',
				width: 2814,
				height: 2211
			}
		]
	}
];
