/**
 * Given a number, round it to a specified precision. Note that
 * this helper function is primarily for use in testing to avoid
 * floating point rounding errors messing the tests up.
 */
export function roundTo(num: number, precision: number): number {
	const f = 10 ** precision;
	return Math.round((num + Number.EPSILON) * f) / f;
}

/**
 * Given a number and an upper and a lower bound, return the number clamped to that range.
 * Primarily used to ensure data that comes from the API always returns a sane value on
 * the frontend.
 */
export function clamp(num: number, upper: number, lower: number): number {
	return Math.min(upper, Math.max(lower, num));
}
