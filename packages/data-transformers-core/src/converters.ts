import { roundTo } from "./math-utils";

/**!
 * The converter module consists of **generic** unit conversion functions.
 * All take a number and a fractionalDigits, and return a converted unit at the
 * specified fractionalDigits.
 *
 * @category Converters
 */

/**
 * Given a numeric distance in metres, return that distance in Km to a given fractionalDigits.
 *
 * @category Converters
 */
export function metersToKilometers(distanceInMetres: number, fractionalDigits?: number): number {
	const kilometres = distanceInMetres * 0.001;
	return fractionalDigits ? roundTo(kilometres, fractionalDigits) : kilometres;
}

/**
 * Given a numeric distance in metres, return that distance in mi to a given fractionalDigits.
 *
 * @category Converters
 */
export function metersToMiles(distanceInMetres: number, fractionalDigits?: number): number {
	const miles = distanceInMetres * 0.000621371;
	return fractionalDigits ? roundTo(miles, fractionalDigits) : miles;
}

/**
 * Given a numeric speed in Kmph, return that speed in mph to a given fractionalDigits.
 *
 * @category Converters
 */
export function kmphToMph(speed: number, fractionalDigits?: number): number {
	const mph = speed * 0.621371;
	return fractionalDigits ? roundTo(mph, fractionalDigits) : mph;
}

/**
 * Given a numeric speed in metres per second, return that speed in Km/ph to a given fractionalDigits.
 *
 * @category Converters
 */
export function mpsToKmph(speed: number, fractionalDigits?: number): number {
	const kmph = speed * 3.6;
	return fractionalDigits ? roundTo(kmph, fractionalDigits) : kmph;
}

/**
 * Given a numeric speed in metres per second, return that speed in Km/ph to a given fractionalDigits.
 *
 * @category Converters
 */
export function mpsToMph(speed: number, fractionalDigits?: number): number {
	const mph = speed * 2.23694;
	return fractionalDigits ? roundTo(mph, fractionalDigits) : mph;
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
