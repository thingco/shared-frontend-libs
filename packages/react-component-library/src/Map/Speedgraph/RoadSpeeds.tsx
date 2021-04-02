import React from "react";
import { useThemeUI } from "theme-ui";

export interface RoadSpeedsProps {
	roadSpeeds: number[];
	xScale: number;
	yScale: number;
	strokeWidth: number;
}
export const RoadSpeeds = ({
	roadSpeeds,
	xScale,
	yScale,
	strokeWidth,
}: RoadSpeedsProps): JSX.Element => {
	const { theme } = useThemeUI();

	return (
		<polygon
			points={`0,0 ${roadSpeeds.map((speed, i) => `${i * xScale},${speed * yScale}`).join(" ")} ${
				roadSpeeds.length * xScale
			},0`}
			fill={theme.colors?.primary}
			stroke="none"
			opacity="0.25"
			strokeWidth={strokeWidth}
		/>
	);
};
