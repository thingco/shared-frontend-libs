import React from "react";
import { LayoutChangeEvent, View, ViewProps } from "react-native";
import { Svg } from "react-native-svg";

import { useGraph } from "./Context";
import { ScrubberControl } from "./Scrubber";

export type GraphPadding = number | { top: number; right: number; bottom: number; left: number };

export interface CanvasWithScrubberProps {
	children: React.ReactNode;
	width?: number | undefined;
	setCurrentDataPointIndex: (index: number) => void;
	currentDataPointIndex: number;
	height: number | string;
	padding?: GraphPadding;
	preserveAspectRatio?: string;
	scrubberControlStyle?: ViewProps;
	scrubberStep?: number;
}

export const CanvasWithScrubber = ({
	children,
	setCurrentDataPointIndex,
	currentDataPointIndex,
	padding = 10,
	height = "100%",
	width,
	scrubberControlStyle = {},
	scrubberStep = 1,
}: CanvasWithScrubberProps): JSX.Element => {
	const { xAxisSize, xAxisScale, yAxisSize } = useGraph();
	const [tPad, rPad, bPad, lPad] =
		typeof padding === "number"
			? [padding, padding, padding, padding]
			: [padding.top, padding.right, padding.bottom, padding.left];

	const [canvasWidth, setCanvasWidth] = React.useState<number | undefined>(width);
	const [graphWidth, setGraphWidth] = React.useState(xAxisSize + lPad + rPad);
	const [slideAmount, setSlideAmount] = React.useState(0);

	const onLayoutHandler = (e: LayoutChangeEvent) => {
		if (canvasWidth) return;
		setCanvasWidth(e.nativeEvent.layout.width);
	};

	React.useLayoutEffect(() => {
		setGraphWidth(xAxisSize + lPad + rPad);

		// Only run calculations if we have a width available
		if (canvasWidth) {
			// Only run sliding behaviour if the graph is wider than the viewport:
			if (graphWidth > canvasWidth) {
				const centrePoint = Math.floor(canvasWidth / 2);
				const scrubPos = currentDataPointIndex * xAxisScale;

				if (scrubPos + lPad < centrePoint) {
					setSlideAmount(0);
				} else if (scrubPos > xAxisSize - centrePoint) {
					// do nothing
				} else {
					setSlideAmount(centrePoint - (scrubPos + rPad));
				}
			} else {
				setGraphWidth(canvasWidth);
			}
		}
	}, [canvasWidth, xAxisSize, xAxisScale, currentDataPointIndex]);

	const viewBoxMinX = 0 - lPad;
	const viewBoxMinY = 0 - tPad;
	const viewBoxWidth = xAxisSize + lPad + rPad;
	const viewBoxHeight = yAxisSize + tPad + bPad;

	return (
		<View onLayout={onLayoutHandler} data-componentid="scrubber-viewport">
			{canvasWidth && (
				<>
					<ScrubberControl
						currentDataPointIndex={currentDataPointIndex}
						setCurrentDataPointIndex={setCurrentDataPointIndex}
						scrubberControlStyle={scrubberControlStyle}
						scrubberStep={scrubberStep}
					/>
					<Svg
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						//@ts-ignore
						transform={[{ translateX: slideAmount }]}
						height={height}
						width={graphWidth}
						viewBox={`${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`}
						preserveAspectRatio="none"
						data-componentid="svg-canvas-scrubbable"
					>
						{children}
					</Svg>
				</>
			)}
		</View>
	);
};
