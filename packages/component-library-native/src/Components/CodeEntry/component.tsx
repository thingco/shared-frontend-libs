import React from "react";
import { InputField } from "./InputField";

// TODO: Build code entry component.
// Needs to render codeLength * text input fields
// Handle focus/blur on each
// Handle styling (focus/not)
// Support masking fields
// Support different styles
// and more...

export interface CodeEntryProps {
	variant?: "box" | "underline";
	keyboardType?: "numeric" | "default";
	mask?: boolean;
	fill?: string;
	border?: {
		focus?: string;
		noFocus?: string;
	};
	cursor?: string;
	onChange: () => void;
	onComplete: () => void;
	codeLength: number;
	focused?: boolean;
}

export const CodeEntry = ({
	variant = "box",
	keyboardType = "default",
	mask = false,
	fill,
	border = {},
	cursor,
	onComplete,
	codeLength,
	focused = false,
}: CodeEntryProps) => {
	const [value, setValue] = React.useState(new Array(codeLength).fill(""));

	const inputs = value.map((value, index) => (
		<InputField
			value={value}
			setValue={(s) => {
				let values = [...value];
				values[index] = s;
				setValue(values);
			}}
			isFocus={focused}
			style={variant}
			keyboardType={keyboardType}
		/>
	));
};
