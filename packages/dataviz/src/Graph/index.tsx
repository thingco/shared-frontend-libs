import React from "react";

import { XAxisAnnotations, YAxisAnnotations } from "./Annotations";
import { XAxis, YAxis } from "./Axes";
import { Canvas } from "./Canvas";
import { GraphContext } from "./Context";
import {
    AreaFillXAxis,
    AreaFillYAxis,
    DataDots,
    DataLine,
    HorizontalLineBars,
    InvertedHorizontalLineBars,
    VerticalLineBars
} from "./Data";
import { XAxisGridLines, YAxisGridLines } from "./GridLines";
import { ScrubberLeftToRight, ScrubberTopToBottom } from "./Scrubber";
import { createGraph, GraphConstructor } from "./setup";

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
Graph.InvertedHorizontalLineBars = InvertedHorizontalLineBars;
Graph.AreaFillXAxis = AreaFillXAxis;
Graph.AreaFillYAxis = AreaFillYAxis;
Graph.XAxis = XAxis;
Graph.XAxisGridLines = XAxisGridLines;
Graph.YAxis = YAxis;
Graph.YAxisGridLines = YAxisGridLines;
Graph.ScrubberLeftToRight = ScrubberLeftToRight;
Graph.ScrubberTopToBottom = ScrubberTopToBottom;
