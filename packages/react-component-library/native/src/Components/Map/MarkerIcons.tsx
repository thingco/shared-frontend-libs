import React from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import Svg, { Circle, G, Path, Line, Polygon } from "react-native-svg";

type IconType = "expand-vertical" | "contract-vertical";
type PinIconType = "event" | "car-location";

interface IconProps {
	stroke?: string;
	strokeWidth?: number;
	fill?: string;
	type: IconType;
}

interface PinIconProps {
	stroke?: string;
	strokeWidth?: number;
	bgFill?: string;
	highlightFill?: string;
	type: PinIconType;
}

export const iconSelectorPin = (
	stroke: string,
	strokeWidth: number,
	bgFill: string,
	highlightFill: string,
	type: PinIconType
): JSX.Element => {
	switch (type) {
		case "event":
			return (
				<Svg viewBox="0 0 64 64">
					<Path
						d="M55,28A23,23,0,1,0,17.37,45.75L32,60.38,46.63,45.75A23,23,0,0,0,55,28Z"
						fill={bgFill}
						stroke={stroke}
						strokeMiterlimit="10"
						strokeWidth={strokeWidth * 2}
					/>
					<Circle
						cx="32"
						cy="28"
						r="18"
						fill={highlightFill}
						stroke={stroke}
						strokeMiterlimit="10"
						strokeWidth={strokeWidth}
					/>
					<G>
						<Line
							x1="32"
							y1="29.75"
							x2="32"
							y2="18.75"
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeWidth={strokeWidth}
						/>
						<Circle cx="32" cy="35.75" r="1.5" stroke={stroke} />
					</G>
				</Svg>
			);
		case "car-location":
			return (
				<Svg viewBox="0 0 64 64">
					<Circle
						cx="32"
						cy="32"
						r="27"
						fill={bgFill}
						stroke={stroke}
						strokeMiterlimit="10"
						strokeWidth={strokeWidth * 2}
					/>
					<G>
						<Polygon
							points="41.53 35.01 47.89 34.42 47.89 31.92 42.59 32.41 41.53 35.01"
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<Polygon
							points="22.47 35.01 16.11 34.42 16.11 31.92 21.41 32.41 22.47 35.01"
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<Path
							d="M24.78,32H39.22a1.07,1.07,0,0,1,1.08,1.38l-2,4a.57.57,0,0,1-.54.35H26.28a.57.57,0,0,1-.54-.35l-2-4A1.06,1.06,0,0,1,24.78,32Z"
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<Line
							x1="19.29"
							y1="27.7"
							x2="44.71"
							y2="27.7"
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<Path
							d="M41.78,41.15v1.37a.44.44,0,0,0,.43.46h4a.45.45,0,0,0,.44-.46V41.15Z"
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
						/>
						<Path
							d="M17.33,41.15v1.37a.45.45,0,0,0,.44.46h4a.44.44,0,0,0,.43-.46V41.15Z"
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
						/>
						<Path
							d="M44.71,27.54,46.3,28.8A4.08,4.08,0,0,1,47.89,32v7.53a1.1,1.1,0,0,1-1.14,1H17.25a1.1,1.1,0,0,1-1.14-1V32A4.08,4.08,0,0,1,17.7,28.8l1.59-1.26,3.4-5.71A2.34,2.34,0,0,1,24.48,21h15a2.34,2.34,0,0,1,1.79.81Z"
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={strokeWidth}
						/>
						<Path
							d="M46,28.57l-1.25-1-.65-1.09H48.5v1.05a1.21,1.21,0,0,1-1.33,1Z"
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<Path
							d="M18.05,28.57l1.25-1L20,26.48H15.5v1.05a1.21,1.21,0,0,0,1.33,1Z"
							fill="none"
							stroke={stroke}
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</G>
				</Svg>
			);
	}
};

export const iconSelectorSmall = (
	stroke: string,
	strokeWidth: number,
	fill: string,
	type: IconType
): JSX.Element => {
	switch (type) {
		case "contract-vertical":
			return (
				<Svg viewBox="0 0 32 32">
					{" "}
					{/*style={{ pointerEvents: "none" }}> */}
					<title>Contract Vertically</title>
					<G
						fill={fill}
						stroke={stroke}
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={strokeWidth}
					>
						<polyline points="21.04 25.04 16 20 10.96 25.04" />
						<polyline points="10.96 7 16 12.04 21.04 7" />
					</G>
				</Svg>
			);
		case "expand-vertical":
			return (
				<Svg viewBox="0 0 32 32">
					<title>Expand Vertically</title>
					<G
						fill={fill}
						stroke={stroke}
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={strokeWidth}
					>
						<polyline points="10.96 22 16 27.04 21.04 22" />
						<polyline points="21.04 10.04 16 5 10.96 10.04" />
					</G>
				</Svg>
			);
	}
};

export const IconSmall = ({
	size,
	containerStyle,
	stroke = "#000",
	strokeWidth = 2,
	fill = "none",
	type,
}: IconProps & {
	size: number | string;
	containerStyle?: TouchableOpacityProps;
}): JSX.Element => (
	<TouchableOpacity style={{ height: size, width: size, ...containerStyle }}>
		{iconSelectorSmall(stroke, strokeWidth, fill, type)}
	</TouchableOpacity>
);

export const IconPin = ({
	size,
	containerStyle = {},
	stroke = "#000",
	bgFill = "#fff",
	highlightFill = "#fff",
	clickHandler,
	strokeWidth = 2,
	type,
}: PinIconProps & {
	size: number | string;
	containerStyle?: TouchableOpacityProps;
	clickHandler?: undefined | ((e: any) => void);
}): JSX.Element => (
	<TouchableOpacity
		onPress={() => clickHandler ?? null}
		style={{ height: size, width: size, ...containerStyle }}
	>
		{iconSelectorPin(stroke, strokeWidth, bgFill, highlightFill, type)}
	</TouchableOpacity>
);
