import React from "react";
import { TextStyle, TouchableOpacity, ViewStyle, Text, TouchableOpacityProps } from "react-native";
import { View } from "./Containers";

import { useTheme } from "../Provider/ThemeProvider";
import { variantToTheme } from "../util";

import { buttonImageSources as ImageSources } from "../Icons/ImageSources";

import { Dimensions } from "react-native";

const width = Dimensions.get("window").width;

interface ImageButtonProps extends TouchableOpacityProps {
	image: string;
	text: string;
	style?: ViewStyle[] | ViewStyle;
	textStyle?: TextStyle[] | TextStyle;
}

export const ImageButton = ({
	image,
	text,
	style = [],
	textStyle = [],
	...props
}: ImageButtonProps) => {
	const custStyle = style instanceof Array ? style : [style];
	const custTextStyle = textStyle instanceof Array ? textStyle : [textStyle];

	const textStyles: any[] = variantToTheme({
		component: "text",
		styles: "menu",
	});
	const buttonStyles: any[] = variantToTheme({
		component: "button",
		styles: "menu",
	});

	return (
		<TouchableOpacity style={[...buttonStyles, ...custStyle]} {...props}>
			<ImageSources
				image={image}
				style={{
					marginRight: 20,
				}}
				width={width / 18}
			/>
			<Text style={[...textStyles, ...custTextStyle]}>{text}</Text>
		</TouchableOpacity>
	);
};

interface MenuCheckItemProps {
	text: string;
	checked: boolean;
	highlight: boolean;
	onPress: () => void;
	style?: ViewStyle[] | ViewStyle;
	textStyle?: TextStyle[] | TextStyle;
}

export const MenuCheckItem = ({
	text,
	checked,
	highlight,
	onPress,
	style = [],
	textStyle = [],
	...props
}: MenuCheckItemProps) => {
	const custStyle = style instanceof Array ? style : [style];
	const custTextStyle = textStyle instanceof Array ? textStyle : [textStyle];

	const textStyles: any[] = variantToTheme({
		component: "text",
		styles: "menu",
	});
	const buttonStyles: any[] = variantToTheme({
		component: "button",
		styles: "menu",
	});

	const Check = () => {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignContent: "center",
				}}
			>
				{checked && <ImageSources image={"Tick"} width={width / 18} style={{ style }} />}
			</View>
		);
	};

	return (
		<TouchableOpacity style={[...buttonStyles, ...custStyle]} {...props}>
			<View variant="flexRow">
				<Text style={[...textStyles, ...custTextStyle]}>{text}</Text>
				<Check />
			</View>
		</TouchableOpacity>
	);
};

const style = {
	container: {
		paddingVertical: 16,
	},
	validation: {
		marginTop: 15,
	},
	value: {
		fontSize: 16,
		fontFamily: "Source Sans Pro",
		color: "white",
		flex: 1,
	},
	label: {
		fontSize: 16,
		color: "white",
	},
	row: {
		flexDirection: "row",
	},
	labelWrapper: {
		justifyContent: "center",
		alignItems: "center",
	},
	textWrapper: {
		justifyContent: "center",
		marginLeft: 16,
	},
	imageWrapper: {
		width: 30,
		justifyContent: "center",
		alignItems: "center",
	},
	cell: {
		backgroundColor: "#1A5163",
		padding: 16,
	},
	cellClear: {
		padding: 16,
	},
	switchLayout: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	switch: {
		alignSelf: "flex-end",
	},
	badgeAlignSpace: {
		flex: 1,
	},
	placeholderTextColor: {
		// color: ApplicationStyles.thingcoStyles.theoPlaceholderTextColor,
	},
	placeholderTextColorHighlight: {
		// color: ApplicationStyles.thingcoStyles.theoPlaceholderTextColorHighlight,
	},
};
