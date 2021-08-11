import React from "react";
import {
	View as RNView,
	ScrollView as RNScrollView,
	ViewStyle,
	ViewProps as RNViewProps,
	ScrollViewProps as RNScrollViewProps,
} from "react-native";

import { variantToTheme } from "../util";

interface ViewProps extends RNViewProps {
	children?: React.ReactNode;
	variant?: string;
	style?: ViewStyle[] | ViewStyle;
}

export const View = ({
	children,
	variant = "",
	style = [],
	...props
}: ViewProps) => {
	style = style instanceof Array ? style : [style];
	const styles: any[] = variantToTheme({ component: "view", styles: variant });
	return (
		<RNView style={[...styles, ...style]} {...props}>
			{children}
		</RNView>
	);
};

interface ScrollViewProps extends RNScrollViewProps {
	children?: React.ReactNode;
	variant?: string;
	style?: ViewStyle[] | ViewStyle;
}

export const ScrollView = ({
	children,
	variant = "",
	style = [],
	...props
}: ScrollViewProps) => {
	style = style instanceof Array ? style : [style];
	const styles: any[] = variantToTheme({ component: "view", styles: variant });
	return (
		<RNScrollView style={[...styles, ...style]} {...props}>
			{children}
		</RNScrollView>
	);
};
