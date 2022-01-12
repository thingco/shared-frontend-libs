import React from "react";

import { useGraph } from "./Context";

export type GraphPadding = number | { top: number; right: number; bottom: number; left: number };

export interface CanvasWithScrubberProps {
	children: React.ReactNode;

	currentDataPointIndex: number;
	height: number | string;
	padding?: GraphPadding;
	preserveAspectRatio?: string;
	style?: React.CSSProperties;
}

export const CanvasWithScrubber = ({
	children,
	currentDataPointIndex,
	padding = 10,
	height = "100%",
}: CanvasWithScrubberProps): JSX.Element => {
	const { xAxisSize, xAxisScale, yAxisSize } = useGraph();
	const [tPad, rPad, bPad, lPad] =
		typeof padding === "number"
			? [padding, padding, padding, padding]
			: [padding.top, padding.right, padding.bottom, padding.left];

	const scrubViewportRef = React.useRef<HTMLDivElement>(null);
	const [graphWidth, setGraphWidth] = React.useState(xAxisSize + lPad + rPad);
	const [slideAmount, setSlideAmount] = React.useState(0);

	React.useLayoutEffect(() => {
		const scrubViewportWidth = (scrubViewportRef.current as HTMLDivElement).clientWidth;
		setGraphWidth(xAxisSize + lPad + rPad);

		// Only run scrubbing behaviour if the graph is wider than the viewport:
		if (graphWidth > scrubViewportWidth) {
			const centrePoint = Math.floor(scrubViewportWidth / 2);
			const scrubPos = currentDataPointIndex * xAxisScale;

			if (scrubPos + lPad < centrePoint) {
				setSlideAmount(0);
			} else if (scrubPos > xAxisSize - centrePoint) {
				// do nothing
			} else {
				setSlideAmount(centrePoint - (scrubPos + rPad));
			}
		} else {
			setGraphWidth(scrubViewportWidth);
		}
	}, [scrubViewportRef.current, xAxisSize, xAxisScale, currentDataPointIndex]);

	const viewBoxMinX = 0 - lPad;
	const viewBoxMinY = 0 - tPad;
	const viewBoxWidth = xAxisSize + lPad + rPad;
	const viewBoxHeight = yAxisSize + tPad + bPad;

	return (
		<figure
			ref={scrubViewportRef}
			style={{ overflowX: "hidden" }}
			data-componentid="scrubber-viewport"
		>
			<svg
				style={{
					transform: `translateX(${slideAmount}px)`,
					height,
					width: graphWidth,
				}}
				viewBox={`${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`}
				preserveAspectRatio="none"
				data-componentid="svg-canvas-scrubbable"
			>
				{children}
			</svg>
		</figure>
	);
};
