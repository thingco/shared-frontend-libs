import * as React from "react";
import { Box, BoxProps, Flex } from "theme-ui";

import { defaultTheme } from "./defaultTheme";
import { validateScore } from "./Score";

export interface GaugeSVGProps {
	score: number;
	strokeWidth?: number;
	colours?: Colours;
}

interface Colours {
	EMPTY: string;
	LOW: string;
	MEDIUM: string;
	HIGH: string;
}

const defaultColours: Colours = {
	EMPTY: defaultTheme.colors?.gauge_background as string,
	LOW: defaultTheme.colors?.gauge_low as string,
	MEDIUM: defaultTheme.colors?.gauge_medium as string,
	HIGH: defaultTheme.colors?.gauge_high as string,
};

// arc length = circumference * (fraction of circle represented by the arc)
const arcLength: number = 2 * Math.PI * 28 * (270 / 360);

const getIndicatorLength = (score: number): number => {
	const validScore = validateScore(score);
	return arcLength * (1 - validScore / 100);
};

const getScoreColour = (colours: Colours, score: number): string => {
	const validScore = validateScore(score);

	switch (true) {
		case validScore < 50:
			return colours.LOW;
		case validScore < 75:
			return colours.MEDIUM;
		case validScore <= 100:
			return colours.HIGH;
		default:
			// NOTE default case included to prevent compiler screaming about
			// possible no return value for the function.
			return colours.LOW;
	}
};

export const GaugeSVG = ({
	colours = defaultColours,
	score,
	strokeWidth,
}: GaugeSVGProps): JSX.Element => {
	const scoreColour: string = getScoreColour(colours, score);
	const indicatorLength: number = getIndicatorLength(score);
	return (
		<svg viewBox="-32 -32 64 64" width="100%" height="auto">
			<g fill="none" strokeWidth={strokeWidth} strokeLinecap="round">
				<path d="M -20 20 A 28 28, 0, 1, 1, 20 20" stroke={colours.EMPTY} />
				<path
					d="M -20 20 A 28 28, 0, 1, 1, 20, 20"
					stroke={scoreColour}
					strokeDasharray={arcLength}
					strokeDashoffset={indicatorLength}
				/>
			</g>
		</svg>
	);
};

export interface GaugeProps extends GaugeSVGProps, BoxProps {}

export const Gauge = ({
	score,
	children = null,
	colours = defaultColours,
	strokeWidth = 4,
	sx = {},
}: GaugeProps): JSX.Element => (
	<Box sx={{ position: "relative", ...sx }}>
		<Flex
			sx={{
				position: "absolute",
				width: "100%",
				height: "100%",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			{children}
		</Flex>
		<GaugeSVG colours={colours} score={score} strokeWidth={strokeWidth} />
	</Box>
);
