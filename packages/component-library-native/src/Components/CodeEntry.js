import React from "react";
import { Text, View } from "react-native";
import { CodeField, isLastFilledCell, MaskSymbol, useBlurOnFulfill, useClearByFocusCell, } from "react-native-confirmation-code-field";
import { useTheme } from "../Provider/ThemeProvider";
import { variantToTheme } from "../util";
export const CodeEntry = ({ variant = "box", mask = false, fill, border = {}, cursor, onChange, onComplete, codeLength, focused = false, }) => {
    const [value, setValue] = React.useState("");
    const ref = useBlurOnFulfill({ value, cellCount: codeLength });
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });
    const { theme } = useTheme();
    React.useEffect(() => {
        value.length === codeLength && onComplete(value);
        onChange && onChange(value);
    }, [value]);
    const cellStyles = variantToTheme({
        component: "input",
        styles: variant,
    });
    const borderFocus = border.focus ?? theme?.colors?.primary;
    const borderNoFocus = border.noFocus ?? theme?.colors?.secondary;
    const renderCell = ({ index, symbol, isFocused }) => {
        let textChild = null;
        if (symbol) {
            textChild = mask ? (React.createElement(MaskSymbol, { maskSymbol: "\u2022", isLastFilledCell: isLastFilledCell({ index, value }) }, symbol)) : (symbol);
        }
        return (React.createElement(View, { key: index, onLayout: getCellOnLayoutHandler(index), style: [
                theme?.inputs?.cell,
                ...cellStyles,
                {
                    borderColor: isFocused ? borderFocus : borderNoFocus,
                    borderWidth: 1,
                },
                fill && { backgroundColor: fill },
            ] },
            React.createElement(Text, { style: [{ color: cursor }] }, textChild)));
    };
    return (React.createElement(View, { style: { alignItems: "center" } },
        React.createElement(CodeField, { ref: ref, ...props, cellCount: codeLength, keyboardType: "number-pad", textContentType: "oneTimeCode", value: value, onChangeText: setValue, renderCell: renderCell, autoFocus: focused })));
};
//# sourceMappingURL=CodeEntry.js.map