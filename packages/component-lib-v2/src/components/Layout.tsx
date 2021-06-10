import { styled } from "../config";

/**
 * The app screen is normally always going to be 100% height. It's a dashboard, we don't want users to
 * scroll the page.
 *
 * TODO however we may need to allow it some cases, so add a variant.
 */
export const AppScreen = styled("div", {
	backgroundColor: "$mid",
	color: "$dark",
	display: "flex",
	flexDirection: "column",
	alignItems: "stretch",
	height: "100vh",
	width: "100%",
});

/**
 * The control bar: nav, config popup links, branding etc. Currently horizontal across top of screen.
 *
 * TODO might want it vertical tbqh, which allows for a more natural drawer-like slideout behaviour.
 */
export const AppControlBar = styled("header", {
	backgroundColor: "$dark",
	color: "$light",
	flex: 0,
	padding: "$full calc($full + $half)",
});

export const AppDashboard = styled("main", {
	backgroundColor: "$light",
	flex: 1,
	display: "grid",
	gridTemplateColumns: "repeat(6, 1fr)",
	gap: "$half",
	padding: "$half",
});

export const Stack = styled("div", {
	display: "grid",
	gridTemplateColumns: "100%",
	gridAutoRows: "min-content",
	rowGap: "$half",
});

export const Box = styled("div", {});

export const FlexBox = styled("div", {
	display: "flex",
});
