import React from "react";
import shortid from "shortid";
import { useThemeUI } from "theme-ui";

import { generatePolyPoints, mergeSpeeds, tagSpeeds, zipSpeeds } from "./utilities";

import type { PolylineCoordinate } from "../types";

export interface PointSpeedPolylinesProps {
	pointSpeeds: number[];
	roadSpeeds: number[];
	strokeWidth: number;
	xScale: number;
	yScale: number;
}

export const PointSpeedPolylines = ({
	pointSpeeds,
	roadSpeeds,
	strokeWidth = 4,
	xScale = 1,
	yScale = 1,
}: PointSpeedPolylinesProps): JSX.Element => {
	const polylineSegments = [
		...generatePolyPoints(mergeSpeeds(tagSpeeds(zipSpeeds(pointSpeeds, roadSpeeds)))),
	];

	const { theme } = useThemeUI();

	return (
		<>
			<g strokeWidth={strokeWidth} strokeLinejoin="round" fill="none">
				{polylineSegments.map(({ tag, polylineCoordinates }: PolylineCoordinate) => (
					<polyline
						key={shortid.generate()}
						points={polylineCoordinates.map(({ x, y }) => `${x * xScale},${y * yScale}`).join(" ")}
						stroke={
							(tag === "BELOW"
								? theme.colors?.gauge_high
								: tag === "ON"
								? theme.colors?.gauge_medium
								: theme.colors?.gauge_low) as string
						}
					/>
				))}
			</g>
		</>
	);
};
