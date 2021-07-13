import React from "react";
import { merge, Theme, ThemeProvider as ThemeUIThemeProvider } from "theme-ui";

import { defaultTheme } from "./defaultTheme";

export interface ThemeProviderProps {
	theme: Theme;
	children: React.ReactNode;
}

export const ThemeProvider = ({ theme = {}, children }: ThemeProviderProps): JSX.Element => (
	<ThemeUIThemeProvider theme={merge(defaultTheme, theme as Theme)}>
		{children}
	</ThemeUIThemeProvider>
);
