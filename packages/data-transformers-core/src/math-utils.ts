/**
 * Given a number, round it to a specified number of fractionalDigits.
 */
export function roundTo(num: number, fractionalDigits: number): number {
	const f = 10 ** fractionalDigits;
	return Math.round((num + Number.EPSILON) * f) / f;
}

/**
 * Given a number and an upper and a lower bound, return the number clamped to
 * that range. Primarily used to ensure data that comes from the API always
 * returns a sane value on the frontend.
 */
export function clamp(num: number, upper: number, lower: number): number {
	return Math.min(upper, Math.max(lower, num));
}
