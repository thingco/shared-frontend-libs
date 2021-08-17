import React, { useState } from "react";
import { TextStyle, TextInput, ViewStyle, Text, TextInputProps } from "react-native";
import { View } from "./Containers";
import { useTheme } from "../Provider/ThemeProvider";
import { variantToTheme } from "../util";
interface TextEntryProps extends TextInputProps {
	variant?: string;
	style?: ViewStyle[] | ViewStyle;
	labelStyle?: TextStyle[] | TextStyle;
	label?: string;
	autoCorrect?: boolean;
	placeholder?: string;
}

export const TextEntry = ({
	variant = "",
	style = [],
	labelStyle = [],
	label,
	autoCorrect = false,
	placeholder,
	...props
}: TextEntryProps) => {
	const { theme } = useTheme();
	const [isFocused, setIsFocused] = useState<boolean>(false);

	const custStyle = style instanceof Array ? style : [style];
	const custTextStyle = labelStyle instanceof Array ? labelStyle : [labelStyle];

	const inputStyles: any[] = variantToTheme({
		component: "input",
		styles: variant,
	});
	const textStyles: any[] = variantToTheme({
		component: "text",
		styles: variant,
	});
	const focusedStyles: any[] = variantToTheme({
		component: "input",
		styles: "focused",
	});

	return (
		<View style={{ marginVertical: 5 }}>
			{label && (
				<Text style={[theme.typography?.buttons?.label, ...textStyles, ...custTextStyle]}>
					{label}
				</Text>
			)}
			<TextInput
				onFocus={(e) => setIsFocused(true)}
				onBlur={(e) => setIsFocused(false)}
				style={
					isFocused
						? [...inputStyles, ...custStyle, ...focusedStyles]
						: [...inputStyles, ...custStyle]
				}
				placeholderTextColor={
					variant.includes("dark") ? theme.colors?.greyscale800 : theme.colors?.greyscale50
				}
				autoCorrect={autoCorrect}
				underlineColorAndroid="rgba(0,0,0,0)"
				placeholder={isFocused ? "" : placeholder}
				{...props}
			/>
		</View>
	);
};
