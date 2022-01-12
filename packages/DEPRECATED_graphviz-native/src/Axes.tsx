import { VerticalAlignment, xAxis, xAxisSteps, yAxis, yAxisSteps } from "@thingco/graphviz";
import React from "react";
import { G, Line, Linecap } from "react-native-svg";

import { useGraph } from "./Context";

export interface AxisProps {
	style?: AxisStyle;
	showSteps?: boolean;
}

interface AxisStyle {
	fill?: string;
	stroke?: string;
	strokeLinecap?: Linecap;
	strokeWidth?: number;
}

const defaultAxisStyle: AxisStyle = {
	fill: "none",
	stroke: "black",
	strokeLinecap: "round",
	strokeWidth: 1,
};

export const XAxis = ({
	style = {},
	showSteps = true,
	position = "bottom",
}: AxisProps & { position?: VerticalAlignment }): JSX.Element => {
	const graph = useGraph();
	const { x1, x2, y1, y2 } = xAxis(graph, position);
	const axisSteps = showSteps ? xAxisSteps(graph, position) : null;
	style = { ...defaultAxisStyle, ...style };

	return (
		<G data-componentid="x-axis">
			<Line x1={x1} x2={x2} y1={y1} y2={y2} {...style} />
			{axisSteps?.map(({ x1, x2, y1, y2 }, i) => (
				<Line key={`${x1}${x2}${y1}${y2}${i}`} x1={x1} x2={x2} y1={y1} y2={y2} {...style} />
			))}
		</G>
	);
};

export const YAxis = ({ style = {}, showSteps = true }: AxisProps): JSX.Element => {
	const graph = useGraph();
	const { x1, x2, y1, y2 } = yAxis(graph);
	const axisSteps = showSteps ? yAxisSteps(graph) : null;
	style = { ...defaultAxisStyle, ...style };

	return (
		<G data-componentid="y-axis">
			<Line x1={x1} x2={x2} y1={y1} y2={y2} {...style} />
			{axisSteps?.map(({ x1, x2, y1, y2 }, i) => (
				<Line key={`${x1}${x2}${y1}${y2}${i}`} x1={x1} x2={x2} y1={y1} y2={y2} {...style} />
			))}
		</G>
	);
};
