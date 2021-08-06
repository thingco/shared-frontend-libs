import React from "react";
import { TextStyle, TouchableOpacity, ViewStyle, Text, TouchableOpacityProps } from "react-native";

interface ButtonProps extends TouchableOpacityProps {
	children?: React.ReactElement | string;
	isDisabled?: boolean;
	variant?: string;
	style?: ViewStyle[] | ViewStyle;
	textStyle?: TextStyle[] | TextStyle;
}

export const Button = ({
	children,
	// variant = "",
	isDisabled = false,
	style = [],
	textStyle = [],
	...props
}: ButtonProps) => {
	const custStyle = style instanceof Array ? style : [style];
	const custTextStyle = textStyle instanceof Array ? textStyle : [textStyle];

	return (
		<TouchableOpacity
			style={[
				isDisabled && {
					borderRadius: 10,
					height: 50,
					padding: 5,
					marginVertical: 5,
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: "#199a8d",
					borderColor: "#199a8d",
				},
				...custStyle,
			]}
			disabled={isDisabled}
			{...props}
		>
			<Text
				style={[
					isDisabled && {
						borderRadius: 10,
						height: 50,
						padding: 5,
						marginVertical: 5,
						justifyContent: "center",
						alignItems: "center",
						backgroundColor: "#199a8d",
						borderColor: "#199a8d",
						opacity: 0.5,
					},
					...custTextStyle,
				]}
			>
				{children}
			</Text>
		</TouchableOpacity>
	);
};
