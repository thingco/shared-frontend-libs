import Slider from "@react-native-community/slider";
import { HorizontalAlignment, px, verticalLineFullHeight } from "@thingco/graphviz";
import React from "react";
import { ForeignObject, G, Line } from "react-native-svg";

import { useGraph } from "./Context";

export interface ScrubberControlProps {
	currentDataPointIndex: number;
	setCurrentDataPointIndex: (n: number) => void;
	scrubberControlStyle?: VisibleScrubberControlStyle;
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
	scrubberControlStyle = {},
	currentDataPointIndex,
	setCurrentDataPointIndex,
	startPosition = "zero",
}: ScrubberControlProps & {
	startPosition: HorizontalAlignment;
}): JSX.Element => {
	scrubberControlStyle = { ...defaultVisibleScrubberControlStyle, ...scrubberControlStyle };

	const graph = useGraph();

	let thumbPos: number;
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
				<Line x1={x1} x2={x2} y1={y1} y2={y2} {...scrubberControlStyle} />
			</G>
			<ForeignObject
				x={0}
				y={0}
				width={graph.xAxisSize}
				height={graph.yAxisSize}
				data-componentid="scrubbercontrol"
			>
				<Slider
					onValueChange={setCurrentDataPointIndex}
					minimumValue={0}
					maximumValue={graph.xAxisValues.length - 1}
					step={1}
					style={{
						backgroundColor: "transparent",
						opacity: 0,
						width: "100%",
						height: "100%",
					}}
					value={currentDataPointIndex}
				/>
			</ForeignObject>
		</React.Fragment>
	);
};
