import { useTheme } from "../../Provider/ThemeProvider";
import { StackHeaderOptions } from "@react-navigation/stack/lib/typescript/src/types";

// TODO: Add variants ?

export const NavBar = ({ headerLeft, headerRight, ...props }: StackHeaderOptions) => {
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
