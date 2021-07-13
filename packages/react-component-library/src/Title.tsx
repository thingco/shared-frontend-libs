import React from "react";
import { Heading, HeadingProps, ThemeUIStyleObject } from "theme-ui";

export interface TitleProps extends HeadingProps {
	children?: React.ReactNode;
	sx?: ThemeUIStyleObject;
	variant?: string;
	as?: React.ElementType;
}

export const Title = ({
	children,
	variant = "heading",
	sx = {},
	as = "h2",
}: TitleProps): JSX.Element => (
	<Heading as={as} variant={variant} sx={sx}>
		{children}
	</Heading>
);
