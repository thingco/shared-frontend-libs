import React from "react";
import { Box, BoxProps, ThemeUIStyleObject } from "theme-ui";

type IconType = "warn-triangle-marker" | "car-marker";

/**
 * @param fill
 * @param iconType
 * @param stroke
 * @param strokeWidth
 */
function iconSelector(
	fill: string,
	iconType: IconType,
	stroke: string,
	strokeWidth: number
): JSX.Element {
	switch (iconType) {
		case "warn-triangle-marker":
			return (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" height="100%" width="100%">
					<path
						d="M60,32A28,28,0,1,1,32,4,28,28,0,0,1,60,32Z"
						fill="white"
						stroke={stroke}
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={strokeWidth}
					/>
					<g>
						<path
							d="M30.24,15.63a1.29,1.29,0,0,1,2.24,0l7.91,13.71,7.92,13.71A1.29,1.29,0,0,1,47.19,45H15.53a1.29,1.29,0,0,1-1.12-1.93l7.92-13.71Z"
							fill={fill}
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
						/>
						<g>
							<path
								d="M31.36,39.34c-.35,0-.48.13-.48.49s.13.48.48.48.47-.13.47-.48S31.71,39.34,31.36,39.34Z"
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
							/>
							<path
								fill="none"
								stroke={stroke}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={strokeWidth}
								d="M31.37 35.79 L31.84 22.88 L30.88 22.88 L31.37 35.79 Z"
							/>
						</g>
					</g>
				</svg>
			);
		case "car-marker":
			return (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" height="100%" width="100%">
					<path
						d="M60,32A28,28,0,1,1,32,4,28,28,0,0,1,60,32Z"
						fill="white"
						stroke={stroke}
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={strokeWidth}
					/>
					<g>
						<path
							d="M49.73,45.64v-14a6.79,6.79,0,0,0-.29-2L46.22,18.94A2.73,2.73,0,0,0,43.61,17H20.39a2.73,2.73,0,0,0-2.61,1.94L14.56,29.68a6.79,6.79,0,0,0-.29,2v14A1.36,1.36,0,0,0,15.64,47h2.72a1.36,1.36,0,0,0,1.37-1.36V42.91H44.27v2.73A1.36,1.36,0,0,0,45.64,47h2.72A1.36,1.36,0,0,0,49.73,45.64Z"
							fill={fill}
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
						/>
						<path
							fill="white"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
							d="M18.36 29.27 L21.09 21.09 L42.91 21.09 L45.64 29.27 L18.36 29.27 Z"
						/>
						<path
							d="M40.18,36.09a2.73,2.73,0,1,1,2.73,2.73A2.73,2.73,0,0,1,40.18,36.09Z"
							fill="white"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
						/>
						<path
							d="M18.36,36.09a2.73,2.73,0,1,1,2.73,2.73A2.73,2.73,0,0,1,18.36,36.09Z"
							fill="white"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
						/>
					</g>
				</svg>
			);
		default:
			throw new Error(`Unknown icon type of ${iconType}`);
	}
}

interface PinIconProps extends BoxProps {
	fill: string;
	iconType: IconType;
	size: number | string;
	stroke: string;
	strokeWidth?: number;
	sx?: ThemeUIStyleObject;
}

export const PinIcon = ({
	fill,
	iconType,
	size,
	stroke,
	strokeWidth = 2,
	sx = {},
}: PinIconProps): JSX.Element => (
	<Box sx={{ height: size, width: size, ...sx }}>
		{iconSelector(fill, iconType as IconType, stroke, strokeWidth)}
	</Box>
);
