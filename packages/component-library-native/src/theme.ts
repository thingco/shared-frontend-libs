import {
	colours as defaultColours,
	buttonStyles,
	buttonText,
	inputStyles,
	inputText,
	text,
	spacing as defaultSpacing,
	viewStyles,
	carouselStyles,
} from "./styles";

export interface Theme {
	spacing?: any;
	colors?: any;
	buttons?: any;
	inputs?: any;
	typography?: any;
	textentry?: any;
	views?: any;
	carousel?: any;
}

interface ThemeProps {
	colors?: any;
	spacing?: any;
}

export const buildTheme = ({
	colors = defaultColours,
	spacing = defaultSpacing,
}: ThemeProps) => ({
	colors: colors,
	spacing: spacing,
	buttons: buttonStyles(colors, spacing),
	inputs: inputStyles(colors, spacing),
	typography: {
		buttons: buttonText(colors, spacing.fontSizes),
		input: inputText(colors, spacing.fontSizes),
		fontSize: spacing.fontSizes,
		...text(colors, spacing.fontSizes),
	},
	views: viewStyles(colors, spacing),
	carousel: carouselStyles(colors, spacing),
});
