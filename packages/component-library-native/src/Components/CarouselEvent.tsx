import I18n from "i18n-js";
import React from "react";
import { ActivityIndicator, Dimensions, TouchableOpacity } from "react-native";
import { useTheme } from "../Provider/ThemeProvider";
import { View } from "./Containers";
import { Text } from "./Typography";

import Warning from "./icon_warning.svg";

const { width: viewportWidth } = Dimensions.get("window");

const tileWidth = viewportWidth - 40;

export const CarouselEvent = ({ item, index, height, onPress }) => {
	let event;
	let icon;
	let details;
	if (item.type === "summary") {
		details = (
			<View
				variant={"flexRow"}
				style={{
					flex: 2,
				}}
			>
				<View
					variant={"centred"}
					style={{
						flex: 1,
						justifyContent: "flex-end",
					}}
				>
					<Text variant={"accent"}>{I18n.t("Distance")}</Text>
					<Text>
						<Text style={{ fontWeight: "bold" }}>{item.distance}</Text>{" "}
					</Text>
				</View>
				<View
					variant={"centred"}
					style={{
						flex: 1,
						justifyContent: "flex-end",
					}}
				>
					<Text variant={"accent"}>{I18n.t("Duration")}</Text>
					<Text style={{ fontWeight: "bold" }}>{item.duration}</Text>
				</View>
				<View
					variant={"centred"}
					style={{
						flex: 1,
						justifyContent: "flex-end",
					}}
				>
					<Text variant={"accent"}>{I18n.t("Avg Speed")}</Text>
					<Text>
						<Text style={{ fontWeight: "bold" }}>{item.avgspeed}</Text>{" "}
					</Text>
				</View>
			</View>
		);
		return (
			<TouchableOpacity
				activeOpacity={1}
				style={{
					flex: 1,
					width: tileWidth,
					paddingTop: 18, // needed for shadow
					paddingBottom: 18, // needed for shadow,
				}}
				onPress={(e) => onPress(e, index)}
			>
				<View variant={"card"} style={{ minHeight: height }}>
					<View style={{ marginTop: 6, marginBottom: 6 }}>
						<Text
							variant={"base bold text_background"}
							style={{ letterSpacing: 0.5 }}
						>
							{item.title}
						</Text>
					</View>
					<View
						style={{
							flex: 2,
							marginTop: 2,
							borderTopWidth: 1,
							borderTopColor: "#dddddd",
						}}
					>
						<Text variant={"base text_background"} style={{ marginTop: 6 }}>
							{item.description}
						</Text>
						{details}
					</View>
				</View>
			</TouchableOpacity>
		);
	} else {
		event = (
			<Text variant={"base greyscale_600"} style={{ fontStyle: "italic" }}>
				{item.location} at {item.time}
			</Text>
		);
		icon = <Warning style={{ marginRight: 10 }} />;
		return (
			<TouchableOpacity
				activeOpacity={1}
				style={{
					flex: 1,
					width: tileWidth,
					paddingTop: 18, // needed for shadow
					paddingBottom: 18, // needed for shadow
				}}
				onPress={(e) => onPress(e, index)}
			>
				<View variant={"card"} style={{ minHeight: height }}>
					<View style={{ flex: 1, display: "flex", flexDirection: "row" }}>
						{icon}
						<View style={{ flex: 3 }}>
							<Text
								variant={"base bold text_background"}
								style={{ letterSpacing: 0.5 }}
							>
								{item.title}
							</Text>
							{event}
						</View>
					</View>
					<View
						style={{
							flex: 2,
							borderTopWidth: 1,
							borderTopColor: "#dddddd",
						}}
					>
						<Text variant={"base text_background"} style={{ marginTop: 6 }}>
							{item.description}
						</Text>
						{details}
					</View>
				</View>
			</TouchableOpacity>
		);
	}
};

export const CarouselEventEmpty = ({ height }) => {
	const { theme } = useTheme();
	return (
		<View
			variant="card centred"
			style={{ minHeight: height, marginHorizontal: 20, marginBottom: 10 }}
		>
			<ActivityIndicator size="large" color={theme.colors.primary} />
		</View>
	);
};
