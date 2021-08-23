import { buttonStyles, buttonText, carouselStyles, colours as defaultColours, fontSizes, inputStyles, inputText, spacing as defaultSpacing, text, viewStyles, } from "./styles";
export const buildTheme = ({ colors = defaultColours, spacing = defaultSpacing, }) => ({
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
//# sourceMappingURL=theme.js.map