import {
  GraphData,
  projectXCoordToSVG as px,
  projectYCoordToSVG as py,
  steppedXAxisValues,
  steppedYAxisValues
} from "./setup";

export function dataPoints(graph: GraphData): { x: number; y: number }[] {
	return graph.yAxisValues.map((v, i) => ({
		x: px(graph, graph.xAxisValues[i]),
		y: py(graph, v),
	}));
}

export function dataLineBars(
	graph: GraphData
): { x1: number; x2: number; y1: number; y2: number }[] {
	return graph.yAxisValues.map((v, i) => ({
		x1: px(graph, graph.xAxisValues[i]),
		x2: px(graph, graph.xAxisValues[i]),
		y1: py(graph, 0),
		y2: py(graph, v),
	}));
}

export function yAxis(
	graph: GraphData
): { x1: number; x2: number; y1: number; y2: number } {
	const xPlacement = graph.xAxisMin > 0 ? graph.xAxisMin : 0;

	return {
		x1: px(graph, xPlacement),
		x2: px(graph, xPlacement),
		y1: 0,
		y2: graph.yAxisSize,
	};
}

export function yAxisAnnotations(graph: GraphData): { x: number; y: number }[] {
	const xPlacement = graph.xAxisMin > 0 ? graph.xAxisMin : 0;

	return steppedYAxisValues(graph).map((v) => ({
		x: px(graph, xPlacement),
		y: py(graph, v),
	}));
}

export function yAxisGridLines(
	graph: GraphData
): { x1: number; x2: number; y1: number; y2: number }[] {
	return steppedYAxisValues(graph).map((v) => ({
		x1: 0,
		x2: graph.xAxisSize,
		y1: py(graph, v),
		y2: py(graph, v),
	}));
}

export function yAxisSteps(
	graph: GraphData
): { x1: number; x2: number; y1: number; y2: number }[] {
	return steppedYAxisValues(graph).map((v) => ({
		x1: px(graph, 0),
		x2: px(graph, 0) - 2,
		y1: py(graph, v),
		y2: py(graph, v),
	}));
}

export function xAxis(
	graph: GraphData
): { x1: number; x2: number; y1: number; y2: number } {
	return { x1: 0, x2: graph.xAxisSize, y1: py(graph, 0), y2: py(graph, 0) };
}

export function xAxisAnnotations(graph: GraphData): { x: number; y: number }[] {
	return steppedXAxisValues(graph).map((v) => ({
		x: px(graph, v),
		y: py(graph, 0),
	}));
}

export function xAxisGridlines(
	graph: GraphData
): { x1: number; x2: number; y1: number; y2: number }[] {
	return steppedXAxisValues(graph).map((v) => ({
		x1: px(graph, v),
		x2: px(graph, v),
		y1: 0,
		y2: graph.yAxisSize,
	}));
}

export function xAxisSteps(
	graph: GraphData
): { x1: number; x2: number; y1: number; y2: number }[] {
	return steppedXAxisValues(graph).map((v) => ({
		x1: px(graph, v),
		x2: px(graph, v),
		y1: py(graph, 0),
		y2: py(graph, 0) + 2,
	}));
}
