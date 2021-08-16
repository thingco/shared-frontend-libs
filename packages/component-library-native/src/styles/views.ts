import type { ThemeColour } from "./defaultTheme";

export const viewStyles = (colours: ThemeColour) => ({
	card: {
		paddingHorizontal: 20,
		paddingVertical: 10,
		backgroundColor: colours.greyscale50,
		borderRadius: 5,
		height: "auto",
		shadowOffset: {
			width: 10,
			height: 10,
		},
		shadowOpacity: 0.51,
		shadowRadius: 13.16,
		elevation: 20,
		minHeight: 80,
		marginVertical: 5,
	},
	container: {
		paddingHorizontal: 20,
		backgroundColor: colours.appBackground,
		height: "100%",
	},
	pill: {
		marginTop: 10,
		minHeight: 40,
		paddingHorizontal: 20,
		borderRadius: 15,
		backgroundColor: colours.errorDark,
		width: "100%",
		paddingVertical: 5,
		justifyContent: "center",
		alignItems: "center",
	},
	halfModal: {
		borderRadius: 5,
		backgroundColor: colours.secondary,
		marginHorizontal: 15,
		alignItems: "center",
		padding: 20,
	},
	hint: {
		backgroundColor: colours.greyscale50,
		width: 14,
		height: 14,
		borderRadius: 7,
		justifyContent: "center",
		alignItems: "center",
	},
	error: {
		backgroundColor: colours.errorLight,
		width: 14,
		height: 14,
		borderRadius: 7,
		justifyContent: "center",
		alignItems: "center",
	},
	centred: {
		justifyContent: "center",
		alignItems: "center",
	},
	flexCol: {
		flexDirection: "column",
	},
	flexColReverse: {
		flexDirection: "column-reverse",
	},
	flexRow: {
		flexDirection: "row",
	},
	flexRowReverse: {
		flexDirection: "row-reverse",
	},
	spaceBetween: {
		justifyContent: "space-between",
	},
	rightAlign: {
		flexDirection: "row",
		justifyContent: "flex-end",
	},
});

export type ThemeView = ReturnType<typeof viewStyles>;
