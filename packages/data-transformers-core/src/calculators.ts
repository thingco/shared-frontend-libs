import { clamp, roundTo } from "./math-utils";

/**!
 * The sibling of the `converters` module, `calculators` contains **business-specific**
 * calculation functions. Each function should take one or more numbers (+ optionally a
 * value for precision) and calculate a return number.
 */

/**
 * Given block progress (completed distance) return the metres until block is compeleted (target distance)
 * to the specified precision.
 */
export function blockDistanceRemaining(
	targetDistanceInMetres: number,
	completedDistanceInMetres: number,
	precision?: number
): number {
	const distanceUntilComplete = clamp(
		targetDistanceInMetres - completedDistanceInMetres,
		targetDistanceInMetres,
		0
	);
	return precision ? roundTo(distanceUntilComplete, precision) : distanceUntilComplete;
}

/**
 * Given block progress (completed distance) return the percentage progress made on the block (up to
 * target distance) to the specified precision.
 */
export function blockPercentageProgress(
	targetDistanceInMetres: number,
	completedDistanceInMetres: number,
	precision?: number
): number {
	const distanceUntilComplete = blockDistanceRemaining(
		targetDistanceInMetres,
		completedDistanceInMetres
	);
	const percentageProgress =
		((targetDistanceInMetres - distanceUntilComplete) / targetDistanceInMetres) * 100;
	return precision ? roundTo(percentageProgress, precision) : percentageProgress;
}
