import React from "react";
import { Box, BoxProps, ThemeUIStyleObject } from "theme-ui";

import { Body } from "./Table/Body";
import { Caption } from "./Table/Caption";
import { Col } from "./Table/Col";
import { Colgroup } from "./Table/Colgroup";
import { CompoundBodyRow } from "./Table/CompoundBodyRow";
import { CompoundHeaderRow } from "./Table/CompoundHeaderRow";
import { DataCell } from "./Table/DataCell";
import { Footer } from "./Table/Footer";
import { Header } from "./Table/Header";
import { HeaderCell } from "./Table/HeaderCell";
import { Row } from "./Table/Row";

export interface TableProps extends BoxProps {
	children?: React.ReactNode;
	sx?: ThemeUIStyleObject;
	testid?: string;
}

export const Table = ({ children, sx = {}, testid = "Table" }: TableProps): JSX.Element => (
	<Box
		as="table"
		data-testid={testid}
		sx={{
			width: "100%",
			padding: "base",
			fontFamily: "body",
			borderSpacing: 0,
			height: "min-content",
			...sx,
		}}
	>
		{children}
	</Box>
);

Table.Body = Body;
Table.Caption = Caption;
Table.Col = Col;
Table.Colgroup = Colgroup;
Table.CompoundBodyRow = CompoundBodyRow;
Table.CompoundHeaderRow = CompoundHeaderRow;
Table.DataCell = DataCell;
Table.Footer = Footer;
Table.Header = Header;
Table.HeaderCell = HeaderCell;
Table.Row = Row;
