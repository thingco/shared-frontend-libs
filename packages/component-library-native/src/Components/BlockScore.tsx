import React from "react";
import { View } from "./Containers";
import { Text } from "./Typography";
import { useTheme } from "../Provider/ThemeProvider";
import { ProgressCircle } from "react-native-svg-charts";
import _ from "lodash";

import Up from "../Icons/icon_points_up.svg";
import Down from "../Icons/icon_points_down.svg";

interface BlockScoreProps {
	score: number;
	scored: boolean;
	angle?: number;
	size?: number;
	textVariant?: string;
	total?: number;
	blockChange?: number;
	from?: string;
	sinceText?: string;
	noScoreText?: string;
	noChangeText?: string;
}
export const BlockScore = ({
	score,
	scored,
	angle = 0.8,
	size = 200,
	textVariant,
	total = 100,
	blockChange,
	from,
	sinceText,
	noScoreText,
	noChangeText,
}: BlockScoreProps) => {
	const { theme } = useTheme();
	const textColor = textVariant ? textVariant : "text_appBackground bold";

	const scoreBoundaries = [50, 75]; // TODO: Get this from config?

	const progColor =
		scored && score < scoreBoundaries[0]
			? theme.colors?.warn_1
			: scored && score < scoreBoundaries[1]
			? theme.colors?.warn_2
			: theme.colors?.primary;

	const change = blockChange ? _.round(blockChange, 0) : undefined;
	const showChange = change ? Math.abs(change) : undefined;

	let since;

	if (blockChange && change !== 0 && from) {
		since = (
			<View style={{ display: "flex", flexDirection: "row" }}>
				{blockChange > 0 ? (
					<Up
						style={{
							flex: 0,
							alignSelf: "center",
							width: 5,
							marginRight: 5,
						}}
					/>
				) : (
					<Down
						style={{
							flex: 0,
							alignSelf: "center",
							width: 5,
							marginRight: 5,
						}}
					/>
				)}
				<Text variant={"xsmall text_appBackground"}>
					<Text style={{ fontWeight: "bold" }}>{showChange}</Text> {sinceText} {from}
				</Text>
			</View>
		);
	} else if (change === 0 && from) {
		since = (
			<Text variant={"xsmall text_appBackground"} style={{ textAlign: "center" }}>
				<Text style={{ fontWeight: "bold" }}>{noChangeText}</Text> {"\n"}
				{sinceText} {from}
			</Text>
		);
	} else if (change === 0) {
		since = <Text variant={"xsmall text_appBackground"}>{noScoreText}</Text>;
	}

	return (
		<View
			style={{
				height: size,
				width: size,
			}}
		>
			<ProgressCircle
				style={{
					height: size,
					width: size,
					position: "absolute",
				}}
				progress={score / 100}
				progressColor={progColor}
				backgroundColor={theme.colors?.greyscale600}
				startAngle={-Math.PI * angle}
				endAngle={Math.PI * angle}
				strokeWidth={size / 20}
			/>
			<View variant="centred" style={{ flex: 1, zIndex: 2 }}>
				{scored ? (
					<Text variant={textColor}>
						<Text style={[{ fontSize: size / 5, lineHeight: (size / 5) * 1.2 }]}>
							{_.round(score)}
						</Text>{" "}
						/ {total}
					</Text>
				) : (
					<Text style={[{ fontSize: size / 5, lineHeight: (size / 5) * 1.2 }]} variant={textColor}>
						-
					</Text>
				)}
				{since}
			</View>
		</View>
	);
};

interface BlockScoreEmptyProps {
	size: number;
	angle?: number;
}

export const BlockScoreEmpty = ({ size, angle = 0.8 }: BlockScoreEmptyProps) => {
	const { theme } = useTheme();
	return (
		<View
			style={{
				height: size,
				width: size,
			}}
		>
			<ProgressCircle
				style={{
					height: size,
					width: size,
					position: "absolute",
				}}
				progress={0}
				progressColor={"transparent"}
				backgroundColor={theme.colors?.greyscale600}
				startAngle={-Math.PI * angle}
				endAngle={Math.PI * angle}
				strokeWidth={size / 20}
			/>
			<View variant="centred" style={{ flex: 1, zIndex: 2 }}>
				<Text variant="desc text_appBackground">Loading...</Text>
			</View>
		</View>
	);
};

export const BlockScoreNoData = ({ size, angle = 0.8 }: BlockScoreEmptyProps) => {
	const { theme } = useTheme();
	return (
		<View
			style={{
				height: size,
				width: size,
			}}
		>
			<ProgressCircle
				style={{
					height: size,
					width: size,
					position: "absolute",
				}}
				progress={0}
				progressColor={"transparent"}
				backgroundColor={theme.colors?.text_appBackground}
				startAngle={-Math.PI * angle}
				endAngle={Math.PI * angle}
				strokeWidth={size / 20}
			/>
			<View variant="centred" style={{ flex: 1, zIndex: 2 }}>
				<Text variant="desc text_appBackground">No Data Found</Text>
			</View>
		</View>
	);
};
