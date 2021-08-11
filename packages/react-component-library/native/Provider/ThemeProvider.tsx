import React from "react";

import { Theme, buildTheme } from "../theme";

const ThemeContext = React.createContext<{
	theme: any;
	setTheme: any;
}>({ theme: null, setTheme: null });

interface ThemeProviderProps {
	themeOverride?: Theme;
	children: React.ReactElement;
}

const themeReducer = (state, update) => {
	return buildTheme({ ...update });
};

export const ThemeProvider = ({
	themeOverride = {},
	children,
}: ThemeProviderProps): JSX.Element => {
	const initialTheme = buildTheme(themeOverride);
	const [theme, setTheme] = React.useReducer(themeReducer, initialTheme);
	return (
		<ThemeContext.Provider value={{ theme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};

export function useTheme(): { theme: Theme; setTheme: any } {
	const { theme, setTheme } = React.useContext(ThemeContext);
	if (!ThemeContext) {
		throw new Error(
			"Theme context can only be accessed from within the ThemeContext.Provider"
		);
	}

	return { theme, setTheme };
}
