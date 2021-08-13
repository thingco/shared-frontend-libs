export type variantProps = {
	component: "button" | "text" | "textentry" | "view" | "input" | "label" | "carousel" | "hint";
	styles: string;
};
import { useTheme } from "../Provider/ThemeProvider";

export const variantToTheme = ({ component, styles }: variantProps): any[] => {
	const { theme } = useTheme();
	const variants = styles.split(" ");
	const variantStyles: any[] = [];
	const themeRef =
		component === "button"
			? theme.buttons
			: component === "text"
			? theme.typography
			: component === "view"
			? theme.views
			: component === "input"
			? theme.inputs
			: component === "carousel"
			? theme.carousel
			: component === "label" && theme.typography.input;
	variants.map((v) => {
		if (themeRef[v]) {
			variantStyles.push(themeRef[v]);
		} else if ((component === "text" || component === "label") && theme.typography.fontSize[v]) {
			variantStyles.push(themeRef.fontSize[v]);
		} else if (component === "text" && themeRef.buttons[v]) {
			variantStyles.push(themeRef.buttons[v]);
		} else if (theme.colors[v]) {
			if (component === "text") {
				variantStyles.push({ color: theme.colors[v] });
			} else {
				variantStyles.push({ backgroundColor: theme.colors[v] });
			}
		} else if (theme.spacing[v]) {
			variantStyles.push(theme.spacing[v]);
		} else if (v != "") {
			console.warn("No style found for variant:", v, " in ", component);
		}
	});
	return variantStyles;
};
