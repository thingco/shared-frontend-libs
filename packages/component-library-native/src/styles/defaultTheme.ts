import { Dimensions } from "react-native";

const width = Dimensions.get("window").width;

export const colours = {
	appBackground: "#003d52",
	appNav: "#002a38",
	appNavFocus: "#7bd1c6",
	appNavInactive: "#daf2ef",
	background: "#f5f6fa",
	tint: "#f5f6fa",
	primary: "#35988b",
	secondary: "#0f3047",
	accent: "#7bd1c6",
	primaryMuted: "#143935",
	secondaryMuted: "#000000",
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
	text_accent: "#101010",
	text_appBackground: "#f0f0f0",
	text_background: "#000000",
	text_primary: "#f0f0f0",
	text_secondary: "#f0f0f0",
	errorLight: "#C73E1D",
	errorDark: "#F18F01",
	accentSecondary: "#73b4e2",
	appSuccess: "hsl(109, 58%, 47%)",
	appError: "hsl(356, 59%, 40%)",
	appErrorLight: "hsl(41, 59%, 40%)",
	appGauge: "#eaeaea",
	text_appNav: "#f0f0f0",
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
