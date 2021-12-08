/**
 * Ensure that timestamps returned from the API are always converted to a
 * numeric timestamp understood by JS' `Date` constructor. The timestamp that
 * JS' understands is a number whose representation includes milliseconds, so
 * will be, in-app, 13 digits. It is possible that UNIX Epoch timestamps may
 * be returned from the API, and these do not include milliseconds.
 *
 * @param timestamp - a 10- or 13- digit sequence that may be in the form of a
 *										string or a number.
 * @returns a 13-digit number representing UNIX time including milliseconds.
 */
export function normaliseTimestamp (timestamp: number | string): number {
	timestamp = Number(timestamp)
	if (timestamp.toString().length === 10) {
		timestamp *= 1e3;
	}
	return timestamp;
}
