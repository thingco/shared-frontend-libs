import React from "react";

export interface TableColProps {
  span: number
}

/**
 * @param root0
 * @param root0.span
 * @visibleName Table.Col
 */
export const Col = ({ span }: TableColProps): JSX.Element => <col span={span} />
