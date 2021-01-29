import React from "react";

import { useGraph } from "./Context";
import { xAxisAnnotations, yAxisAnnotations } from "./projections";
import { steppedXAxisValues, steppedYAxisValues } from "./setup";

export interface AxisAnnotationsProps {
	style?: React.CSSProperties;
	offsetY?: number;
	offsetX?: number;
	annotations?: (string | number)[];
}

const defaultAnnotationStyle: React.CSSProperties = {
	fontSize: 3,
	fontFamily: "sans-serif",
	fontWeight: "bold",
	textAnchor: "middle",
};

export const XAxisAnnotations = ({
	style = {},
	annotations,
	offsetY = 4,
}: AxisAnnotationsProps): JSX.Element => {
	style = { ...defaultAnnotationStyle, ...style };
	const graph = useGraph();

	annotations = annotations ?? steppedXAxisValues(graph);

	return (
		<g style={style} data-componentid="x-axis-annotations">
			{xAxisAnnotations(graph).map(({ x, y }, i) => (
				<text
					key={`${x}${y}${i}`}
					x={x}
					y={y - offsetY}
					data-componentid={`x-axis-annotation-${x}${y}${i}`}
				>
					{annotations && annotations[i]}
				</text>
			))}
		</g>
	);
};

export const YAxisAnnotations = ({
	style = {},
	offsetX = 2,
	offsetY = 0,
	annotations,
}: AxisAnnotationsProps): JSX.Element => {
	style = { ...defaultAnnotationStyle, ...style };
	const graph = useGraph();

	annotations = annotations ?? steppedYAxisValues(graph);

	return (
		<g data-componentid="y-axis-annotations">
			{yAxisAnnotations(graph).map(({ x, y }, i) => (
				<text
					key={`${x}${y}${i}`}
					x={x + offsetX}
					y={y}
					dy={offsetY}
					style={{ ...style, textAnchor: "end" }}
					data-componentid={`y-axis-annotation-${x}${y}${i}`}
				>
					{annotations && annotations[i]}
				</text>
			))}
		</g>
	);
};
