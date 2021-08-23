import { useTheme } from "../../Provider/ThemeProvider";
// TODO: Add variants ?
export const NavBar = ({ headerLeft, headerRight, ...props }) => {
    const { theme } = useTheme();
    return {
        headerStyle: {
            backgroundColor: theme.colors?.appBackground,
        },
        headerTintColor: theme.colors?.text_appBackground,
        headerLeft: () => headerLeft,
        headerRight: () => headerRight,
        ...props,
    };
};
//# sourceMappingURL=NavBar.js.map