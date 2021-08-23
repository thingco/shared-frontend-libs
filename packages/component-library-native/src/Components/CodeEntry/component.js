import React from "react";
import { InputField } from "./InputField";
export const CodeEntry = ({ variant = "box", keyboardType = "default", mask = false, fill, border = {}, cursor, onComplete, codeLength, focused = false, }) => {
    const [value, setValue] = React.useState(new Array(codeLength).fill(""));
    const inputs = value.map((value, index) => (React.createElement(InputField, { key: index, value: value, setValue: (s) => {
            const values = [...value];
            values[index] = s;
            setValue(values);
        }, isFocus: focused, style: variant, keyboardType: keyboardType })));
};
//# sourceMappingURL=component.js.map