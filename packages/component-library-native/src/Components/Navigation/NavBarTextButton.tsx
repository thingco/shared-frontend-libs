import React from "react";

import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { Text } from "../Typography";

interface NavBarTextButtonProps extends TouchableOpacityProps {
	text: string;
}

export const NavBarTextButton = ({ text, ...props }: NavBarTextButtonProps) => {
	return (
		<TouchableOpacity
			style={{
				flex: 1,
				display: "flex",
				flexDirection: "row",
				alignItems: "center",
				justifyContent: "center",
				opacity: props.disabled ? 0.5 : 1,
				marginHorizontal: 20,
			}}
			{...props}
		>
			<Text variant="small bold text_accent">{text}</Text>
		</TouchableOpacity>
	);
};
