import React from "react";
import { TextStyle, TouchableOpacity, ViewStyle, Text, TouchableOpacityProps } from "react-native";
/* eslint-disable react/prop-types */

// interface ButtonProps extends TouchableOpacityProps {
// 	children?: React.ReactElement | string;
// 	isDisabled?: boolean;
// 	variant?: string;
// 	style?: ViewStyle[] | ViewStyle;
// 	textStyle?: TextStyle[] | TextStyle;
// }

export const Button = ({
	children,
	// variant = "",
	isDisabled = false,
	style = [],
	textStyle = [],
	...props
}) => {
	const custStyle = style instanceof Array ? style : [style];
	const custTextStyle = textStyle instanceof Array ? textStyle : [textStyle];

	return (
		<TouchableOpacity
			style={[
				{
					borderRadius: 10,
					height: 50,
					padding: 5,
					marginVertical: 5,
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: "#199a8d",
					borderColor: "#199a8d",
				},
				isDisabled && {
					opacity: 0.5,
				},
				...custStyle,
			]}
			disabled={isDisabled}
			{...props}
		>
			<Text
				style={[
					{
						fontSize: 18,
						lineHeight: 22,
						fontWeight: "700",
						color: "#ffffff",
					},
					isDisabled && {
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
