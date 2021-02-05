import {
    GraphData,
    projectInvertedYCoordToSVG as pyInv,
    projectXCoordToSVG as px,
    projectYCoordToSVG as py,
    steppedXAxisValues,
    steppedYAxisValues
} from "./setup";

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

export type VerticalAlignment = "top" | "bottom";
export type HorizontalAlignment = "left" | "right";

export function verticalLineFullHeight(
	graph: GraphData,
	xPosition: number
): LineCoordinate {
	return {
		x1: px(graph, xPosition),
		x2: px(graph, xPosition),
		y1: 0,
		y2: graph.yAxisSize,
	};
}

export function horizontalLineFullWidth(
	graph: GraphData,
	yPosition: number
): LineCoordinate {
	return {
		x1: 0,
		x2: graph.xAxisSize,
		y1: py(graph, yPosition),
		y2: py(graph, yPosition),
	};
}

export function invertedHorizontalLineFullWidth(
	graph: GraphData,
	yPosition: number
): LineCoordinate {
	return {
		x1: 0,
		x2: graph.xAxisSize,
		y1: pyInv(graph, yPosition),
		y2: pyInv(graph, yPosition),
	};
}

export function yAxis(graph: GraphData): LineCoordinate {
	const xPlacement = graph.xAxisMin > 0 ? graph.xAxisMin : 0;

	return verticalLineFullHeight(graph, xPlacement);
}

export function yAxisAnnotations(graph: GraphData): PointCoordinate[] {
	const xPlacement = graph.xAxisMin > 0 ? graph.xAxisMin : 0;

	return steppedYAxisValues(graph).map((v) => ({
		x: px(graph, xPlacement),
		y: py(graph, v),
	}));
}

export function invertedYAxisAnnotations(graph: GraphData): PointCoordinate[] {
	const xPlacement = graph.xAxisMin > 0 ? graph.xAxisMin : 0;

	return steppedYAxisValues(graph).map((v) => ({
		x: px(graph, xPlacement),
		y: pyInv(graph, v),
	}));
}

export function horizontalGridLines(graph: GraphData): LineCoordinate[] {
	return steppedYAxisValues(graph).map((v) =>
		horizontalLineFullWidth(graph, v)
	);
}

export function invertedHorizontalGridLines(
	graph: GraphData
): LineCoordinate[] {
	return steppedYAxisValues(graph).map((v) =>
		invertedHorizontalLineFullWidth(graph, v)
	);
}

export function yAxisSteps(graph: GraphData): LineCoordinate[] {
	return steppedYAxisValues(graph).map((v) => ({
		x1: px(graph, 0),
		x2: px(graph, 0) - 2,
		y1: py(graph, v),
		y2: py(graph, v),
	}));
}

export function invertedYAxisSteps(graph: GraphData): LineCoordinate[] {
	return steppedYAxisValues(graph).map((v) => ({
		x1: px(graph, 0),
		x2: px(graph, 0) - 2,
		y1: pyInv(graph, v),
		y2: pyInv(graph, v),
	}));
}

export function xAxis(graph: GraphData, position = "bottom"): LineCoordinate {
	return horizontalLineFullWidth(
		graph,
		position === "top" ? graph.yAxisMax : 0
	);
}

export function xAxisSteps(
	graph: GraphData,
	position: VerticalAlignment
): LineCoordinate[] {
	return steppedXAxisValues(graph).map((v) => ({
		x1: px(graph, v),
		x2: px(graph, v),
		y1: position === "top" ? py(graph, graph.yAxisMax) : py(graph, 0),
		y2: position === "top" ? py(graph, graph.yAxisMax) - 2 : py(graph, 0) + 2,
	}));
}

export function xAxisAnnotations(
	graph: GraphData,
	position = "bottom"
): PointCoordinate[] {
	return steppedXAxisValues(graph).map((v) => ({
		x: px(graph, v),
		y: py(graph, position === "top" ? graph.yAxisMax : 0),
	}));
}

export function verticalGridlines(graph: GraphData): LineCoordinate[] {
	return steppedXAxisValues(graph).map((v) => verticalLineFullHeight(graph, v));
}

export function dotPoints(graph: GraphData): PointCoordinate[] {
	return graph.yAxisValues.map((v, i) => ({
		x: px(graph, graph.xAxisValues[i]),
		y: py(graph, v),
	}));
}

export function linePoints(graph: GraphData): string {
	return graph.yAxisValues
		.map((v, i) => `${px(graph, graph.xAxisValues[i])},${py(graph, v)}`)
		.join(" ");
}

export function horizontalLineBarPoints(graph: GraphData): LineCoordinate[] {
	return graph.xAxisValues.map((v, i) => ({
		x1: px(graph, 0),
		x2: px(graph, v),
		y1: py(graph, graph.yAxisValues[i]),
		y2: py(graph, graph.yAxisValues[i]),
	}));
}

export function invertedHorizontalLineBarPoints(
	graph: GraphData
): LineCoordinate[] {
	return graph.xAxisValues.map((v, i) => ({
		x1: px(graph, 0),
		x2: px(graph, v),
		y1: pyInv(graph, graph.yAxisValues[i]),
		y2: pyInv(graph, graph.yAxisValues[i]),
	}));
}

export function verticalLineBarPoints(graph: GraphData): LineCoordinate[] {
	return graph.yAxisValues.map((v, i) => ({
		x1: px(graph, graph.xAxisValues[i]),
		x2: px(graph, graph.xAxisValues[i]),
		y1: py(graph, 0),
		y2: py(graph, v),
	}));
}
