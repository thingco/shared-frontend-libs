import type { ThemeColour, ThemeFontSize } from "./defaultTheme";
export const buttonText = (colours: ThemeColour, fontSizes: ThemeFontSize) => ({
	primary: {
		...fontSizes.large,
		fontWeight: "700",
		color: colours.text_primary,
	},
	secondary: {
		...fontSizes.base,
		fontWeight: "600",
		color: colours.text_secondary,
	},
	tertiary: {
		...fontSizes.base,
		fontWeight: "500",
		color: colours.text_appBackground,
	},
	standalone: {
		...fontSizes.base,
		fontWeight: "400",
		color: colours.text_appBackground,
	},
	menu: {
		...fontSizes.large,
		fontWeight: "400",
		color: colours.text_appBackground,
	},
	disabled: {
		opacity: 0.5,
	},
	tab: {
		textAlign: "center",
		...fontSizes.xlarge,
		color: colours.primary,
	},
	label: {
		...fontSizes.small,
		color: colours.text_appBackground,
	},
});

export type ThemeButtonText = ReturnType<typeof buttonText>;

export const inputText = (colours: ThemeColour, fontSizes: ThemeFontSize) => ({
	primary: {
		...fontSizes.large,
		color: colours.text_primary_dark,
		marginTop: 10,
	},
	secondary: {
		...fontSizes.small,
		color: colours.text_secondary_dark,
		marginTop: 5,
	},
	light: {
		color: colours.greyscale50,
	},
	dark: {
		color: colours.greyscale900,
	},
});

export type ThemeInputText = ReturnType<typeof inputText>;

export const text = (colours: ThemeColour, fontSizes: ThemeFontSize) => ({
	huge: {
		...fontSizes.huge,
		fontWeight: "800",
	},
	heading: {
		...fontSizes.xlarge,
		fontWeight: "600",
	},
	subheading: {
		...fontSizes.large,
	},
	body: {
		fontWeight: "400",
		...fontSizes.base,
	},
	bodyHeavy: {
		fontWeight: "600",
		...fontSizes.base,
	},
	desc: {
		fontWeight: "400",
		...fontSizes.small,
	},
	hintSymbol: {
		color: colours.appBackground,
		fontWeight: "500",
		textAlign: "center",
		...fontSizes.xxsmall,
	},
	hint: {
		color: colours.greyscale50,
		...fontSizes.xsmall,
		marginLeft: 5,
	},
	error: {
		color: colours.errorLight,
		...fontSizes.xsmall,
		marginLeft: 5,
	},
	bold: {
		fontWeight: "700",
	},
	heavy: {
		fontWeight: "600",
	},
	light: {
		fontWeight: "200",
	},
	centred: {
		textAlign: "center",
	},
});

export type ThemeText = ReturnType<typeof text>;
