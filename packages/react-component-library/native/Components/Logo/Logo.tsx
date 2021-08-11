import React from "react";
import { View, Dimensions, Image } from "react-native";
import { Logo as TheoLogo } from "../../../assets/Logo";

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
			{/* <Image
				resizeMethod="scale"
				resizeMode="contain"
				source={require("./logo.png")}
			/> */}
		</View>
	</View>
);
