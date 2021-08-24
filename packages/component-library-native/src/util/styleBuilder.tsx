export type variantProps = {
	component: "button" | "text" | "textentry" | "view" | "input" | "label" | "carousel" | "hint";
	styles: string;
};
import { useTheme } from "../Provider/ThemeProvider";

export const variantToTheme = ({ component, styles }: variantProps): any[] => {
	const { theme } = useTheme();
	const themeWorkAround = theme as any;
	const variants = styles.split(" ");
	const variantStyles: any[] = [];
	const themeRef =
		component === "button"
			? (theme.buttons as any)
			: component === "text"
			? (theme.typography as any)
			: component === "view"
			? (theme.views as any)
			: component === "input"
			? (theme.inputs as any)
			: component === "carousel"
			? (theme.carousel as any)
			: component === "label" && (theme.typography?.inputs as any);
	variants.map((v) => {
		if (themeRef[v]) {
			variantStyles.push(themeRef[v]);
		} else if ((component === "text" || component === "label") && themeRef.fontSize[v]) {
			variantStyles.push(themeRef?.fontSize[v]);
		} else if (component === "text" && themeRef?.buttons[v]) {
			variantStyles.push(themeRef?.buttons[v]);
		} else if (themeWorkAround.colors[v]) {
			if (component === "text") {
				variantStyles.push({ color: themeWorkAround.colors[v] });
			} else {
				variantStyles.push({ backgroundColor: themeWorkAround.colors[v] });
			}
		} else if (themeWorkAround.spacing[v]) {
			variantStyles.push(themeWorkAround.spacing[v]);
		} else if (v != "") {
			console.warn("No style found for variant:", v, " in ", component);
		}
	});
	return variantStyles;
};
