import React from "react";
import I18n from "../../app/I18n";
import { Dimensions } from "react-native";
import { Text } from "./Typography";

import Svg, { Line } from "react-native-svg";

import {
	distanceUntilScored,
	blockDistanceToMetersLeft,
	blockDistanceToPercentage,
} from "@thingco/unit-formatter";
import { usePrefs } from "@thingco/user-preferences";

import { useTheme } from "../Provider/ThemeProvider";
import { View } from "./Containers";

const { width: viewportWidth, height: viewportHeight } = Dimensions.get("window");
interface BlockProgressProps {
	progress?: { BlockDistance: number; BlockDuration: number };
	total?: number;
	strokeWidth?: number;
	margin?: number;
}

const config = {
	distanceScored: 160934,
};

export const BlockProgress = ({
	progress = {
		BlockDistance: 0,
		BlockDuration: 0,
	},
	strokeWidth = 7,
	margin = 50,
}: BlockProgressProps) => {
	const { theme } = useTheme();
	const { prefs } = usePrefs();

	const disUntilScored = distanceUntilScored({
		unitPreference: prefs.distanceUnitPref,
	});

	const untilComplete = progress.BlockDistance
		? disUntilScored(progress.BlockDistance)
		: disUntilScored(0);
	const metersLeft = blockDistanceToMetersLeft(progress.BlockDistance);
	const progressPercentage = blockDistanceToPercentage(progress.BlockDistance);
	const value = 3 + progressPercentage * 97;
	const width = (viewportWidth - margin) * (value / 100);

	return (
		<View
			style={{
				paddingVertical: 20,
			}}
		>
			<Text variant={"base greyscale50 centred"}>
				<Text variant={"bold"}>
					{I18n.t("unit until scored", {
						unit: metersLeft < 0 ? 0 : progress ? untilComplete : "100 mi",
					})}
				</Text>
			</Text>
			<Svg width={viewportWidth - 20} height="20">
				<Line
					x1="5"
					y1="10"
					x2={viewportWidth - margin}
					y2="10"
					stroke={theme.colors.text_appBackground}
					strokeWidth={strokeWidth}
					strokeLinecap="round"
				/>
				<Line
					x1="5"
					y1="10"
					x2={width}
					y2="10"
					stroke={theme.colors.primary}
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
					stroke={theme.colors.text_appBackground}
					strokeWidth={strokeWidth}
					strokeLinecap="round"
				/>
				<Line
					x1="5"
					y1="10"
					x2={0}
					y2="10"
					stroke={theme.colors.text_appBackground}
					strokeWidth={strokeWidth}
					strokeLinecap="round"
				/>
			</Svg>
		</View>
	);
};
