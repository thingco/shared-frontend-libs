import React from "react";

import { useGraph } from "./Context";
import { GraphData, projectXCoordToSVG as px, projectYCoordToSVG as py } from "./setup";

export interface DataLineProps {
	style?: React.CSSProperties;
}

const defaultDataLineStyle: React.CSSProperties = {
	fill: "none",
	stroke: "black",
	strokeLinecap: "round",
	strokeWidth: 1,
};

export function projectedDataLinePoints(graph: GraphData): string {
	return graph.yAxisValues
		.map((v, i) => `${px(graph, graph.xAxisValues[i])},${py(graph, v)}`)
		.join(" ");
}

export const DataLine = ({ style = {} }: DataLineProps): JSX.Element => {
	style = { ...defaultDataLineStyle, ...style };
	const graph = useGraph();

	return <polyline style={style} points={projectedDataLinePoints(graph)} />;
};

export function projectedHorizontalLineBarPoints(
	graph: GraphData
): { x1: number; x2: number; y1: number; y2: number }[] {
	return graph.yAxisValues.map((v, i) => ({
		x1: px(graph, graph.xAxisValues[i]),
		x2: px(graph, graph.xAxisValues[i]),
		y1: py(graph, 0),
		y2: py(graph, v),
	}));
}

export const DataHorizontalLineBar = ({
	style = {},
}: DataLineProps): JSX.Element => {
	style = { ...defaultDataLineStyle, ...style };
	const graph = useGraph();
	const lines = projectedHorizontalLineBarPoints(
		graph
	).map(({ x1, x2, y1, y2 }, i) => (
		<line key={`${x1}${x2}${y1}${y2}${i}`} x1={x1} x2={x2} y1={y1} y2={y2} />
	));

	return <g style={style}>{lines}</g>;
};

export interface DataDotsProps {
	style?: React.CSSProperties;
	r?: number;
}

const defaultDataDotsStyle: React.CSSProperties = {
	fill: "black",
	stroke: "white",
	strokeWidth: 1,
};

export function projectedDotsPoints(
	graph: GraphData
): { x: number; y: number }[] {
	return graph.yAxisValues.map((v, i) => ({
		x: px(graph, graph.xAxisValues[i]),
		y: py(graph, v),
	}));
}

export const DataDots = ({ style = {}, r = 2 }: DataDotsProps): JSX.Element => {
	style = { ...defaultDataDotsStyle, ...style };
	const graph = useGraph();
	const dots = projectedDotsPoints(graph).map(({ x, y }, i) => (
		<circle key={`${x}${y}${i}`} cx={x} cy={y} r={r} />
	));
	return <g style={style}>{dots}</g>;
};
