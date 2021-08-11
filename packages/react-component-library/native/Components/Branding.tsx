import React from "react";
import { ViewStyle } from "react-native";
import { View } from "./Containers";
import { variantToTheme } from "../util";

interface LogoProps {
	Logo: React.ComponentType<any>;
	variant?: string;
	style?: ViewStyle | ViewStyle[];
}

export const Branding = ({ Logo, variant = "", style = [] }: LogoProps) => {
	const styles: any[] = variantToTheme({ component: "view", styles: variant });
	style = style instanceof Array ? style : [style];
	return (
		<View variant="mx20 my20" style={[...styles, ...style]}>
			<Logo />
		</View>
	);
};
