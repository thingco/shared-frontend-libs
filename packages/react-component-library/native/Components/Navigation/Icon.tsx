import React from "react";
import { ImageStyle } from "react-native";
import { Image } from "react-native";

interface IconProps {
	icon: "account" | "progress" | "close" | "back";
	style?: ImageStyle;
}

export const Icons = {
	ACCOUNT: "account",
	PROGRESS: "progress",
	CLOSE: "close",
	BACK: "back",
};

export const Icon = ({ icon, style = {} }: IconProps) => {
	const getIconSource = (icon) => {
		switch (icon) {
			case Icons.ACCOUNT:
				return require("./icon_nav_account.png");
			case Icons.PROGRESS:
				return require("./icon_nav_progress.png");
			case Icons.CLOSE:
				return require("./icon_nav_close.png");
			case Icons.BACK:
				return require("./icon_nav_back.png");
		}
		return null;
	};

	return <Image source={getIconSource(icon)} style={style} />;
};
