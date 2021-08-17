import {
	steppedXAxisValues,
	steppedYAxisValues,
	VerticalAlignment,
	xAxisAnnotations,
	yAxisAnnotations,
} from "@thingco/graphviz";
import React from "react";
import { G, Text } from "react-native-svg";

import { useGraph } from "./Context";

export interface AxisAnnotationsProps {
	style?: React.CSSProperties;
	offsetY?: number;
	offsetX?: number;
	annotations: (string | number)[];
	annotationStyle?: AxisAnnotationTextStyle;
	roundTo?: number;
}

export interface AxisAnnotationTextStyle {
	fontSize?: number;
	fontFamily?: string;
	fontWeight?: string;
	textAnchor?: string;
}

const defaultAnnotationStyle: AxisAnnotationTextStyle = {
	fontSize: 3,
	fontFamily: "sans-serif",
	fontWeight: "bold",
	textAnchor: "middle",
};

export const XAxisAnnotations = ({
	annotationStyle = {},
	annotations,
	offsetY = 4,
	position = "bottom",
	roundTo = 2,
}: AxisAnnotationsProps & { position?: VerticalAlignment }): JSX.Element => {
	annotationStyle = { ...defaultAnnotationStyle, ...annotationStyle };
	const graph = useGraph();

	annotations = annotations ?? steppedXAxisValues(graph);

	return (
		<G data-componentid="x-axis-annotations" {...annotationStyle}>
			{xAxisAnnotations(graph, position).map(({ x, y }, i) => (
				<Text
					key={`${x}${y}${i}`}
					x={x}
					y={y - offsetY}
					data-componentid={`x-axis-annotation-${x}${y}${i}`}
				>
					{annotations && Number(annotations[i]).toFixed(roundTo)}
				</Text>
			))}
		</G>
	);
};

export const YAxisAnnotations = ({
	offsetX = 2,
	offsetY = 0,
	annotations,
	annotationStyle = {},
	roundTo = 2,
}: AxisAnnotationsProps): JSX.Element => {
	annotationStyle = { ...defaultAnnotationStyle, ...annotationStyle };
	const graph = useGraph();

	annotations = annotations ?? steppedYAxisValues(graph);

	return (
		<G data-componentid="y-axis-annotations" {...annotationStyle}>
			{yAxisAnnotations(graph).map(({ x, y }, i) => (
				<Text
					key={`${x}${y}${i}`}
					x={x + offsetX}
					y={y}
					dy={offsetY}
					textAnchor="end"
					data-componentid={`y-axis-annotation-${x}${y}${i}`}
				>
					{annotations && Number(annotations[i]).toFixed(roundTo)}
				</Text>
			))}
		</G>
	);
};
