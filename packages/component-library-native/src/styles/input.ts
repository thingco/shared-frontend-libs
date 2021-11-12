import type { ThemeColour, ThemeFontSize } from "./defaultTheme";
export const inputStyles = (colours: ThemeColour, fontSize: ThemeFontSize) => ({
	primary: {
		backgroundColor: colours.accent,
		borderWidth: 0,
		borderRadius: 2,
		paddingHorizontal: 15,
		paddingVertical: 15,
		color: colours.text_accent,
		...fontSize.large,
	},
	secondary: {
		borderWidth: 0,
		borderBottomWidth: 1,
		borderBottomColor: colours.text_appBackground,
		borderRadius: 2,
		paddingHorizontal: 5,
		paddingTop: 10,
		paddingBottom: 5,
		color: colours.text_appBackground,
		...fontSize.base,
	},
	focused: {
		backgroundColor: colours.primary,
	},
	cell: {
		height: 40,
		width: 40,
		marginHorizontal: 5,
		justifyContent: "center" as const,
		alignItems: "center" as const,
	},
	cellText: {
		lineHeight: 32,
		fontSize: 28,
		fontWeight: "500" as const,
		color: colours.text_accent,
		textAlign: "center" as const,
		textAlignVertical: "center" as const,
		backgroundColor: "transparent",
	},
	box: {
		backgroundColor: colours.accent,
		borderWidth: 3,
	},
	underline: {
		borderLeftWidth: 0,
		borderRightWidth: 0,
		borderTopWidth: 0,
		borderBottomWidth: 2,
	},
	number: {
		fontWeight: "800" as const,
	},
	light: {
		color: colours.greyscale50,
	},
	dark: {
		color: colours.greyscale900,
		borderBottomColor: colours.greyscale900,
	},
});

export type ThemeInput = ReturnType<typeof inputStyles>;
