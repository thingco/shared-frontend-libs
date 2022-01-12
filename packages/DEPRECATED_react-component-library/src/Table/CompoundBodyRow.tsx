import React from "react";
import shortid from "shortid";

import { DataCell } from "./DataCell";
import { Row } from "./Row";

export interface TableCompoundBodyRowProps {
  columnData: Array<string | number | React.ReactNode>
  testid?: string
}

/**
 * @param root0
 * @param root0.columnData
 * @param root0.testid
 * @visibleName Table.CompoundBodyRow
 */
export const CompoundBodyRow = ({
  columnData,
  testid = "Row"
}: TableCompoundBodyRowProps): JSX.Element => (
  <Row testid={testid}>
    {columnData.map((datum) => (
      <DataCell key={shortid.generate()}>{datum}</DataCell>
    ))}
  </Row>
)
