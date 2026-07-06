export const MOBILE_BREAKPOINT_PX = 760;
export const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT_PX}px)`;
export const TOUCH_OR_MOBILE_MEDIA_QUERY = `${MOBILE_MEDIA_QUERY}, (pointer: coarse)`;

export function isMobileViewport() {
	return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

export function shouldAvoidImplicitFocusViewport() {
	return window.matchMedia(TOUCH_OR_MOBILE_MEDIA_QUERY).matches;
}
