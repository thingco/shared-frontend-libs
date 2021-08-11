import React from "react";
import { View } from "./Containers";
import { Text } from "./Typography";
import { useTheme } from "../Provider/ThemeProvider";
import { Image } from "react-native";
import { ProgressCircle } from "react-native-svg-charts";
import _ from "lodash";
import I18n from "../../app/I18n";

interface BlockScoreProps {
	score: number;
	scored: boolean;
	angle?: number;
	size?: number;
	textVariant?: string;
	total?: number;
	blockChange?: number;
	from?: string;
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
}: BlockScoreProps) => {
	const { theme } = useTheme();
	const textColor = textVariant ? textVariant : "text_appBackground bold";

	const scoreBoundaries = [50, 75]; // TODO: Get this from config?

	const progColor =
		scored && score < scoreBoundaries[0]
			? theme.colors.errorLight
			: scored && score < scoreBoundaries[1]
			? theme.colors.errorDark
			: theme.colors.primary;

	let change = blockChange ? _.round(blockChange, 0) : undefined;
	let showChange = change ? Math.abs(change) : undefined;
	const up = require("../Icons/icon_points_up.png");
	const down = require("../Icons/icon_points_down.png");

	let since;

	if (blockChange && change !== 0 && from) {
		since = (
			<View style={{ display: "flex", flexDirection: "row" }}>
				<Image
					style={{
						flex: 0,
						alignSelf: "center",
						width: 5,
						marginRight: 5,
					}}
					source={blockChange > 0 ? up : down}
				/>
				<Text variant={"xsmall greyscale50"}>
					<Text style={{ fontWeight: "bold" }}>{showChange}</Text>{" "}
					{I18n.t("since")} {from}
				</Text>
			</View>
		);
	} else if (change === 0 && from) {
		since = (
			<Text variant={"xsmall greyscale50"} style={{ textAlign: "center" }}>
				<Text style={{ fontWeight: "bold" }}>{I18n.t("No Change")}</Text> {"\n"}
				{I18n.t("since")} {from}
			</Text>
		);
	} else if (change === 0) {
		since = (
			<Text variant={"xsmall greyscale50"}>{I18n.t("No score yet")}</Text>
		);
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
				backgroundColor={theme.colors.text_appBackground}
				startAngle={-Math.PI * angle}
				endAngle={Math.PI * angle}
				strokeWidth={size / 20}
			/>
			<View variant="centred" style={{ flex: 1, zIndex: 2 }}>
				{scored ? (
					<Text variant={textColor}>
						<Text
							style={[{ fontSize: size / 5, lineHeight: (size / 5) * 1.2 }]}
						>
							{_.round(score)}
						</Text>{" "}
						/ {total}
					</Text>
				) : (
					<Text
						style={[{ fontSize: size / 5, lineHeight: (size / 5) * 1.2 }]}
						variant={textColor}
					>
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

export const BlockScoreEmpty = ({
	size,
	angle = 0.8,
}: BlockScoreEmptyProps) => {
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
				backgroundColor={theme.colors.text_appBackground}
				startAngle={-Math.PI * angle}
				endAngle={Math.PI * angle}
				strokeWidth={size / 20}
			/>
			<View variant="centred" style={{ flex: 1, zIndex: 2 }}>
				<Text variant="desc greyscale50">Loading...</Text>
			</View>
		</View>
	);
};

export const BlockScoreNoData = ({
	size,
	angle = 0.8,
}: BlockScoreEmptyProps) => {
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
				backgroundColor={theme.colors.text_appBackground}
				startAngle={-Math.PI * angle}
				endAngle={Math.PI * angle}
				strokeWidth={size / 20}
			/>
			<View variant="centred" style={{ flex: 1, zIndex: 2 }}>
				<Text variant="desc greyscale50">No Data Found</Text>
			</View>
		</View>
	);
};
