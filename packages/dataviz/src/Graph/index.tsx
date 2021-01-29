import React from "react";

import { XAxisAnnotations, YAxisAnnotations } from "./Annotations";
import { XAxis, YAxis } from "./Axes";
import { GraphContext } from "./Context";
import { DataDots, DataHorizontalLineBar, DataLine } from "./Data";
import { XAxisGridLines, YAxisGridLines } from "./GridLines";
import { createGraph, GraphConstructor } from "./setup";

export type GraphPadding =
	| number
	| { top: number; right: number; bottom: number; left: number };

export type GraphProps = GraphConstructor & {
	children: React.ReactNode;
	padding?: GraphPadding;
	style?: React.CSSProperties;
};

export const Graph = ({
	xAxisSize,
	xAxisMax,
	xAxisMin,
	xAxisStep,
	xAxisValues,
	yAxisSize,
	yAxisMax,
	yAxisMin,
	yAxisStep,
	yAxisValues,
	children,
	padding = 10,
	style,
}: GraphProps): JSX.Element => {
	const graph = createGraph({
		xAxisSize,
		xAxisMax,
		xAxisMin,
		xAxisStep,
		xAxisValues,
		yAxisSize,
		yAxisMax,
		yAxisMin,
		yAxisStep,
		yAxisValues,
	});

	const viewBoxMinX =
		0 - (typeof padding === "number" ? padding : padding.left);
	const viewBoxMinY = 0 - (typeof padding === "number" ? padding : padding.top);
	const viewBoxWidth =
		graph.xAxisSize +
		(typeof padding === "number" ? padding * 2 : padding.right + padding.left);
	const viewBoxHeight =
		graph.yAxisSize +
		(typeof padding === "number" ? padding * 2 : padding.top + padding.bottom);

	return (
		<GraphContext.Provider value={graph}>
			<svg
				style={style}
				viewBox={`${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`}
				width="100%"
				height="100%"
			>
				{children}
			</svg>
		</GraphContext.Provider>
	);
};

Graph.XAxisAnnotations = XAxisAnnotations;
Graph.YAxisAnnotations = YAxisAnnotations;
Graph.DataLine = DataLine;
Graph.DataDots = DataDots;
Graph.DataHorizontalLineBar = DataHorizontalLineBar;
Graph.XAxis = XAxis;
Graph.XAxisGridLines = XAxisGridLines;
Graph.YAxis = YAxis;
Graph.YAxisGridLines = YAxisGridLines;
