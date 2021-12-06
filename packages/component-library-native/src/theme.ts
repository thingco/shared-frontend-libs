import {
	buttonStyles,
	buttonText,
	carouselStyles,
	colours as defaultColours,
	fontSizes,
	inputStyles,
	inputText,
	spacing as defaultSpacing,
	text,
	ThemeCarousel,
	viewStyles,
} from "./styles";

import type {
	ThemeButton,
	ThemeButtonText,
	ThemeColour,
	ThemeFontSize,
	ThemeInput,
	ThemeInputText,
	ThemeSpacing,
	ThemeText,
	ThemeView,
} from "./styles";

export interface Theme {
	spacing?: ThemeSpacing;
	colors?: ThemeColour;
	buttons?: ThemeButton;
	inputs?: ThemeInput;
	typography?: {
		buttons?: ThemeButtonText;
		inputs?: ThemeInputText;
		fontSize?: ThemeFontSize;
		text?: ThemeText;
	};
	views?: ThemeView;
	carousel?: ThemeCarousel;
}

interface ThemeProps {
	colors?: ThemeColour;
	spacing?: ThemeSpacing;
}

export const buildTheme = ({
	colors = defaultColours,
	spacing = defaultSpacing,
}: ThemeProps): Theme => ({
	colors: colors,
	spacing: spacing,
	buttons: buttonStyles(colors),
	inputs: inputStyles(colors, fontSizes),
	typography: {
		buttons: buttonText(colors, fontSizes),
		inputs: inputText(colors, fontSizes),
		fontSize: fontSizes,
		text: text(colors, fontSizes),
	},
	views: viewStyles(colors),
	carousel: carouselStyles(colors),
});
