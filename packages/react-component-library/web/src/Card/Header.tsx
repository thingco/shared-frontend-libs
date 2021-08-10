import React from "react";
import { Flex, FlexProps, ThemeUIStyleObject } from "theme-ui";

export interface CardHeaderProps extends FlexProps {
	children?: React.ReactNode;
	sx?: ThemeUIStyleObject;
}

/**
 * @param root0
 * @param root0.children
 * @param root0.sx
 * @visibleName Card.Header
 */
export const Header = ({ children, sx = {} }: CardHeaderProps): JSX.Element => (
	<Flex as="header" sx={{ pb: "base", ...sx }}>
		{children}
	</Flex>
);
