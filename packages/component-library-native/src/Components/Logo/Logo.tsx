import React from "react";
import { View, Dimensions } from "react-native";
import { TheoLogo } from "./TheoLogo";

const LOGO_ASPECT_RATIO = 0.25;
const LOGO_TARGET_WIDTH = 0.5; //% of screen width the logo should be
const { width: WINDOW_WIDTH } = Dimensions.get("window");

export const Logo = () => (
	<View style={{ alignItems: "center", marginVertical: 10 }}>
		<View
			style={{
				alignItems: "center",
				width: WINDOW_WIDTH * LOGO_TARGET_WIDTH,
				height: WINDOW_WIDTH * LOGO_TARGET_WIDTH * LOGO_ASPECT_RATIO,
			}}
		>
			<TheoLogo />
		</View>
	</View>
);
