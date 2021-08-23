import React from "react";
import { TextInput, View } from "react-native";
import { useTheme } from "../../Provider/ThemeProvider";
export const InputField = ({ value, setValue, isFocus, size = 40, style, keyboardType = "default", }) => {
    const { theme } = useTheme();
    const styles = {
        view: {
            height: size,
            width: size,
            borderColor: isFocus ? theme.colors?.primary : theme.colors?.secondary,
        },
    };
    return (React.createElement(View, { style: [
            theme.inputs?.cell,
            styles.view,
            style === "box" ? theme.inputs?.box : theme.inputs?.underline,
        ] },
        React.createElement(TextInput, { value: value, onChangeText: (e) => setValue(e), maxLength: 1, style: [theme.inputs?.cellText], keyboardType: keyboardType })));
};
//# sourceMappingURL=InputField.js.map