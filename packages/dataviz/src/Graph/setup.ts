export type GraphConstructor = Partial<GraphData>;

export interface GraphData {
	/** The array of data to be plotted on the y axis. */
	yAxisValues: number[];
	/**
	 * The defined length of the y axis, as in a literal [unitless, but is pixels]
	 * value for length.
	 */
	yAxisSize: number;
	/**
	 * The MINIMUM value to be used on the y axis. By default, this will be zero, but it is
	 * necessary to keep it configurable to allow for data that includes negative values.
	 */
	yAxisMin: number;
	/**
	 * The MAXIMUM value to be used on the y axis. By default this will be the maximum of the
	 * y axis values, but it is necessary to keep it configurable to allow for spacing at
	 * extremities of this graph axis.
	 */
	yAxisMax: number;
	/**
	 * The scaling factor for the y axis. Used to project coordinates onto the rendered graph.
	 */
	yAxisScale: number;
	/**
	 * The step used to generate positions for annotations and grid lines on the y axis.
	 */
	yAxisStep: number;
	/**
	 * The array of data to be plotted on the x axis. For a horizontal series graph, this
	 * will be just the indices of the yAxisValues data.
	 */
	xAxisValues: number[];
	/**
	 * The defined length of the x axis, as in a literal [unitless, but is pixels]
	 * value for length.
	 */
	xAxisSize: number;
	/**
	 * The MINIMUM value to be used on the x axis. By default, this will be zero, but it is
	 * necessary to keep it configurable to allow for data that includes negative values.
	 */
	xAxisMin: number;
	/**
	 * The MAXIMUM value to be used on the x axis. By default this will be the maximum of the
	 * x axis values, but it is necessary to keep it configurable to allow for spacing at
	 * extremities of this graph axis.
	 */
	xAxisMax: number;
	/**
	 * The scaling factor for the x axis. Used to project coordinates onto the rendered graph.
	 */
	xAxisScale: number;
	/**
	 * The step used to generate positions for annotations and grid lines on the x axis.
	 */
	xAxisStep: number;
}

export function createGraph({
	xAxisMax,
	xAxisMin = 0,
	xAxisSize,
	xAxisScale,
	xAxisStep = 1,
	xAxisValues,
	yAxisMax,
	yAxisMin = 0,
	yAxisSize,
	yAxisScale,
	yAxisStep = 1,
	yAxisValues,
}: GraphConstructor): GraphData {
	/**
	 * If neither the x and y axis values are provided, cannot create the graph:
	 */
	if (!xAxisValues && !yAxisValues) {
		throw new Error(
			"ONE OR BOTH x- or y-axis value arrays MUST be provided to create the graph."
		);
	}

	/**
	 * If only one of the x/y axis values are provided, the other axis can be assumed
	 * to be the length of the other (_ie_ the values are plotted on a range/in series):
	 */
	if (yAxisValues && !xAxisValues) {
		xAxisValues = Array.from(
			{ length: yAxisValues.length },
			(_, i) => i + xAxisMin
		);
	} else if (xAxisValues && !yAxisValues) {
		yAxisValues = Array.from(
			{ length: xAxisValues.length },
			(_, i) => i + yAxisMin
		);
	}
	// Once both of the arrays of values are populated, can infer the max values if not present:
	xAxisMax = xAxisMax ?? Math.max(...(xAxisValues as number[]));
	yAxisMax = yAxisMax ?? Math.max(...(yAxisValues as number[]));

	/**
	 * If the x-axis size is *not* provided, then the scale *must* be
	 * provided, otherwise the size of the axis cannot be calculated:
	 */
	if ((!xAxisSize && !xAxisScale) || (xAxisSize && xAxisScale)) {
		throw new Error(
			"EITHER the x-axis size OR the x-axis scale must be provided up-front or this graph axis cannot be plotted."
		);
	} else if (xAxisSize && !xAxisScale) {
		xAxisScale = calculateScale(xAxisSize, xAxisMin, xAxisMax);
	} else if (!xAxisSize && xAxisScale) {
		xAxisSize = calculateSize(xAxisScale, xAxisMin, xAxisMax);
	}

	/**
	 * If the y-axis size is *not* provided, then the scale *must* be
	 * provided, otherwise the size of the axis cannot be calculated:
	 */
	if ((!yAxisSize && !yAxisScale) || (yAxisSize && yAxisScale)) {
		throw new Error(
			"EITHER the y-axis size OR the y-axis scale must be provided up-front or this graph axis cannot be plotted."
		);
	} else if (yAxisSize && !yAxisScale) {
		yAxisScale = calculateScale(yAxisSize, yAxisMin, yAxisMax);
	} else if (!yAxisSize && yAxisScale) {
		yAxisSize = calculateSize(yAxisScale, yAxisMin, yAxisMax);
	}

	return {
		xAxisMax,
		xAxisMin,
		// All branches have been covered to populate following two values,
		// they cannot be undefined at this point, compiler is being overstrict:
		xAxisScale: xAxisScale as number,
		xAxisSize: xAxisSize as number,
		xAxisStep,
		xAxisValues: xAxisValues as number[],
		yAxisMax,
		yAxisMin,
		// All branches have been covered to populate following two values,
		// they cannot be undefined at this point, compiler is being overstrict:
		yAxisScale: yAxisScale as number,
		yAxisSize: yAxisSize as number,
		yAxisStep,
		yAxisValues: yAxisValues as number[],
	};
}

/**
 * Examples:
 *
 * size 100 min 0 max 10 scale 10
 * size 100 min -50 max 50 scale 10
 * size 100 min -25 max 75 scale 10
 * size 100 min -100 max 0 scale 10
 *
 * @param {number} axisSize
 * @param {number} axisMin
 * @param {number} axisMax
 * @returns {number}
 */
export function calculateScale(
	axisSize: number,
	axisMin: number,
	axisMax: number
): number {
	return axisSize / (axisMax - axisMin);
}

/**
 * Examples:
 *
 * scale 10 min 0 max 10 size 100
 * scale 10 min -50 max 50 size 100
 * scale 10 min -25 max 75 size 100
 * scale 10 min -100 max 0 size 100
 *
 * @param {number} axisScale
 * @param {number} axisMin
 * @param {number} axisMax
 * @returns {number}
 */
export function calculateSize(
	axisScale: number,
	axisMin: number,
	axisMax: number
): number {
	return (axisMax - axisMin) * axisScale;
}

/**
 * Examples:
 * coord at 5, size 100, min 0, max 10, scale 10 = 50
 * coord at 5, size 100, min -5, max 5, scale 10 = 100
 * coord at 5, size 100, min -2.5, max 7.5, scale 10 = 75
 * coord at -5, size 100, min -10, max 0, scale 10 = 50
 *
 * If the axis min value is greater than zero, then floor it to zero
 * in the calculation: the graph is plotted on the SVG from a zero
 * point regardless of what the data is.
 *
 * coord at 0, size 100, min 1, max 10, scale 11.1 = 0
 *
 * REVIEW if there are only negative values, there may be an issue here, TEST.
 *
 * @param {GraphData} graphData
 * @param {number} graphData.xAxisMin
 * @param {number} graphData.xAxisScale
 * @param {number} axisCoord
 * @returns {number}
 */
export function projectXCoordToSVG(
	{ xAxisMin, xAxisScale }: GraphData,
	axisCoord: number
): number {
	return (axisCoord - xAxisMin) * xAxisScale;
}

/**
 * As `projectXCoordToSVG`, except that the resulting coordinate is inverted based on the y axis
 * size. This is because SVG coordinates are plotted from the top left, not the bottom left.
 * Leaving the coordinates as-is would cause the graph to be flipped vertically.
 *
 * Examples:
 * coord at 5, size 100, min 0, max 10, scale 10 = 100 - 50 = 50
 * coord at 5, size 100, min -5, max 5, scale 10 = 100 - 100 = 0
 * coord at 5, size 100, min -2.5, max 7.5, scale 10 = 100 - 75 = 25
 * coord at -5, size 100, min -10, max 0, scale 10 = 100 - 50 = 50
 *
 * @param {GraphData} graphData
 * @param {number} graphData.yAxisMin
 * @param {number} graphData.yAxisScale
 * @param {number} graphData.yAxisSize
 * @param {number} axisCoord
 * @returns {number}
 */
export function projectYCoordToSVG(
	{ yAxisMin, yAxisScale, yAxisSize }: GraphData,
	axisCoord: number
): number {
	return yAxisSize - (axisCoord - yAxisMin) * yAxisScale;
}

/**
 * NOTE specific, limited use.
 *
 * As `projectXCoordToSVG`, which will result in an inverted graph,
 * 0 at top, max at bottom. The only usecase for this is a graph
 * that has an axis rendered top to bottom vertically.
 *
 * @param {GraphData} graphData
 * @param {number} graphData.yAxisMin
 * @param {number} graphData.yAxisScale
 * @param {number} axisCoord
 * @returns {number}
 */
export function projectInvertedYCoordToSVG(
	{ yAxisMin, yAxisScale }: GraphData,
	axisCoord: number
): number {
	return (axisCoord - yAxisMin) * yAxisScale;
}

/**
 * Generate an array of x axis coordinates for stepped points along that axis. Used to place annotations.
 *
 * @param {GraphData} graphData
 * @param {number} graphData.xAxisMin
 * @param {number} graphData.xAxisMax
 * @param {number} graphData.xAxisStep
 * @returns {number[]}
 */
export function steppedXAxisValues({
	xAxisMin,
	xAxisMax,
	xAxisStep,
}: GraphData): number[] {
	const vals = [];

	// TODO currently ignoring graphs that only have data with negative values that should be plotted
	// starting on a value < 0.
	if (xAxisMin > 0) {
		for (let v = xAxisMin; v <= xAxisMax; v += xAxisStep) vals.push(v);
		return vals;
	} else {
		vals.push(0);
		for (let v = 0 - xAxisStep; v >= xAxisMin; v -= xAxisStep) vals.unshift(v);
		for (let v = 0 + xAxisStep; v <= xAxisMax; v += xAxisStep) vals.push(v);
		return vals;
	}
}

/**
 * Generate an array of y axis coordinates for stepped points along that axis. Used to place annotations.
 *
 * @param {GraphData} graphData
 * @param {number} graphData.yAxisMin
 * @param {number} graphData.yAxisMax
 * @param {number} graphData.yAxisStep
 * @returns {number[]}
 */
export function steppedYAxisValues({
	yAxisMin,
	yAxisMax,
	yAxisStep,
}: GraphData): number[] {
	const vals = [];

	// TODO currently ignoring graphs that only have data with negative values that should be plotted
	// starting on a value < 0.
	if (yAxisMin > 0) {
		for (let v = yAxisMin; v <= yAxisMax; v += yAxisStep) vals.push(v);
		return vals;
	} else {
		vals.push(0);
		for (let v = 0 - yAxisStep; v >= yAxisMin; v -= yAxisStep) vals.unshift(v);
		for (let v = 0 + yAxisStep; v <= yAxisMax; v += yAxisStep) vals.push(v);
		return vals;
	}
}
