import { GraphData, steppedXAxisValues, steppedYAxisValues } from "../create-graph";

export interface LineCoordinate {
	x1: number;
	x2: number;
	y1: number;
	y2: number;
}
export interface PointCoordinate {
	x: number;
	y: number;
}

export type VerticalAlignment = "top" | "zero" | "bottom";
export type HorizontalAlignment = "left" | "zero" | "right";

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
export function projectXCoordToSVG({ xAxisMin, xAxisScale }: GraphData, axisCoord: number): number {
	return (axisCoord - xAxisMin) * xAxisScale;
}

export const px = projectXCoordToSVG;

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

export const py = projectYCoordToSVG;

/**
 * @param graph
 * @param xPosition
 */
export function verticalLineFullHeight(graph: GraphData, xPosition: number): LineCoordinate {
	return {
		x1: px(graph, xPosition),
		x2: px(graph, xPosition),
		y1: 0,
		y2: graph.yAxisSize,
	};
}

/**
 * @param graph
 * @param yPosition
 */
export function horizontalLineFullWidth(graph: GraphData, yPosition: number): LineCoordinate {
	return {
		x1: 0,
		x2: graph.xAxisSize,
		y1: py(graph, yPosition),
		y2: py(graph, yPosition),
	};
}

/**
 * @param graph
 */
export function yAxis(graph: GraphData): LineCoordinate {
	const xPlacement = graph.xAxisMin > 0 ? graph.xAxisMin : 0;

	return verticalLineFullHeight(graph, xPlacement);
}

/**
 * @param graph
 */
export function yAxisAnnotations(graph: GraphData): PointCoordinate[] {
	const xPlacement = graph.xAxisMin > 0 ? graph.xAxisMin : 0;

	return steppedYAxisValues(graph).map((v) => ({
		x: px(graph, xPlacement),
		y: py(graph, v),
	}));
}

/**
 * @param graph
 */
export function horizontalGridLines(graph: GraphData): LineCoordinate[] {
	return steppedYAxisValues(graph).map((v) => horizontalLineFullWidth(graph, v));
}

/**
 * @param graph
 */
export function yAxisSteps(graph: GraphData): LineCoordinate[] {
	return steppedYAxisValues(graph).map((v) => ({
		x1: px(graph, 0),
		x2: px(graph, 0) - 2,
		y1: py(graph, v),
		y2: py(graph, v),
	}));
}

/**
 * @param graph
 * @param position
 */
export function xAxis(graph: GraphData, position = "bottom"): LineCoordinate {
	return horizontalLineFullWidth(graph, position === "top" ? graph.yAxisMax : 0);
}

/**
 * @param graph
 * @param position
 */
export function xAxisSteps(graph: GraphData, position: VerticalAlignment): LineCoordinate[] {
	return steppedXAxisValues(graph).map((v) => ({
		x1: px(graph, v),
		x2: px(graph, v),
		y1: position === "top" ? py(graph, graph.yAxisMax) : py(graph, 0),
		y2: position === "top" ? py(graph, graph.yAxisMax) - 2 : py(graph, 0) + 2,
	}));
}

/**
 * @param graph
 * @param position
 */
export function xAxisAnnotations(graph: GraphData, position = "bottom"): PointCoordinate[] {
	return steppedXAxisValues(graph).map((v) => ({
		x: px(graph, v),
		y: py(graph, position === "top" ? graph.yAxisMax : 0),
	}));
}

/**
 * @param graph
 */
export function verticalGridlines(graph: GraphData): LineCoordinate[] {
	return steppedXAxisValues(graph).map((v) => verticalLineFullHeight(graph, v));
}

/**
 * @param graph
 */
export function dotPoints(graph: GraphData): PointCoordinate[] {
	return graph.yAxisValues.map((v, i) => ({
		x: px(graph, graph.xAxisValues[i]),
		y: py(graph, v),
	}));
}

/**
 * @param graph
 */
export function linePoints(graph: GraphData): string {
	return graph.yAxisValues
		.map((v, i) => `${px(graph, graph.xAxisValues[i])},${py(graph, v)}`)
		.join(" ");
}

/**
 * @param graph
 */
export function horizontalLineBarPoints(graph: GraphData): LineCoordinate[] {
	return graph.xAxisValues.map((v, i) => ({
		x1: px(graph, 0),
		x2: px(graph, v),
		y1: py(graph, graph.yAxisValues[i]),
		y2: py(graph, graph.yAxisValues[i]),
	}));
}

/**
 * @param graph
 */
export function verticalLineBarPoints(graph: GraphData): LineCoordinate[] {
	return graph.yAxisValues.map((v, i) => ({
		x1: px(graph, graph.xAxisValues[i]),
		x2: px(graph, graph.xAxisValues[i]),
		y1: py(graph, 0),
		y2: py(graph, v),
	}));
}
