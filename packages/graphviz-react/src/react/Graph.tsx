import { createGraph, GraphConstructor } from "@thingco/graphviz";
import React from "react";

import { XAxisAnnotations, YAxisAnnotations } from "./Annotations";
import { XAxis, YAxis } from "./Axes";
import { Canvas } from "./Canvas";
import { GraphContext } from "./Context";
import { AreaFillXAxis, AreaFillYAxis, DataDots, DataLine, HorizontalLineBars, VerticalLineBars } from "./Data";
import { XAxisGridLines, YAxisGridLines } from "./GridLines";
import { ScrubberHorizontal, ScrubberVertical } from "./Scrubber";

export type GraphProps = GraphConstructor & {
	children: React.ReactNode;
};

export const Graph = ({
	children,
	xAxisSize,
	xAxisScale,
	xAxisMax,
	xAxisMin,
	xAxisStep,
	xAxisValues,
	yAxisSize,
	yAxisScale,
	yAxisMax,
	yAxisMin,
	yAxisStep,
	yAxisValues,
}: GraphProps): JSX.Element => {
	const graph = createGraph({
		xAxisSize,
		xAxisScale,
		xAxisMax,
		xAxisMin,
		xAxisStep,
		xAxisValues,
		yAxisSize,
		yAxisScale,
		yAxisMax,
		yAxisMin,
		yAxisStep,
		yAxisValues,
	});

	return (
		<GraphContext.Provider value={graph}>{children}</GraphContext.Provider>
	);
};

Graph.Canvas = Canvas;
Graph.XAxisAnnotations = XAxisAnnotations;
Graph.YAxisAnnotations = YAxisAnnotations;
Graph.DataLine = DataLine;
Graph.DataDots = DataDots;
Graph.VerticalLineBars = VerticalLineBars;
Graph.HorizontalLineBars = HorizontalLineBars;
Graph.AreaFillXAxis = AreaFillXAxis;
Graph.AreaFillYAxis = AreaFillYAxis;
Graph.XAxis = XAxis;
Graph.XAxisGridLines = XAxisGridLines;
Graph.YAxis = YAxis;
Graph.YAxisGridLines = YAxisGridLines;
Graph.ScrubberHorizontal = ScrubberHorizontal;
Graph.ScrubberVertical = ScrubberVertical;

export { useGraph } from "./Context";
