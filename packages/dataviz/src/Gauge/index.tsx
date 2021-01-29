import React from "react";

export interface GaugeProps {
	value: number;
	strokeWidth?: number;
	style?: React.CSSProperties;
	colourMapper?: (value: number) => string;
}

export function defaultColourMapper(value: number): string {
	switch (true) {
		case value === 0:
			return "grey";
		default:
			return "black";
	}
}

// arc length = circumference * (fraction of circle represented by the arc)
const arcLength: number = 2 * Math.PI * 28 * (270 / 360);

function getIndicatorLength(value: number): number {
	return arcLength * (1 - value / 100);
}

export const Gauge = ({
	colourMapper = defaultColourMapper,
	strokeWidth = 4,
	style = {},
	value,
}: GaugeProps): JSX.Element => {
	const indicatorLength: number = getIndicatorLength(value);
	const pad = strokeWidth - 4;
	const d = `M -${20 - pad} ${20 - pad} A ${28 - pad} ${28 - pad}, 0, 1, 1, ${
		20 - pad
	} ${20 - pad}`;

	return (
		<svg viewBox="-32 -32 64 64" width="100%" height="100%" style={style}>
			<g fill="none" strokeWidth={strokeWidth} strokeLinecap="round">
				<path d={d} stroke={colourMapper(0)} />
				<path
					d={d}
					stroke={colourMapper(value)}
					strokeDasharray={arcLength}
					strokeDashoffset={indicatorLength}
				/>
			</g>
		</svg>
	);
};
