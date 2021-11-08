import React from "react";
import { TextStyle, TouchableOpacity, ViewStyle, Text, TouchableOpacityProps } from "react-native";
import { variantToTheme } from "../util";

import { IconType, LineIcon } from "./Icons";

interface ImageButtonProps extends TouchableOpacityProps {
	icon: IconType;
	size: number;
	stroke?: string;
	strokeWidth?: number;
	text: string;
	style?: ViewStyle[] | ViewStyle;
	textStyle?: TextStyle[] | TextStyle;
}

export const ImageButton = ({
	text,
	icon,
	stroke,
	strokeWidth = 2,
	size,
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
			<LineIcon iconType={icon} stroke={stroke} size={size} strokeWidth={strokeWidth} />
			<Text style={[...textStyles, ...custTextStyle]}>{text}</Text>
		</TouchableOpacity>
	);
};
