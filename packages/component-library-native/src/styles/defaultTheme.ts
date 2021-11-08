import { Dimensions } from "react-native";

const width = Dimensions.get("window").width;

export const colours = {
	appBackground: "#003d52",
	background: "#f5f6fa",
	tint: "#f5f6fa",
	primary: "#199a8d",
	secondary: "#1b5265",
	accent: "#5783db",
	primaryMuted: "#0f5c55",
	secondaryMuted: "#10313d",
	greyscale50: "#ffffff",
	greyscale100: "#f6f6f6",
	greyscale200: "#eaeaea",
	greyscale300: "#d6d6d6",
	greyscale400: "#bcbcbc",
	greyscale500: "#9b9b9b",
	greyscale600: "#767676",
	greyscale700: "#555555",
	greyscale800: "#3c3c3c",
	greyscale900: "#000000",
	warn_1: "hsl(356, 59%, 40%)",
	warn_2: "hsl(35, 67%, 52%)",
	warn_3: "hsl(50, 84%, 67%)",
	warn_4: "hsl(109, 58%, 47%)",
	text_accent: "#000000",
	text_accent_dark: "#000000",
	text_accent_light: "#000000",
	text_appBackground: "#ffffff",
	text_appBackground_dark: "#9b9b9b",
	text_appBackground_light: "#ffffff",
	text_background: "#000000",
	text_background_dark: "#000000",
	text_background_light: "#000000",
	text_primary: "#ffffff",
	text_primary_dark: "#000000",
	text_primary_light: "#ffffff",
	text_secondary: "#199a8d",
	text_secondary_dark: "#9b9b9b",
	text_secondary_light: "#ffffff",
	errorLight: "#EB421A",
	errorDark: "#F18F01",
};

export type ThemeColour = Partial<typeof colours>;

export const fontSizes = {
	xxxsmall: {
		fontSize: width / 50,
		lineHeight: width / 40,
	},
	xxsmall: {
		fontSize: width / 40,
		lineHeight: width / 32,
	},
	xsmall: {
		fontSize: width / 32,
		lineHeight: width / 25.6,
	},
	small: {
		fontSize: width / 28,
		lineHeight: width / 22.4,
	},
	base: {
		fontSize: width / 25,
		lineHeight: width / 20,
	},
	large: {
		fontSize: width / 22.5,
		lineHeight: width / 18,
	},
	xlarge: {
		fontSize: width / 20,
		lineHeight: width / 16,
	},
	xxlarge: {
		fontSize: width / 18,
		lineHeight: width / 14.4,
	},
	xxxlarge: {
		fontSize: width / 16.5,
		lineHeight: width / 13.2,
	},
	huge: {
		fontSize: width / 15,
		lineHeight: width / 12,
	},
};

export type ThemeFontSize = Partial<typeof fontSizes>;

export const spacing = {
	mx0: {
		marginHorizontal: 0,
	},
	mx5: {
		marginHorizontal: 5,
	},
	mx10: {
		marginHorizontal: 10,
	},
	mx15: {
		marginHorizontal: 15,
	},
	mx20: {
		marginHorizontal: 20,
	},
	my0: {
		marginVertical: 0,
	},
	my5: {
		marginVertical: 5,
	},
	my10: {
		marginVertical: 10,
	},
	my15: {
		marginVertical: 15,
	},
	my20: {
		marginVertical: 20,
	},
	px0: {
		paddingHorizontal: 0,
	},
	px5: {
		paddingHorizontal: 5,
	},
	px10: {
		paddingHorizontal: 10,
	},
	px15: {
		paddingHorizontal: 15,
	},
	px20: {
		paddingHorizontal: 20,
	},
	py0: {
		paddingVertical: 0,
	},
	py5: {
		paddingVertical: 5,
	},
	py10: {
		paddingVertical: 10,
	},
	py15: {
		paddingVertical: 15,
	},
	py20: {
		paddingVertical: 20,
	},
};
export type ThemeSpacing = Partial<typeof spacing>;
