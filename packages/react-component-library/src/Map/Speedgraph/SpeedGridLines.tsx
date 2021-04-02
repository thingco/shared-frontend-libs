import React from "react";
import { useThemeUI } from "theme-ui";

export const SpeedGridLines = ({
	width,
	height,
	yScale,
}: {
	width: number;
	height: number;
	yScale: number;
}): JSX.Element => {
	const { theme } = useThemeUI();

	return (
		<g stroke={theme.colors?.muted} fill="none" opacity={0.1}>
			{Array.from({ length: height / yScale }, (_, i) => (
				<line key={`yline${i}`} x1={0} y1={i * 10} x2={width} y2={i * 10} />
			))}
		</g>
	);
};
