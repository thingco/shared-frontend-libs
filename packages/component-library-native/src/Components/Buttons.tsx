import React from "react";
import { TextStyle, TouchableOpacity, ViewStyle, Text, TouchableOpacityProps } from "react-native";

import { useTheme } from "../Provider/ThemeProvider";
import { variantToTheme } from "../util";
import { IconType, LineIcon } from "./Icons";

interface ButtonProps extends TouchableOpacityProps {
	children?: React.ReactNode;
	isDisabled?: boolean;
	variant?: string;
	style?: ViewStyle[] | ViewStyle;
	textStyle?: TextStyle[] | TextStyle;
}

export const Button = ({
	children,
	variant = "",
	isDisabled = false,
	style = [],
	textStyle = [],
	...props
}: ButtonProps) => {
	const { theme } = useTheme();

	const custStyle = style instanceof Array ? style : [style];
	const custTextStyle = textStyle instanceof Array ? textStyle : [textStyle];

	const textStyles: any[] = variantToTheme({
		component: "text",
		styles: variant,
	});
	const buttonStyles: any[] = variantToTheme({
		component: "button",
		styles: variant,
	});

	return (
		<TouchableOpacity
			style={[...buttonStyles, isDisabled && theme.buttons.disabled, ...custStyle]}
			disabled={isDisabled}
			{...props}
		>
			<Text
				style={[...textStyles, isDisabled && theme.typography.buttons.disabled, ...custTextStyle]}
			>
				{children}
			</Text>
		</TouchableOpacity>
	);
};

interface IconButtonProps extends TouchableOpacityProps {
	isDisabled?: boolean;
	style?: ViewStyle[] | ViewStyle;
	icon: IconType;
	size: number | string;
	stroke: string;
	strokeWidth?: number;
}

export const IconButton = ({
	isDisabled = false,
	style = {},
	icon,
	stroke,
	// strokeWidth = 2,
	size,
	...props
}: IconButtonProps) => {
	const custStyle = style instanceof Array ? style : [style];
	return (
		<TouchableOpacity style={[...custStyle]} disabled={isDisabled} {...props}>
			<LineIcon iconType={icon} stroke={stroke} size={size} />
		</TouchableOpacity>
	);
};

interface TabButtonProps {
	selected: boolean;
	onClick: () => void;
	children: React.ReactNode[];
}

export const TabButton = ({ selected, onClick, children }: TabButtonProps) => {
	const { theme } = useTheme();
	return (
		<Button
			variant={"tab"}
			style={selected ? theme.buttons.tabSelected : {}}
			textStyle={selected ? theme.typography.bold : theme.typography.body}
			onPress={onClick}
			activeOpacity={1}
		>
			{children}
		</Button>
	);
};
