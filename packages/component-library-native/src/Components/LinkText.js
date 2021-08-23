import React from "react";
import { Text } from "./Typography";
import { variantToTheme } from "../util";
export const LinkText = ({ variant = "", style = [], onPress, children, ...props }) => {
    style = style instanceof Array ? style : [style];
    const styles = variantToTheme({ component: "text", styles: variant });
    return (React.createElement(Text, { style: [...styles, ...style, { textDecorationLine: "underline" }], ...props, onPress: onPress }, children));
};
//# sourceMappingURL=LinkText.js.map