import React from "react";
import shortid from "shortid";

import { HeaderCell } from "./HeaderCell";
import { Row } from "./Row";

export interface TableCompoundHeaderRowProps {
  columnTitles: Array<string | number | React.ReactNode>
  testid?: string
}

/**
 * @param root0
 * @param root0.columnTitles
 * @param root0.testid
 * @visibleName Table.CompoundHeaderRow
 */
export const CompoundHeaderRow = ({
  columnTitles,
  testid = "Header"
}: TableCompoundHeaderRowProps): JSX.Element => (
  <Row testid={testid} rowStyle="none">
    {columnTitles.map((title) => (
      <HeaderCell key={shortid.generate()}>{title}</HeaderCell>
    ))}
  </Row>
)
