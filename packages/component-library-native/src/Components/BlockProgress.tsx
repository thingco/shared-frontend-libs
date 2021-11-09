import React from "react";
import _ from "lodash";
import { Dimensions } from "react-native";
import { Text } from "./Typography";

import Svg, { Line } from "react-native-svg";

import { useTheme } from "../Provider/ThemeProvider";
import { View } from "./Containers";

const { width: viewportWidth } = Dimensions.get("window");
interface BlockProgressProps {
	progressPercentage: number;
	text: string;
	total?: number;
	strokeWidth?: number;
	margin?: number;
}

export const BlockProgress = ({
	text,
	progressPercentage,
	strokeWidth = 7,
	margin = 50,
}: BlockProgressProps) => {
	const { theme } = useTheme();

	const value = 3 + progressPercentage * 97;
	const width = (viewportWidth - margin) * (value / 100);

	return (
		<View
			style={{
				paddingVertical: 20,
			}}
		>
			<Text variant={"base text_appBackground centred"}>
				<Text variant={"bold"}>{text}</Text>
			</Text>
			<Svg width={viewportWidth - 20} height="20">
				<Line
					x1="5"
					y1="10"
					x2={viewportWidth - margin}
					y2="10"
					stroke={theme.colors?.greyscale200}
					strokeWidth={strokeWidth}
					strokeLinecap="round"
				/>
				<Line
					x1="5"
					y1="10"
					x2={width}
					y2="10"
					stroke={theme.colors?.primary}
					strokeWidth={strokeWidth}
					strokeLinecap="round"
				/>
			</Svg>
		</View>
	);
};

export const BlockProgressLoading = () => {
	const { theme } = useTheme();
	const strokeWidth = 7;
	const margin = 50;
	const width = viewportWidth - margin;
	return (
		<View
			style={{
				flex: 1,
				paddingVertical: 20,
			}}
		>
			<Svg width={viewportWidth - 20} height="20">
				<Line
					x1="5"
					y1="10"
					x2={width}
					y2="10"
					stroke={theme.colors?.greyscale200}
					strokeWidth={strokeWidth}
					strokeLinecap="round"
				/>
				<Line
					x1="5"
					y1="10"
					x2={0}
					y2="10"
					stroke={theme.colors?.greyscale200}
					strokeWidth={strokeWidth}
					strokeLinecap="round"
				/>
			</Svg>
		</View>
	);
};
