import type { ThemeColour } from "./defaultTheme";

export const buttonStyles = (colours: ThemeColour) => ({
	primary: {
		borderRadius: 10,
		minHeight: 50,
		padding: 5,
		marginVertical: 5,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: colours.primary,
		borderColor: colours.primary,
	},
	disabled: {
		opacity: 0.5,
	},
	secondary: {
		borderRadius: 10,
		minHeight: 50,
		marginVertical: 5,
		padding: 5,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "transparent",
		borderColor: colours.primary,
		borderWidth: 1,
	},
	tertiary: {
		borderRadius: 20,
		minHeight: 40,
		marginVertical: 10,
		padding: 5,
		justifyContent: "center",
		alignItems: "center",
		borderColor: colours.accent,
		backgroundColor: "transparent",
		borderWidth: 1,
	},
	standalone: {
		borderRadius: 20,
		minHeight: 40,
		marginVertical: 10,
		padding: 5,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "transparent",
		textDecorationLine: "underline",
		textDecorationColor: colours.accent,
	},
	menu: {
		borderRadius: 20,
		minHeight: 40,
		marginVertical: 10,
		padding: 5,
		backgroundColor: "transparent",
		alignItems: "center",
		flexDirection: "row",
	},
	tab: {
		flex: 1,
		marginVertical: 10,
		paddingVertical: 5,
		justifyContent: "center",
		alignItems: "center",
		alignSelf: "stretch",
	},
	tabSelected: {
		borderBottomColor: colours.primary,
		borderBottomWidth: 6,
		marginBottom: 0,
		paddingBottom: 10,
	},
	checkItem: {
		padding: 16,
	},
	checkItemSelected: {
		backgroundColor: colours.primary,
		padding: 16,
	},
});

export type ThemeButton = ReturnType<typeof buttonStyles>;
