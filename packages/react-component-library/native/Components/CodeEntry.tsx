import React from "react";
import { View, Text, TextInputProps } from "react-native";
import {
	CodeField,
	isLastFilledCell,
	MaskSymbol,
	useBlurOnFulfill,
	useClearByFocusCell,
} from "react-native-confirmation-code-field";

import { useTheme } from "../Provider/ThemeProvider";
import { variantToTheme } from "../util";
interface CodeEntryProps extends TextInputProps {
	variant?: "box" | "underline";
	fill?: string;
	border?: {
		focus?: string;
		noFocus?: string;
	};
	cursor?: string;
	onChange?: (arg: any) => void;
	onComplete: (arg: any) => void;
	mask?: boolean;
	codeLength: number;
	focused: boolean;
}

export const CodeEntry = ({
	variant = "box",
	mask = false,
	fill,
	border = {},
	cursor,
	onChange,
	onComplete,
	codeLength,
	focused = false,
}: CodeEntryProps) => {
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

	const cellStyles: any[] = variantToTheme({
		component: "input",
		styles: variant,
	});

	const borderFocus = border.focus ?? theme.colors.primary;
	const borderNoFocus = border.noFocus ?? theme.colors.secondary;

	const renderCell = ({ index, symbol, isFocused }) => {
		let textChild: React.ReactElement | null = null;

		if (symbol) {
			textChild = mask ? (
				<MaskSymbol
					maskSymbol="•"
					isLastFilledCell={isLastFilledCell({ index, value })}
				>
					{symbol}
				</MaskSymbol>
			) : (
				symbol
			);
		}

		return (
			<View
				key={index}
				onLayout={getCellOnLayoutHandler(index)}
				style={[
					theme.inputs.cell,
					...cellStyles,
					{
						borderColor: isFocused ? borderFocus : borderNoFocus,
						borderWidth: 1,
					},
					fill && { backgroundColor: fill },
				]}
			>
				<Text style={[theme.inputs.cellText, cursor && { color: cursor }]}>
					{textChild}
				</Text>
			</View>
		);
	};

	return (
		<View style={{ alignItems: "center" }}>
			<CodeField
				ref={ref}
				{...props}
				cellCount={codeLength}
				keyboardType="number-pad"
				textContentType="oneTimeCode"
				value={value}
				onChangeText={setValue}
				renderCell={renderCell}
				autoFocus={focused}
			/>
		</View>
	);
};
