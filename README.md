# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
bun x sv@0.15.3 create --template minimal --types ts --add prettier eslint tailwindcss="plugins:typography" --install bun .
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

## Photography collections

The `photography` terminal command reads its collections from
`src/content/photography.ts`. Copy each collection's images into
`static/photography/<collection-slug>/`, then add its metadata:

```ts
export const photographyCollections: PhotographyCollection[] = [
	{
		slug: 'street',
		title: 'Street',
		description: 'Unscripted moments in the city.',
		photographs: [
			{
				id: 'street-001',
				src: '/photography/street/street-001.jpg',
				thumbnailSrc: '/photography/street/street-001-640.jpg',
				thumbnailSrcset:
					'/photography/street/street-001-640.jpg 640w, /photography/street/street-001-960.jpg 960w',
				alt: 'Describe what is visibly present in the photograph.',
				title: 'Photograph title',
				description: 'Optional visible caption for the photograph.',
				location: 'Singapore',
				date: '2026',
				camera: 'Camera and lens',
				width: 2400,
				height: 1600
			}
		]
	}
];
```

Run `photography` to show every collection or `photography street` to show one.
`thumbnailSrc` and `thumbnailSrcset` are optional but recommended for full-resolution originals.

Collections also appear under `~/photography` in the virtual filesystem. Running
`cat` on an image opens its expanded view. Public photograph URLs use the image
filename without its extension:

```text
/photography/natural-phenomena/20260613_184334_watermark
```

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
