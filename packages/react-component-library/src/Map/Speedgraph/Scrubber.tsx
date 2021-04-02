import React from "react";
import { Box, BoxProps, Slider, useThemeUI } from "theme-ui";

import { useMapData } from "../DataProvider";
import { useMapSpeedgraphLocation } from "../SpeedgraphLocationProvider";
import { useSpeedgraphConfig } from "./ConfigProvider";

export interface MapSpeedgraphScrubberProps extends BoxProps {
	children: React.ReactNode;
}

/**
 * This needs some explanation. The Speedgraph has two parts: the
 * speedgraph itself, and the scrubber that allows a user to drag
 * an indicator across the graph and have that reflected as a position
 * on the map polyline.
 *
 * The point of the scrubber is to update and reflect the speedgraph location
 * value, which is simply the index of the currently selected location.
 *
 * The scrubber, is built on an HTML "range" type input, styled as a vertical line.
 * This provides immediate accessibility benefits. On focus, for example, dragging
 * and keyboard controls work perfectly. And the speedgraph location indices
 * just map directly to the available attributes of the input.
 *
 * The speedgraph will always have a width (in pixels) of the number of points
 * multiplied by a scale.
 *
 * The scrubber consists of:
 *
 * 1. An outer wrapper, with the width (the `slidingWindowWidth` state) set to
 *    _either_ full width of the container or, if the speedgraph width is smaller
 *    than that, the width of the speedgraph.
 *    This width is calculated by using a ref and the `clientWidth` DOM method.
 *    This outer wrapper has overflow hidden.
 * 2. The Speedgraph, sitting within an inner wrapper. This will be offset to the
 *    left (`slideAmount`) IF the graph is wider than the `slidingWindowWidth` state by using:
 *        rangePercent * overflow
 *    which is calculated:
 *        (selectedSpeedGraphLocation / numPoints) * (slidingWindowWidth - (numPoints * xScale))
 *    A CSS transform function (translateX) is used to apply this:
 *        transform: `translateX(0 - ${slideAmount}px)`
 *    So, for example, say the sliding window is 200px wide, and the speedgraph is 300px, and
 *    there are 300 points (_ie_ the scaling is 1).
 *      - When the range slider is at 0, the offset is also 0: `(0 / 300) * (200 - (300 * 1))`
 *      - When the range slider is at 300, the offset is -100: `(300 / 300) * (200 - (300 * 1))`
 *      - When the range slider is at 150, the offset is -50: `(150 / 300) * (200 - (300 * 1))`
 * 3. The Scrubber is a range slider absolutely positioned over the top of the Speedgraph
 *    styled to look like a vertical bar.It's `min` is 0, its `max` is the total number of
 *    points, and its current value is the current point (`selectedSpeedgraphLocation`).
 *    When the value is changed, the handler updates the  `selectedSpeedgraphLocation` value and the
 *    `slideAmount` recalculated.
 */

export const SpeedgraphScrubber = ({
	children,
}: MapSpeedgraphScrubberProps): JSX.Element | null => {
	const { pointSpeeds, roadSpeeds } = useMapData();
	const { selectedSpeedgraphLocation, setSelectedSpeedgraphLocation } = useMapSpeedgraphLocation();
	const { xScale, yScale } = useSpeedgraphConfig();
	const { theme } = useThemeUI();

	const numPoints = pointSpeeds.length;
	const width = roadSpeeds.length * xScale;
	const height =
		numPoints > 0 ? Math.max(Math.max(...pointSpeeds), Math.max(...roadSpeeds)) * yScale : 0;

	const scrubWindowRef = React.useRef<HTMLDivElement>(null);
	const [slidingWindowWidth, setSlidingWindowWidth] = React.useState(0);
	const [slideAmount, setSlideAmount] = React.useState(0);

	React.useLayoutEffect(() => {
		const speedgraphWidth = numPoints * xScale;
		const scrubWindowWidth = (scrubWindowRef.current as HTMLDivElement).clientWidth;

		if (speedgraphWidth <= scrubWindowWidth) {
			setSlidingWindowWidth(speedgraphWidth);
		} else {
			setSlidingWindowWidth((scrubWindowRef.current as HTMLDivElement).clientWidth);
		}
	}, [scrubWindowRef.current, numPoints, xScale]);

	const scrubHandler = (e: React.ChangeEvent) => {
		const speedgraphWidth = numPoints * xScale;
		const overflow = slidingWindowWidth - speedgraphWidth;
		const percent = +(e.target as HTMLInputElement).value / numPoints;

		setSelectedSpeedgraphLocation(+(e.target as HTMLInputElement).value);
		setSlideAmount(percent * overflow);
	};

	return (
		<Box
			ref={scrubWindowRef}
			as="figure"
			sx={{
				position: "relative",
				overflowX: "hidden",
				overflowY: "visible",
				height,
				maxWidth: width,
			}}
		>
			<Box
				sx={{
					transform: `translateX(${slideAmount}px)`,
					width,
					height,
				}}
			>
				{children}
			</Box>
			<Slider
				sx={{
					outline: "none",
					height: "100%",
					width: "100%",
					top: 0,
					display: "block",
					position: "absolute",
					zIndex: 1,
					backgroundColor: "transparent",
					/** NOTE these are literally all exactly the same, but Typescript
					 * throws a hissy fit if I just use the same object of each one,
					 * so each has the same object copy-pasted instead.
					 */
					"&::-webkit-slider-thumb": {
						height: height,
						width: 4,
						backgroundColor: theme.colors?.secondary,
						border: 0,
						borderRadius: 0,
						display: "block",
						position: "relative",
						// This doesn't work, but need something similar:
						// "&::after": {
						//   content: `Speed: ${pointSpeeds[selectedSpeedgraphLocation || 0]}`,
						//   backgroundColor: "inherit",
						//   color: theme.colors?.highlight,
						//   padding: "0.25rem",
						//   position: "absolute",
						//   bottom: 0,
						//   transform: "translateX(-50%)",
						// },
					},
					"&::-moz-range-thumb": {
						height: height,
						width: 4,
						backgroundColor: theme.colors?.secondary,
						border: 0,
						borderRadius: 0,
						display: "block",
						position: "relative",
					},
					"&::-ms-thumb": {
						height: height,
						width: 4,
						backgroundColor: theme.colors?.secondary,
						border: 0,
						borderRadius: 0,
						display: "block",
						position: "relative",
					},
				}}
				min={0}
				max={numPoints - 1}
				step={1}
				value={selectedSpeedgraphLocation}
				onChange={scrubHandler}
			/>
		</Box>
	);
};
