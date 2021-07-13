import { horizontalGridLines, verticalGridlines } from "@thingco/graphviz";
import React from "react";
import { G, Line } from "react-native-svg";

import { useGraph } from "./Context";

export interface GridLinesProps {
	stroke?: string;
	vectorEffect?: "none" | "non-scaling-stroke" | "nonScalingStroke" | "default" | "inherit" | "uri";
	opacity?: number | string;
}

export const XAxisGridLines = ({
	stroke = "grey",
	vectorEffect = "non-scaling-stroke",
	opacity = 0.5,
}: GridLinesProps): JSX.Element => {
	const graph = useGraph();

	return (
		<G data-componentid="x-axis-gridlines">
			{verticalGridlines(graph).map(({ x1, x2, y1, y2 }, i) => (
				<Line
					key={`${x1}${x2}${y1}${y2}${i}`}
					x1={x1}
					x2={x2}
					y1={y1}
					y2={y2}
					data-componentid={`x-axis-gridline-${x1}${x2}${y1}${y2}${i}`}
					stroke={stroke}
					vectorEffect={vectorEffect}
					opacity={opacity}
				/>
			))}
		</G>
	);
};

export const YAxisGridLines = ({
	stroke = "grey",
	vectorEffect = "non-scaling-stroke",
	opacity = 0.5,
}: GridLinesProps): JSX.Element => {
	const graph = useGraph();

	return (
		<G data-componentid="y-axis-gridlines">
			{horizontalGridLines(graph).map(({ x1, x2, y1, y2 }, i) => (
				<Line
					key={`${x1}${x2}${y1}${y2}${i}`}
					x1={x1}
					x2={x2}
					y1={y1}
					y2={y2}
					data-componentid={`y-axis-gridline-${x1}${x2}${y1}${y2}${i}`}
					stroke={stroke}
					vectorEffect={vectorEffect}
					opacity={opacity}
				/>
			))}
		</G>
	);
};
