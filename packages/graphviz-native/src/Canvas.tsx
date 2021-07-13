import React from "react";
import { Svg } from "react-native-svg";

import { useGraph } from "./Context";

export type GraphPadding = number | { top: number; right: number; bottom: number; left: number };

export interface CanvasProps {
	children: React.ReactNode;
	padding?: GraphPadding;
	preserveAspectRatio?: string;
}

export const Canvas = ({
	children,
	padding = 10,
	preserveAspectRatio = "xMidYMid",
}: CanvasProps): JSX.Element => {
	const graph = useGraph();

	const viewBoxMinX = 0 - (typeof padding === "number" ? padding : padding.left);
	const viewBoxMinY = 0 - (typeof padding === "number" ? padding : padding.top);
	const viewBoxWidth =
		graph.xAxisSize + (typeof padding === "number" ? padding * 2 : padding.right + padding.left);
	const viewBoxHeight =
		graph.yAxisSize + (typeof padding === "number" ? padding * 2 : padding.top + padding.bottom);

	return (
		<Svg
			viewBox={`${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`}
			preserveAspectRatio={preserveAspectRatio}
		>
			{children}
		</Svg>
	);
};
