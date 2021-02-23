import { dotPoints, horizontalLineBarPoints, linePoints, px, py, verticalLineBarPoints } from "@thingco/graphviz";
import React from "react";

import { useGraph } from "./Context";

export interface DataProps {
	style?: React.CSSProperties;
	coordinateOverride?: number[];
}

const defaultDataLineStyle: React.CSSProperties = {
	fill: "none",
	stroke: "black",
	strokeLinecap: "round",
	strokeWidth: 1,
};

export const DataLine = ({ style = {} }: DataProps): JSX.Element => {
	style = { ...defaultDataLineStyle, ...style };
	const graph = useGraph();

	return <polyline style={style} points={linePoints(graph)} />;
};

export const VerticalLineBars = ({ style = {} }: DataProps): JSX.Element => {
	style = { ...defaultDataLineStyle, ...style };
	const graph = useGraph();
	const lines = verticalLineBarPoints(graph).map(({ x1, x2, y1, y2 }, i) => (
		<line key={`${x1}${x2}${y1}${y2}${i}`} x1={x1} x2={x2} y1={y1} y2={y2} />
	));

	return <g style={style}>{lines}</g>;
};

export const HorizontalLineBars = ({ style = {} }: DataProps): JSX.Element => {
	style = { ...defaultDataLineStyle, ...style };
	const graph = useGraph();
	const lines = horizontalLineBarPoints(graph).map(({ x1, x2, y1, y2 }, i) => (
		<line key={`${x1}${x2}${y1}${y2}${i}`} x1={x1} x2={x2} y1={y1} y2={y2} />
	));

	return <g style={style}>{lines}</g>;
};

const defaultDataDotsStyle: React.CSSProperties = {
	fill: "black",
	stroke: "white",
	strokeWidth: 1,
};

export const DataDots = ({
	style = {},
	r = 2,
}: DataProps & { r?: number }): JSX.Element => {
	style = { ...defaultDataDotsStyle, ...style };
	const graph = useGraph();
	const dots = dotPoints(graph).map(({ x, y }, i) => (
		<circle key={`${x}${y}${i}`} cx={x} cy={y} r={r} />
	));
	return <g style={style}>{dots}</g>;
};

const defaultAreaStyle: React.CSSProperties = {
	stroke: "none",
	fill: "grey",
	opacity: 0.2,
};

export const AreaFillXAxis = ({
	style = {},
	coordinateOverride,
}: DataProps): JSX.Element => {
	style = { ...defaultAreaStyle, ...style };
	let graph = useGraph();
	// If using as an overlay, there will be a new set of y-axis coordinates to plot:
	if (coordinateOverride) {
		graph = { ...graph, yAxisValues: coordinateOverride };
	}

	const points = `${px(graph, 0)},${py(graph, 0)} ${linePoints(graph)} ${px(
		graph,
		graph.xAxisMax
	)},${py(graph, 0)}`;

	return <polygon style={style} points={points} />;
};

export const AreaFillYAxis = ({
	style = {},
	coordinateOverride,
}: DataProps): JSX.Element => {
	style = { ...defaultAreaStyle, ...style };
	let graph = useGraph();
	// If using as an overlay, there will be a new set of y-axis coordinates to plot:
	if (coordinateOverride) {
		graph = { ...graph, xAxisValues: coordinateOverride };
	}

	const points = `${px(graph, 0)},${py(graph, 0)} ${linePoints(graph)} ${px(
		graph,
		0
	)},${py(graph, graph.yAxisMax)}`;

	return <polygon style={style} points={points} />;
};
