import {
  HorizontalAlignment,
  horizontalLineFullWidth,
  px,
  py,
  VerticalAlignment,
  verticalLineFullHeight
} from "@thingco/graphviz";
import React from "react";

import { useGraph } from "./Context";

export interface ScrubberControlProps {
	currentDataPointIndex: number;
	setCurrentDataPointIndex: (n: number) => void;
	thumbStyle?: React.CSSProperties;
}

const underlyingRangeInputStyle: React.CSSProperties = {
	appearance: "none",
	background: "transparent",
	opacity: 0,
	display: "block",
	width: "100%",
	height: "100%",
};

const underlyingVerticalRangeInputStyle: React.CSSProperties = {
	...underlyingRangeInputStyle,
	WebkitAppearance: "slider-vertical",
	// transform: "rotate(180deg)",
};

const defaultRangeStyle: React.CSSProperties = {
	fill: "none",
	stroke: "black",
	strokeWidth: 2,
};

export const ScrubberHorizontal = ({
	thumbStyle = {},
	currentDataPointIndex,
	setCurrentDataPointIndex,
	startPosition = "zero",
}: ScrubberControlProps & {
	startPosition: HorizontalAlignment;
}): JSX.Element => {
	thumbStyle = { ...defaultRangeStyle, ...thumbStyle };

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
			<g
				transform={`translate(${px(
					graph,
					graph.xAxisValues[currentDataPointIndex]
				)})`}
			>
				<line style={thumbStyle} x1={x1} x2={x2} y1={y1} y2={y2} />
			</g>
			<foreignObject
				x={0}
				y={0}
				width={graph.xAxisSize}
				height={graph.yAxisSize}
				data-componentid="scrubbercontrol"
			>
				<input
					onChange={(e) => setCurrentDataPointIndex(+e.target.value)}
					type="range"
					min={0}
					max={graph.xAxisValues.length - 1}
					step={1}
					style={underlyingRangeInputStyle}
					value={currentDataPointIndex}
				/>
			</foreignObject>
		</React.Fragment>
	);
};

export const ScrubberVertical = ({
	thumbStyle = {},
	currentDataPointIndex,
	setCurrentDataPointIndex,
	startPosition = "zero",
}: ScrubberControlProps & {
	startPosition: VerticalAlignment;
}): JSX.Element => {
	thumbStyle = { ...defaultRangeStyle, ...thumbStyle };
	const graph = useGraph();

	let thumbPos: number;
	switch (startPosition) {
		case "top":
			thumbPos = graph.yAxisMax;
			break;
		case "zero":
			thumbPos = 0;
			break;
		case "bottom":
			thumbPos = graph.xAxisMin;
			break;
	}

	const { x1, x2, y1, y2 } = horizontalLineFullWidth(graph, thumbPos);

	/** NOTE TS typings for input elements do not include the `orient` property */
	const inputRef = React.useRef<HTMLInputElement>(null);

	React.useEffect(() => {
		if (inputRef != null && inputRef.current != null) {
			inputRef.current.setAttribute("orient", "vertical");
		}
	}, []);

	return (
		<React.Fragment>
			<g
				transform={`translate(0 ${py(
					graph,
					graph.yAxisValues[currentDataPointIndex]
				)})`}
			>
				<line style={thumbStyle} x1={x1} x2={x2} y1={y1} y2={y2} />
			</g>
			<foreignObject
				x={0}
				y={0}
				width={graph.xAxisSize}
				height={graph.yAxisSize}
				data-componentid="scrubbercontrol"
			>
				<input
					ref={inputRef}
					onChange={(e) => setCurrentDataPointIndex(+e.target.value)}
					type="range"
					min={0}
					max={graph.yAxisValues.length - 1}
					step={1}
					style={underlyingVerticalRangeInputStyle}
					value={currentDataPointIndex}
				/>
			</foreignObject>
		</React.Fragment>
	);
};
