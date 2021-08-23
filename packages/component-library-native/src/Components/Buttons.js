import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { useTheme } from "../Provider/ThemeProvider";
import { variantToTheme } from "../util";
import { LineIcon } from "./Icons";
export const Button = ({ children, variant = "", isDisabled = false, style = [], textStyle = [], ...props }) => {
    const { theme } = useTheme();
    const custStyle = style instanceof Array ? style : [style];
    const custTextStyle = textStyle instanceof Array ? textStyle : [textStyle];
    const textStyles = variantToTheme({
        component: "text",
        styles: variant,
    });
    const buttonStyles = variantToTheme({
        component: "button",
        styles: variant,
    });
    return (React.createElement(TouchableOpacity, { style: [...buttonStyles, isDisabled && theme.buttons?.disabled, ...custStyle], disabled: isDisabled, ...props },
        React.createElement(Text, { style: [...textStyles, isDisabled && theme.typography?.buttons?.disabled, ...custTextStyle] }, children)));
};
export const IconButton = ({ isDisabled = false, style = {}, icon, stroke, 
// strokeWidth = 2,
size, ...props }) => {
    const custStyle = style instanceof Array ? style : [style];
    return (React.createElement(TouchableOpacity, { style: [...custStyle], disabled: isDisabled, ...props },
        React.createElement(LineIcon, { iconType: icon, stroke: stroke, size: size })));
};
export const TabButton = ({ selected, onClick, children }) => {
    const { theme } = useTheme();
    return (React.createElement(Button, { variant: "tab", style: selected ? theme.buttons?.tabSelected : {}, textStyle: selected ? theme.typography?.text?.bold : theme.typography?.text?.body, onPress: onClick, activeOpacity: 1 }, children));
};
//# sourceMappingURL=Buttons.js.map