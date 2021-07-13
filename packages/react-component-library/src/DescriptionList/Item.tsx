import React from "react";
import { Box, BoxProps, ThemeUIStyleObject } from "theme-ui";

import { Desc } from "./Desc";
import { Title } from "./Title";

export interface DefinitionListItemProps extends BoxProps {
	title: string;
	children?: React.ReactNode;
	testid?: string;
	sx?: ThemeUIStyleObject;
}

export const Item = ({
	title,
	children,
	testid,
	sx = {},
}: DefinitionListItemProps): JSX.Element => (
	<Box data-testid={testid} sx={{ breakInside: "avoid", ...sx }}>
		<Title>{title}</Title>
		<Desc>{children}</Desc>
	</Box>
);
