import React from "react";
import { Box, BoxProps } from "theme-ui";

export interface SplitterProps extends BoxProps {
	direction: "vertical" | "horizontal";
	fill: string;
}

export const Splitter = ({ direction, fill, sx = {} }: SplitterProps): JSX.Element => (
	<Box
		sx={{
			...sx,
			height: direction === "vertical" ? "auto" : "1px",
			width: direction === "horizontal" ? "auto" : "1px",
			bg: fill,
			opacity: 0.25,
		}}
	/>
);
