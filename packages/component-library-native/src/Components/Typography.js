import React from "react";
import { Text as RNText } from "react-native";
import { variantToTheme } from "../util";
export const Text = ({ children, variant = "", style = [], ...props }) => {
    style = style instanceof Array ? style : [style];
    const styles = variantToTheme({ component: "text", styles: variant });
    return (React.createElement(RNText, { style: [...styles, ...style], ...props }, children));
};
//# sourceMappingURL=Typography.js.map