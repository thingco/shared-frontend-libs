import type { ThemeColour, ThemeFontSize } from "./defaultTheme";
export const buttonText = (colours: ThemeColour, fontSizes: ThemeFontSize) => ({
	primary: {
		...fontSizes.large,
		fontWeight: "700" as const,
		color: colours.text_primary,
	},
	secondary: {
		...fontSizes.base,
		fontWeight: "600" as const,
		color: colours.text_secondary,
	},
	tertiary: {
		...fontSizes.base,
		fontWeight: "500" as const,
		color: colours.text_appBackground,
	},
	standalone: {
		...fontSizes.base,
		fontWeight: "400" as const,
		color: colours.text_appBackground,
	},
	menu: {
		...fontSizes.large,
		fontWeight: "400" as const,
		color: colours.text_appBackground,
		marginLeft: 10,
	},
	disabled: {
		opacity: 0.5,
	},
	tab: {
		textAlign: "center" as const,
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
		fontWeight: "800" as const,
	},
	heading: {
		...fontSizes.xlarge,
		fontWeight: "600" as const,
	},
	subheading: {
		...fontSizes.large,
	},
	body: {
		fontWeight: "400" as const,
		...fontSizes.base,
	},
	bodyHeavy: {
		fontWeight: "600" as const,
		...fontSizes.base,
	},
	desc: {
		fontWeight: "400" as const,
		...fontSizes.small,
	},
	hintSymbol: {
		color: colours.appBackground,
		fontWeight: "500" as const,
		textAlign: "center" as const,
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
		fontWeight: "700" as const,
	},
	heavy: {
		fontWeight: "600" as const,
	},
	light: {
		fontWeight: "200" as const,
	},
	centred: {
		textAlign: "center" as const,
	},
});

export type ThemeText = ReturnType<typeof text>;
