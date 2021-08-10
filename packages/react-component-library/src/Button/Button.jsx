import React from "react";
import {
	Button as ThemeUIButton,
	ButtonProps as ThemeUIButtonProps,
	ThemeUIStyleObject,
} from "theme-ui";
/* eslint-disable react/prop-types */

// export interface ButtonProps extends ThemeUIButtonProps {
// 	children?: React.ReactNode;
// 	variant?: string;
// 	sx?: ThemeUIStyleObject;
// 	testid?: string;
// }

export const Button = ({ children, variant = "primary", sx = {}, testid = "Button", ...props }) => (
	<ThemeUIButton data-testid={testid} variant={variant} sx={sx} {...props}>
		{children}
	</ThemeUIButton>
);
