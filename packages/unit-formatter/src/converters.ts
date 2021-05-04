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
 * Given a numeric distance in metres, return that distance in Km to a given precision.
 */
export function metersToKilometers(distanceInMeters: number, precision?: number): number {
	const kilometers = distanceInMeters * 0.001;
	return precision ? roundTo(kilometers, precision) : kilometers;
}

/**
 * Given a numeric distance in metres, return that distance in mi to a given precision.
 */
export function metersToMiles(distanceInMeters: number, precision?: number): number {
	const miles = distanceInMeters * 0.000621371;
	return precision ? roundTo(miles, precision) : miles;
}

/**
 * Given a numeric speed in Kmph, return that speed in mph to a given precision.
 */
export function kmphToMph(speed: number, precision?: number): number {
	const mph = speed * 0.621371;
	return precision ? roundTo(mph, precision) : mph;
}

/**
 * Given duration in seconds, return an object representing the duration in hours, minutes and seconds.
 */
export function secondsToDurationObj(
	duration: number
): { hours: number; minutes: number; seconds: number } {
	return {
		hours: Math.floor(duration / 3600),
		minutes: Math.floor((duration % 3600) / 60),
		seconds: Math.floor((duration % 3600) % 60),
	};
}
