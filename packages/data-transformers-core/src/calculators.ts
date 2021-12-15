import { clamp, roundTo } from "./math-utils";
import { mpsToKmph } from "./converters";

/**!
 * The sibling of the `converters` module, `calculators` contains **business-specific**
 * calculation functions. Each function should take one or more numbers (+ optionally a
 * value for fractionalDigits) and calculate a return number.
 */

/**
 * Speeds are stored as km/h, but distances are stored as metres and times are
 * stored as seconds. So if an *average* speed is calculated, the result should be
 * in km/h.
 */
export function averageSpeedInKmph(
	distanceInMetres: number,
	timeInSeconds: number,
	fractionalDigits?: number
): number {
	const mps = distanceInMetres / timeInSeconds;
	return fractionalDigits ? roundTo(mpsToKmph(mps), fractionalDigits) : mpsToKmph(mps);
}

/**
 * Given block progress (completed distance) return the metres until block is compeleted (target distance)
 * to the specified fractionalDigits.
 */
export function blockDistanceRemaining(
	targetDistanceInMetres: number,
	completedDistanceInMetres: number,
	fractionalDigits?: number
): number {
	const distanceUntilComplete = clamp(
		targetDistanceInMetres - completedDistanceInMetres,
		targetDistanceInMetres,
		0
	);
	return fractionalDigits ? roundTo(distanceUntilComplete, fractionalDigits) : distanceUntilComplete;
}

/**
 * Given block progress (completed distance) return the percentage progress made on the block (up to
 * target distance) to the specified fractionalDigits.
 */
export function blockPercentageProgress(
	targetDistanceInMetres: number,
	completedDistanceInMetres: number,
	fractionalDigits?: number
): number {
	const distanceUntilComplete = blockDistanceRemaining(
		targetDistanceInMetres,
		completedDistanceInMetres
	);
	const percentageProgress =
		((targetDistanceInMetres - distanceUntilComplete) / targetDistanceInMetres) * 100;
	return fractionalDigits ? roundTo(percentageProgress, fractionalDigits) : percentageProgress;
}
