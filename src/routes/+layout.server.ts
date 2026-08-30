import { loadTerminalLayoutData } from '$lib/blog';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => loadTerminalLayoutData();
