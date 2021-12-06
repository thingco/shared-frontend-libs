import React from "react";
import { TextProps as TProps, TextStyle, Text as RNText } from "react-native";

import { variantToTheme } from "../util";

interface TextProps extends TProps {
	children?: React.ReactNode;
	variant?: string;
	style?: TextStyle | TextStyle[];
}

export const Text = ({
	children,
	variant = "",
	style = [],
	...props
}: TextProps) => {
	style = style instanceof Array ? style : [style];
	const styles: any[] = variantToTheme({ component: "text", styles: variant });
	return (
		<RNText style={[...styles, ...style]} {...props}>
			{children}
		</RNText>
	);
};
