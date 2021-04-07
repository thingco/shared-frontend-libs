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
 * @param {GraphData} graphData - the renderer-agnostic GraphData object
 * @param {number} graphData.xAxisMin - the smallest value on the rendered x-axis, will generally be 0
 * @param {number} graphData.xAxisScale - the unitless size of the entire rendered x-axis
 * @param {number} axisCoord - the x-axis coordinate to project to SVG
 * @returns {number} a single x coordinate in SVG space
 */
export function projectXCoordToSVG({ xAxisMin, xAxisScale }: GraphData, axisCoord: number): number {
	return (axisCoord - xAxisMin) * xAxisScale;
}

export const px: typeof projectXCoordToSVG = projectXCoordToSVG;

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
 * @param {GraphData} graphData - the renderer-agnostic GraphData object
 * @param {number} graphData.yAxisMin - the smallest value on the rendered y-axis, will generally be 0
 * @param {number} graphData.yAxisScale - the scale used for the y-axis
 * @param {number} graphData.yAxisSize - the unitless size of the entire rendered y-axis
 * @param {number} axisCoord - the y-axis coordinate to project to SVG
 * @returns {number} a single y coordinate in SVG space
 */
export function projectYCoordToSVG(
	{ yAxisMin, yAxisScale, yAxisSize }: GraphData,
	axisCoord: number
): number {
	return yAxisSize - (axisCoord - yAxisMin) * yAxisScale;
}

export const py: typeof projectYCoordToSVG = projectYCoordToSVG;

/**
 * @param {GraphData} graph - the renderer-agnostic GraphData object
 * @param {number} xPosition - the coordinate on the x-axis that the line should be rendered at
 * @returns {LineCoordinate} coordinates for placing a single vertical line on the graph
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
 * @param {GraphData} graph - the renderer-agnostic GraphData object
 * @param {number} yPosition - the coordinate on the y-axis that the line should be rendered at
 * @returns {LineCoordinate} coordinates for placing a single horizontal line on the graph
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
 *
 * @param {GraphData} graph - the renderer-agnostic GraphData object
 * @returns {LineCoordinate} line coordinate for the graph's y-axis
 */
export function yAxis(graph: GraphData): LineCoordinate {
	const xPlacement = graph.xAxisMin > 0 ? graph.xAxisMin : 0;

	return verticalLineFullHeight(graph, xPlacement);
}

/**
 * @param {GraphData} graph - the renderer-agnostic GraphData object
 * @returns {LineCoordinate[]} - an array of coordinates used for placing small horizontal lines at
 * specified steps on the graph's y-axis to match the annotations.
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
 * @param {GraphData} graph - the renderer-agnostic GraphData object
 * @returns {PointCoordinate[]} - an array of coordinates for placing annotaions on the graph's y-axis
 */
export function yAxisAnnotations(graph: GraphData): PointCoordinate[] {
	const xPlacement = graph.xAxisMin > 0 ? graph.xAxisMin : 0;

	return steppedYAxisValues(graph).map((v) => ({
		x: px(graph, xPlacement),
		y: py(graph, v),
	}));
}

/**
 * @param {GraphData} graph - the renderer-agnostic GraphData object
 * @returns {LineCoordinate[]} - an array of coordinates for placing horizontal lines at specified steps on the graph
 */
export function horizontalGridLines(graph: GraphData): LineCoordinate[] {
	return steppedYAxisValues(graph).map((v) => horizontalLineFullWidth(graph, v));
}

/**
 * @param {GraphData} graph - the renderer-agnostic GraphData object
 * @param {VerticalAlignment} position - where the x-axis line is placed on the rendered graph
 * @returns {LineCoordinate} - line coordinate for the graph's y-axis
 */
export function xAxis(graph: GraphData, position: VerticalAlignment = "bottom"): LineCoordinate {
	return horizontalLineFullWidth(graph, position === "top" ? graph.yAxisMax : 0);
}

/**
 * @param {GraphData} graph - the renderer-agnostic GraphData object
 * @param {VerticalAlignment} position - where the x-axis line has been placed on the rendered graph;
 * if at the top, then the lines need to extend upwards, otherwise they will extend down.
 * @returns {LineCoordinate[]} - an array of coordinates for placing small vertical lines at specified
 * steps on the graph's x-axis to match the annotations.
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
 * @param {GraphData} graph - the renderer-agnostic GraphData object
 * @param {VerticalAlignment} position - where the x-axis line has been placed on the rendered graph;
 * if at the top, then the annotations need to sit above it, otherwise they will sit below.
 * @returns {PointCoordinate[]} - an array of coordinates for placing annotaions on the graph's x-axis
 */
export function xAxisAnnotations(graph: GraphData, position = "bottom"): PointCoordinate[] {
	return steppedXAxisValues(graph).map((v) => ({
		x: px(graph, v),
		y: py(graph, position === "top" ? graph.yAxisMax : 0),
	}));
}

/**
 * @param {GraphData} graph - the renderer-agnostic GraphData object
 * @returns {LineCoordinate[]} - an array of coordinates for placing vertical lines at specified steps on the graph
 */
export function verticalGridlines(graph: GraphData): LineCoordinate[] {
	return steppedXAxisValues(graph).map((v) => verticalLineFullHeight(graph, v));
}

/**
 * @param {GraphData} graph - the renderer-agnostic GraphData object
 * @returns {PointCoordinate[]} -  an array of points plotted on the graph. Produces a dot graph.
 */
export function dotPoints(graph: GraphData): PointCoordinate[] {
	return graph.yAxisValues.map((v, i) => ({
		x: px(graph, graph.xAxisValues[i]),
		y: py(graph, v),
	}));
}

/**
 * @param {GraphData} graph - the renderer-agnostic GraphData object
 * @returns {string} - a string version of `dotPoints`, used to render a polyline instead of
 * individual data points. Produces a line graph.
 */
export function linePoints(graph: GraphData): string {
	return graph.yAxisValues
		.map((v, i) => `${px(graph, graph.xAxisValues[i])},${py(graph, v)}`)
		.join(" ");
}

/**
 * @param {GraphData} graph - the renderer-agnostic GraphData object
 * @returns {LineCoordinate[]} - an array of horizontal line coordinates plotted from the
 * graph data. Produces a bar graph.
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
 * @param {GraphData} graph - the renderer-agnostic GraphData object
 * @returns {LineCoordinate[]} - an array of vertical line coordinates plotted from the graph data.
 * Produces a bar graph.
 */
export function verticalLineBarPoints(graph: GraphData): LineCoordinate[] {
	return graph.yAxisValues.map((v, i) => ({
		x1: px(graph, graph.xAxisValues[i]),
		x2: px(graph, graph.xAxisValues[i]),
		y1: py(graph, 0),
		y2: py(graph, v),
	}));
}
