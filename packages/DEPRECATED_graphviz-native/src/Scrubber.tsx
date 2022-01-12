import Slider from "@react-native-community/slider";
import { HorizontalAlignment, px, verticalLineFullHeight } from "@thingco/graphviz";
import React from "react";
import { ViewStyle } from "react-native";
import { G, Line } from "react-native-svg";

import { useGraph } from "./Context";

export interface ScrubberLineProps {
	currentDataPointIndex: number;
	scrubberLineStyle?: VisibleScrubberControlStyle;
}
interface VisibleScrubberControlStyle {
	fill?: string;
	stroke?: string;
	strokeWidth?: number;
}

const defaultVisibleScrubberControlStyle = {
	fill: "none",
	stroke: "black",
	strokeWidth: 2,
};

export const ScrubberHorizontal = ({
	scrubberLineStyle = {},
	currentDataPointIndex,
	startPosition = "zero",
}: ScrubberLineProps & {
	startPosition: HorizontalAlignment;
}): JSX.Element => {
	scrubberLineStyle = { ...defaultVisibleScrubberControlStyle, ...scrubberLineStyle };

	const graph = useGraph();

	let thumbPos = 0;
	switch (startPosition) {
		case "left":
			thumbPos = graph.xAxisMin;
			break;
		case "zero":
			thumbPos = 0;
			break;
		case "right":
			thumbPos = graph.xAxisMax;
			break;
	}

	const { x1, x2, y1, y2 } = verticalLineFullHeight(graph, thumbPos);

	return (
		<React.Fragment>
			<G transform={`translate(${px(graph, graph.xAxisValues[currentDataPointIndex])})`}>
				<Line x1={x1} x2={x2} y1={y1} y2={y2} {...scrubberLineStyle} />
			</G>
		</React.Fragment>
	);
};

export interface ScrubberControlProps {
	currentDataPointIndex: number;
	setCurrentDataPointIndex: (n: number) => void;
	scrubberControlStyle?: ViewStyle;
	scrubberStep: number;
}

const defaultScrubberControlStyle: ViewStyle = {
	zIndex: 10,
	position: "absolute",
	backgroundColor: "transparent",
	opacity: 0,
	width: "100%",
	height: "100%",
};

export const ScrubberControl = ({
	currentDataPointIndex,
	setCurrentDataPointIndex,
	scrubberControlStyle = {},
	scrubberStep,
}: ScrubberControlProps) => {
	const graph = useGraph();
	return (
		<Slider
			onValueChange={setCurrentDataPointIndex}
			minimumValue={0}
			maximumValue={graph.xAxisValues.length - 1}
			step={scrubberStep}
			style={{ ...defaultScrubberControlStyle, ...scrubberControlStyle }}
			value={currentDataPointIndex}
		/>
	);
};
