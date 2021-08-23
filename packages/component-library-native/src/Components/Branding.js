import React from "react";
import { View } from "./Containers";
import { variantToTheme } from "../util";
export const Branding = ({ Logo, variant = "", style = [] }) => {
    const styles = variantToTheme({ component: "view", styles: variant });
    style = style instanceof Array ? style : [style];
    return (React.createElement(View, { variant: "mx20 my20", style: [...styles, ...style] },
        React.createElement(Logo, null)));
};
//# sourceMappingURL=Branding.js.map