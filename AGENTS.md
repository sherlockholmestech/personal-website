# Repository Guidelines

## Project Structure & Module Organization

This is a SvelteKit personal website with a terminal-style UI. Core application code lives in `src/lib`, with the main shell in `src/lib/TerminalWebsite.svelte` and reusable terminal components in `src/lib/terminal/components`. Blog content is stored as MDX in `src/content/blog`. Routes live in `src/routes`; shared styling is split across `src/routes/styles/*.css` and imported through `src/routes/layout.css`. Static assets, fonts, images, and icons live in `static`.

## Build, Test, and Development Commands

- `bun run dev`: start the local Vite/SvelteKit dev server.
- `bun run check`: run `svelte-check` with the project TypeScript config.
- `bun run lint`: check Prettier formatting and ESLint diagnostics.
- `bun run format`: format the repository with Prettier.
- `bun run build`: create a production build.

Run `bun run check && bun run lint` before handing off changes.

## Coding Style & Naming Conventions

Use TypeScript and Svelte 5 conventions already present in the codebase. Prefer `$state`, `$derived`, and `$effect` patterns used in existing components. Keep component names in PascalCase, helpers/types in camelCase, and CSS classes lowercase with hyphenated names. Prefer small, focused components under `src/lib/terminal/components` and shared logic under `src/lib/terminal`.

## Testing Guidelines

There is no dedicated unit test suite currently. Treat `bun run check` and `bun run lint` as the required validation gate. For UI changes, manually inspect desktop and mobile views, especially terminal commands, blog browsing, post reading, code blocks, and responsive layout.

## Commit & Pull Request Guidelines

Recent commits use short conventional prefixes such as `feat:` and `fix:`. Keep commit messages concise and focused on the user-visible change, for example `fix: align mobile code gutter`. Pull requests should include a short summary, validation commands run, and screenshots or screen recordings for visual changes.

## Agent-Specific Instructions

Do not delete or overwrite user content in `src/content/blog` or `static` unless explicitly requested. Match existing styling and terminal aesthetics before introducing new UI patterns. Avoid adding new dependencies unless the project already uses the library or the user approves it.
