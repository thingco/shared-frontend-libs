import mocktheme from "../theme";
import { variantToTheme } from "./";

jest.mock("../ThemeProvider", () => ({
	useTheme: () => ({
		theme: mocktheme,
		setTheme: () => {},
	}),
}));

describe("styleBuilder utility library", () => {
	it("can return the correct button style", () => {
		const styles = variantToTheme({ component: "button", styles: "primary" });
		expect(styles).toEqual([mocktheme.buttons.primary]);
	});

	it("can return the correct view style", () => {
		const styles = variantToTheme({ component: "view", styles: "card" });
		expect(styles).toEqual([mocktheme.views.card]);
	});

	it("can return the correct text style", () => {
		const styles = variantToTheme({ component: "text", styles: "heading" });
		expect(styles).toEqual([mocktheme.typography.heading]);
	});

	it("can access button text styles", () => {
		const styles = variantToTheme({ component: "text", styles: "primary" });
		expect(styles).toEqual([mocktheme.typography.buttons.primary]);
	});

	it("can combine multiple styles", () => {
		const styles = variantToTheme({
			component: "text",
			styles: "heading bold",
		});
		expect(styles).toEqual([
			mocktheme.typography.heading,
			mocktheme.typography.bold,
		]);
	});

	it("returns an empty array if no styles passed", () => {
		const styles = variantToTheme({
			component: "text",
			styles: "",
		});
		expect(styles).toEqual([]);
	});
});
