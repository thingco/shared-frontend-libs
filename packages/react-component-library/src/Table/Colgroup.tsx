import React from "react";

export interface TableColgroupProps {
  span?: number
  children?: React.ReactNode
}

/**
 * @param root0
 * @param root0.span
 * @param root0.children
 * @visibleName Table.Colgroup
 */
export const Colgroup = ({
  span,
  children,
}: TableColgroupProps): JSX.Element => {
  if (span && !children) {
    return <colgroup span={span} />
  } else if (!span && children) {
    return <colgroup>{children}</colgroup>
  } else {
    throw new Error(
      "A <colgroup> **must** have *either* a span attribute *or* one or more <col> children"
    )
  }
}
