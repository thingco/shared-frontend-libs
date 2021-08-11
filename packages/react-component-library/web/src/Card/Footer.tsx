import React from "react";
import { Flex, FlexProps, ThemeUIStyleObject } from "theme-ui";

export interface CardFooterProps extends FlexProps {
	children?: React.ReactNode;
	sx?: ThemeUIStyleObject;
}

/**
 * @param root0
 * @param root0.children
 * @param root0.sx
 * @visibleName Card.Footer
 */
export const Footer = ({ children, sx = {} }: CardFooterProps): JSX.Element => (
	<Flex as="footer" sx={{ pt: "base", ...sx }}>
		{children}
	</Flex>
);
