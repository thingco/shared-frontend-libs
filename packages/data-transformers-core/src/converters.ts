import { roundTo } from "./math-utils";

/**!
 * The converter module consists of **generic** unit conversion functions.
 * All take a number and a precision, and return a converted unit at the
 * specified precision.
 *
 * @category Converters
 */

/**
 * Given a numeric distance in metres, return that distance in Km to a given precision.
 *
 * @category Converters
 */
export function metersToKilometers(distanceInMetres: number, precision?: number): number {
	const kilometres = distanceInMetres * 0.001;
	return precision ? roundTo(kilometres, precision) : kilometres;
}

/**
 * Given a numeric distance in metres, return that distance in mi to a given precision.
 *
 * @category Converters
 */
export function metersToMiles(distanceInMetres: number, precision?: number): number {
	const miles = distanceInMetres * 0.000621371;
	return precision ? roundTo(miles, precision) : miles;
}

/**
 * Given a numeric speed in Kmph, return that speed in mph to a given precision.
 *
 * @category Converters
 */
export function kmphToMph(speed: number, precision?: number): number {
	const mph = speed * 0.621371;
	return precision ? roundTo(mph, precision) : mph;
}

/**
 * Given a numeric speed in metres per second, return that speed in Km/ph to a given precision.
 *
 * @category Converters
 */
export function mpsToKmph(speed: number, precision?: number): number {
	const kmph = speed * 3.6;
	return precision ? roundTo(kmph, precision) : kmph;
}

/**
 * Given a numeric speed in metres per second, return that speed in Km/ph to a given precision.
 *
 * @category Converters
 */
export function mpsToMph(speed: number, precision?: number): number {
	const mph = speed * 2.23694;
	return precision ? roundTo(mph, precision) : mph;
}

/**
 * Given duration in seconds, return an object representing the duration in hours, minutes and seconds.
 *
 * @category Converters
 */
export function secondsToDurationObj(duration: number): {
	hours: number;
	minutes: number;
	seconds: number;
} {
	return {
		hours: Math.floor(duration / 3600),
		minutes: Math.floor((duration % 3600) / 60),
		seconds: Math.floor((duration % 3600) % 60),
	};
}

/**
 * Given duration in seconds, return that duration in hours
 *
 * @category Converters
 */
export function secondsToHours(duration: number): number {
	return Math.floor(duration / 3600);
}
