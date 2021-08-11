import { Theme } from "theme-ui";

const defaults = {
	buttons: {
		bg: "primary",
		borderRadius: 0,
		color: "background",
		fontWeight: "body",
		px: "large",
		py: "base",
		"&:hover, &:focus": {
			bg: "accent",
		},
		"&:active": {
			bg: "primary",
		},
	},
	cards: {
		bg: "highlight",
		borderRadius: "0.25rem",
		boxShadow: `0 0 8px rgba(0, 0, 0, 0.125)`,
		padding: "base",
	},
	text: {
		fontSize: "base",
		fontFamily: "body",
		fontWeight: "body",
		lineHeight: "body",
	},
};

export const defaultTheme: Theme = {
	colors: {
		// TODO Recommended initial setup, tweak from this:
		text: "hsl(224, 13%, 22%)",
		background: "hsl(228, 33%, 97%)",
		primary: "hsl(220, 65%, 51%)",
		secondary: "hsl(229, 37%, 14%)",
		accent: "hsl(220, 65%, 60%)",
		highlight: "hsl(0, 0%, 100%)",
		muted: "hsl(230, 14%, 50%)",
		// Original, this needs replacing with the above + extras like warning colours:
		warn_1: "hsl(356, 59%, 40%)",
		warn_2: "hsl(35, 67%, 52%)",
		warn_3: "hsl(50, 84%, 67%)",
		gauge_low: "hsl(35, 67%, 52%)",
		gauge_medium: "hsl(50, 84%, 67%)",
		gauge_high: "hsl(220, 65%, 57%)",
		gauge_background: "hsl(195, 16%, 90%)",
	},
	fonts: {
		heading: `"Poppins", BlinkMacSystemFont, -apple-system, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", "Helvetica", "Arial", sans-serif;`,
		body: `"Poppins", BlinkMacSystemFont, -apple-system, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", "Helvetica", "Arial", sans-serif;`,
	},
	fontSizes: {
		xxxsmall: "0.5rem", // 8
		xxsmall: "0.625rem", //  10
		xsmall: "0.75rem", //  12
		small: "0.875rem", //  14
		base: "1rem", //  16
		large: "1.125rem", //  18
		xlarge: "1.25rem", //  20
		xxlarge: "1.5rem", //  24
		huge: "3rem", //  48
	},
	fontWeights: {
		body: 400,
		heading: 700,
		bold: 700,
		light: 200,
	},
	lineHeights: {
		body: 1.5,
		heading: 1.125,
	},
	space: {
		xxsmall: "0.25rem",
		xsmall: "0.5rem",
		small: "0.75rem",
		base: "1rem",
		large: "1.25rem",
		xlarge: "1.5rem",
		xxlarge: "1.75rem",
		xxxlarge: "2rem",
		huge: "3rem",
	},
	/* Component Variants */
	buttons: {
		primary: { ...defaults.buttons },
		primarySmall: {
			...defaults.buttons,
			fontSize: "small",
			py: "small",
		},
		primaryLarge: {
			...defaults.buttons,
			py: "large",
		},
		login: {
			...defaults.buttons,
			"&:active": {
				outline: "5px auto background",
			},
		},
		search: {
			...defaults.buttons,
			py: 0,
			alignItems: "center",
			minWidth: "182px",
			fontSize: "small",
		},
		delete: {
			height: "30px",
			lineHeight: "30px",
			width: "30px",
			backgroundColor: "warn_1",
			color: "background",
			"&:hover": {
				bg: "accent",
			},
			py: 0,
		},
		create: {
			height: "30px",
			lineHeight: "30px",
			width: "30px",
			backgroundColor: "primary",
			color: "background",
			"&:hover": {
				bg: "accent",
			},
			py: 0,
		},
	},
	cards: {
		primary: { ...defaults.cards },
		transparent: {
			bg: "transparent",
			padding: "base",
		},
		transparentCentred: {
			alignItems: "center",
			bg: "transparent",
			display: "flex",
			justifyContent: "center",
			padding: "base",
		},
		nopad: {
			bg: "highlight",
			borderRadius: "0.25rem",
			boxShadow: `0 0 8px rgba(0, 0, 0, 0.125)`,
			overflow: "hidden",
		},
	},
	forms: {
		label: {
			fontWeight: "bold",
			fontSize: "large",
			fontFamily: "body",
		},
		smallLabel: {
			fontWeight: "body",
			fontSize: "small",
			fontFamily: "body",
			color: "muted",
		},
		input: {
			bg: "highlight",
			border: 0,
		},
		formEntry: {
			border: "none",
			borderBottom: "1px solid black",
			borderRadius: 0,
			outline: "none",
			"&:focus": {
				borderColor: "primary",
			},
		},
		search: {
			px: "xxxlarge",
			bg: "highlight",
			border: 0,
		},
		login: {
			px: "base",
			py: "large",
			borderRadius: "0.25rem",
			bg: "background",
			color: "text",
		},
	},
	links: {
		nav: {
			color: "highlight",
			cursor: "pointer",
			fontSize: "large",
			fontWeight: "light",
			p: "xsmall",
			textDecoration: "none",
			"&:hover, &:focus": {
				color: "accent",
			},
		},
		navCurrent: {
			color: "accent",
			fontSize: "large",
			fontWeight: "bold",
			p: "xsmall",
			textDecoration: "none",
		},
		body: {
			cursor: "pointer",
			pl: 0,
			color: "text",
			textDecoration: "underline",
			"&:hover, &:focus": {
				color: "primary",
				textDecoration: "none",
			},
		},
	},
	text: {
		boldMuted: {
			color: "muted",
			fontWeight: "bold",
			fontSize: "large",
		},
		default: {
			...defaults.text,
		},
		heading: {
			fontFamily: "body",
			fontSize: "xlarge",
			fontWeight: "heading",
			lineHeight: "heading",
		},
		largeBold: {
			fontWeight: "bold",
			fontSize: "xxlarge",
		},
		medBold: {
			fontWeight: "bold",
			fontSize: "large",
		},
		score: {
			fontSize: "xxlarge",
			fontWeight: "bold",
			textAlign: "center",
		},
		scorePercentage: {
			fontSize: "xxlarge",
			fontWeight: "bold",
			textAlign: "center",
			"&::after": {
				content: `"\\2F 100"`,
				fontSize: "0.5em",
				fontWeight: "body",
				display: "inline-block",
			},
		},
		smallMuted: {
			fontSize: "small",
			color: "muted",
		},
		styles: {
			spinner: {
				color: "primary",
			},
		},
	},
};
