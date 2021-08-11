import React from "react";

import { TouchableOpacity, TouchableOpacityProps, View } from "react-native";
import { Icon } from "./Icon";

interface ButtonProps extends TouchableOpacityProps {
	icon: "account" | "progress" | "close" | "back";
}

export const NavBarIconButton = ({ icon, ...props }: ButtonProps) => {
	return (
		<TouchableOpacity
			style={{
				flex: 1,
				display: "flex",
				flexDirection: "row",
				alignItems: "center",
				justifyContent: "center",
				padding: 20,
				opacity: props.disabled ? 0.5 : 1,
				width: 52,
			}}
			{...props}
		>
			<View
				style={{
					alignItems: "center",
				}}
			>
				<Icon icon={icon} />
			</View>
		</TouchableOpacity>
	);
};
