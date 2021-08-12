import React from "react";
import { TextStyle } from "react-native";
import { Text } from "./Typography";

import { variantToTheme } from "../util";
interface LinkTextProps {
	children?: string;
	variant?: string;
	style?: TextStyle | TextStyle[];
	onPress: () => void;
}

export const LinkText = ({
	variant = "",
	style = [],
	onPress,
	children,
	...props
}: LinkTextProps) => {
	style = style instanceof Array ? style : [style];
	const styles: any[] = variantToTheme({ component: "text", styles: variant });
	return (
		<Text
			style={[...styles, ...style, { textDecorationLine: "underline" }]}
			{...props}
			onPress={onPress}
		>
			{children}
		</Text>
	);
};
