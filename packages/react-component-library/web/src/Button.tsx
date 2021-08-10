import React from "react";
import {
	Button as ThemeUIButton,
	ButtonProps as ThemeUIButtonProps,
	ThemeUIStyleObject,
} from "theme-ui";

export interface ButtonProps extends ThemeUIButtonProps {
	children?: React.ReactNode;
	variant?: string;
	sx?: ThemeUIStyleObject;
	testid?: string;
}

export const Button = ({
	children,
	variant = "primary",
	sx = {},
	testid = "Button",
	...props
}: ButtonProps): JSX.Element => (
	<ThemeUIButton data-testid={testid} variant={variant} sx={sx} {...props}>
		{children}
	</ThemeUIButton>
);
