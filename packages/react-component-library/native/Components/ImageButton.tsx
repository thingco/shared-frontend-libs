import React from "react";
import {
	TextStyle,
	TouchableOpacity,
	ViewStyle,
	Text,
	TouchableOpacityProps,
	Image,
} from "react-native";

import { useTheme } from "../Provider/ThemeProvider";
import { variantToTheme } from "../util";

import { buttonImageSources as imageSources } from "../Icons/ImageSources";

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
	const { theme } = useTheme();

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
			<Image
				source={imageSources[image].uri}
				style={{
					height: 25,
					resizeMode: "contain",
					marginRight: 20,
				}}
			/>
			<Text style={[...textStyles, ...custTextStyle]}>{text}</Text>
		</TouchableOpacity>
	);
};
