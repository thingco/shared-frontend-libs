import React from "react";
import { TouchableOpacity } from "react-native";
import { Text } from "../Typography";
export const NavBarTextButton = ({ text, ...props }) => {
    return (React.createElement(TouchableOpacity, { style: {
            flex: 1,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            opacity: props.disabled ? 0.5 : 1,
            marginHorizontal: 20,
        }, ...props },
        React.createElement(Text, { variant: "small bold greyscale50" }, text)));
};
//# sourceMappingURL=NavBarTextButton.js.map