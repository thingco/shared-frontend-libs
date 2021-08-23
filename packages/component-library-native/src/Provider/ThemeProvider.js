import React from "react";
import { buildTheme } from "../theme";
const ThemeContext = React.createContext({ theme: null, setTheme: null });
const themeReducer = (state, update) => {
    return buildTheme({ ...update });
};
export const ThemeProvider = ({ themeOverride = {}, children, }) => {
    const initialTheme = buildTheme(themeOverride);
    const [theme, setTheme] = React.useReducer(themeReducer, initialTheme);
    return React.createElement(ThemeContext.Provider, { value: { theme, setTheme } }, children);
};
export function useTheme() {
    const { theme, setTheme } = React.useContext(ThemeContext);
    if (!ThemeContext) {
        throw new Error("Theme context can only be accessed from within the ThemeContext.Provider");
    }
    return { theme, setTheme };
}
//# sourceMappingURL=ThemeProvider.js.map