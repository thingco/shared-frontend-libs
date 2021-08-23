import React from "react";
import { TouchableOpacity, Text, } from "react-native";
import { useTheme } from "../Provider/ThemeProvider";
import { variantToTheme } from "../util";
import { buttonImageSources as ImageSources } from "../Icons/ImageSources";
export const ImageButton = ({ image, text, style = [], textStyle = [], ...props }) => {
    const { theme } = useTheme();
    const custStyle = style instanceof Array ? style : [style];
    const custTextStyle = textStyle instanceof Array ? textStyle : [textStyle];
    const textStyles = variantToTheme({
        component: "text",
        styles: "menu",
    });
    const buttonStyles = variantToTheme({
        component: "button",
        styles: "menu",
    });
    return (React.createElement(TouchableOpacity, { style: [...buttonStyles, ...custStyle], ...props },
        React.createElement(ImageSources, { image: image, style: {
                marginRight: 20,
            } }),
        React.createElement(Text, { style: [...textStyles, ...custTextStyle] }, text)));
};
//# sourceMappingURL=ImageButton.js.map