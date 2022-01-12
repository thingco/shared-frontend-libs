import React from "react";
import { Box, BoxProps, ThemeUIStyleObject, useThemeUI } from "theme-ui";

import { DefinitionListDescProps, Desc } from "./DescriptionList/Desc";
import { DefinitionListItemProps, Item } from "./DescriptionList/Item";
import { DefinitionListTitleProps, Title } from "./DescriptionList/Title";

export interface IDescription {
	Title: React.FC<DefinitionListTitleProps>;
	Desc: React.FC<DefinitionListDescProps>;
	Item: React.FC<DefinitionListItemProps>;
}

interface DLProps extends BoxProps {
	children?: React.ReactNode;
	columns?: number;
	sx?: ThemeUIStyleObject;
}
export const DescriptionList = ({ children, columns = 1, sx = {} }: DLProps): JSX.Element => {
	const { theme } = useThemeUI();

	return (
		<Box
			as="dl"
			sx={{
				columnCount: columns,
				columnGap: "3rem",
				columnWidth: "auto",
				columnRuleWidth: "1px",
				columnRuleStyle: "solid",
				columnRuleColor: "hsl(195, 16%, 90%)",
				fontSize: "small",
				pt: "xsmall",
				...sx,
			}}
		>
			{children}
		</Box>
	);
};

DescriptionList.Title = Title;
DescriptionList.Desc = Desc;
DescriptionList.Item = Item;
