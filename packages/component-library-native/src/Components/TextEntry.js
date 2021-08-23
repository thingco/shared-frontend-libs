import React, { useState } from "react";
import { TextInput, Text } from "react-native";
import { View } from "./Containers";
import { useTheme } from "../Provider/ThemeProvider";
import { variantToTheme } from "../util";
export const TextEntry = ({ variant = "", style = [], labelStyle = [], label, autoCorrect = false, placeholder, ...props }) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const custStyle = style instanceof Array ? style : [style];
    const custTextStyle = labelStyle instanceof Array ? labelStyle : [labelStyle];
    const inputStyles = variantToTheme({
        component: "input",
        styles: variant,
    });
    const textStyles = variantToTheme({
        component: "text",
        styles: variant,
    });
    const focusedStyles = variantToTheme({
        component: "input",
        styles: "focused",
    });
    return (React.createElement(View, { style: { marginVertical: 5 } },
        label && (React.createElement(Text, { style: [theme.typography?.buttons?.label, ...textStyles, ...custTextStyle] }, label)),
        React.createElement(TextInput, { onFocus: (e) => setIsFocused(true), onBlur: (e) => setIsFocused(false), style: isFocused
                ? [...inputStyles, ...custStyle, ...focusedStyles]
                : [...inputStyles, ...custStyle], placeholderTextColor: variant.includes("dark") ? theme.colors?.greyscale800 : theme.colors?.greyscale50, autoCorrect: autoCorrect, underlineColorAndroid: "rgba(0,0,0,0)", placeholder: isFocused ? "" : placeholder, ...props })));
};
//# sourceMappingURL=TextEntry.js.map