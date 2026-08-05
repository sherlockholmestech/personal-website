const fuzzyPickerNavigationKeys = new Set(['ArrowUp', 'ArrowDown', 'Enter']);

export function shouldHandleFuzzyPickerKeydown(
	event: KeyboardEvent,
	queryInput?: HTMLInputElement
) {
	if (
		!fuzzyPickerNavigationKeys.has(event.key) ||
		event.defaultPrevented ||
		event.isComposing ||
		event.altKey ||
		event.ctrlKey ||
		event.metaKey ||
		event.shiftKey
	) {
		return false;
	}

	const target = event.target;
	if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
		return true;
	}

	if (!(target instanceof HTMLElement) || target === queryInput) {
		return true;
	}

	return !target.closest('button, a, input, textarea, select, [role="button"], [role="option"]');
}
