# Repository Guidelines

## Project Structure & Module Organization

This repository is a SvelteKit personal website with a terminal-style interface. Application code lives in `src/lib`; `TerminalWebsite.svelte` provides the main shell, while reusable terminal UI belongs in `src/lib/terminal/components` and shared terminal logic in `src/lib/terminal`. Routes and server loaders live under `src/routes`. Blog posts are MDX files in `src/content/blog`, and general page content is in `src/content`. Place public images, fonts, icons, and `robots.txt` in `static`.

## Build, Test, and Development Commands

- `bun run dev`: start the Vite development server.
- `bun run build`: create a production build.
- `bun run preview`: serve the production build locally for final inspection.
- `bun run check`: synchronize SvelteKit types and run `svelte-check` with `tsconfig.json`.
- `bun run lint`: run Prettier checks and ESLint diagnostics.
- `bun run format`: apply Prettier formatting across the repository.

Before handing off changes, run `bun run check && bun run lint`. Run `bun run build` when modifying routing, server loaders, or production configuration.

## Coding Style & Naming Conventions

Write TypeScript and follow the Svelte 5 patterns already in use, including `$state`, `$derived`, and `$effect`. Let Prettier control indentation and formatting; do not hand-align code. Name Svelte components in PascalCase (`BlogBrowser.svelte`), functions and variables in camelCase, and CSS classes in lowercase kebab-case. Keep components focused, place shared behavior in `src/lib/terminal`, and avoid adding dependencies without prior approval.

## Testing Guidelines

There is no dedicated unit-test framework or coverage requirement. Static checks are the required validation gate. For UI changes, manually inspect desktop and mobile layouts. Exercise terminal commands, route links, blog browsing, post rendering, code blocks, images, error states, and responsive behavior relevant to the change.

## Commit & Pull Request Guidelines

Recent history uses short conventional prefixes such as `feat:` and `fix:`. Write concise, user-visible subjects, for example `fix: align mobile code gutter`. Keep each commit focused. Pull requests should summarize the change, list validation commands, link relevant issues when applicable, and include screenshots or recordings for visual updates.

## Content and Asset Safety

Do not delete or overwrite files in `src/content/blog` or `static` unless the task explicitly requires it. Preserve the established terminal aesthetic and reuse existing components and styles before introducing new patterns.
