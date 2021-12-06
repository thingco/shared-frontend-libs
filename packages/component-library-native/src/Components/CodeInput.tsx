import React from "react";
import { useTheme } from "../Provider/ThemeProvider";
import { TextInput, Dimensions, View, Text, Pressable } from "react-native";

const { width: viewportWidth } = Dimensions.get("window");

/** CodeInput component
 -- PROPS --
  numFields:
  == Default: 6
  - Length of code
  padding: 
  == Default: 0
  - Horizontal padding on the container view
  - If not supplied, component may not position correctly
  useMask:
  == Default: false
  - Will mask input if true
  width
  == Default: viewport width
  - Available width to render component
  onCodeChange
  - Will spit out the value of the code
**/

export const CodeInput = ({
	numFields = 6,
	padding = 0,
	useMask = false,
	width = viewportWidth,
	onCodeChange,
}: {
	numFields?: number;
	padding?: number;
	width?: number;
	useMask?: boolean;
	onCodeChange: (code: string) => void;
}) => {
	const { theme } = useTheme();
	const size = (width - 2 * padding) / numFields - 10;
	const inputRef = React.useRef<TextInput>(null);
	const [code, setCode] = React.useState("");
	const [containerIsFocused, setContainerIsFocused] = React.useState(false);
	const codeDigitsArray = new Array(numFields).fill(0);

	const handleOnPress = (index: any) => {
		if (index <= code.length - 1) {
			setCode(code.substr(0, index));
		}
		setContainerIsFocused(true);
		inputRef.current?.focus();
	};

	const handleOnBlur = () => {
		setContainerIsFocused(false);
	};

	const handleChange = (value: any) => {
		!isNaN(value) && value.indexOf(" ") === -1 && setCode(value);
		value.length === numFields && inputRef.current?.blur();
	};

	React.useEffect(() => {
		onCodeChange(code);
	}, [code]);

	const codeInput = (index: number) => {
		const emptyInputChar = " ";
		const val = useMask ? "*" : code[index];
		const char = code[index] ? val : emptyInputChar;

		return (
			<Pressable key={index} onPress={() => handleOnPress(index)}>
				<View
					style={{
						height: size,
						width: size,
						borderWidth: 2,
						borderColor:
							index === code.length && containerIsFocused
								? theme.colors?.primary
								: theme.colors?.secondary,
						backgroundColor: theme.colors?.secondary,
						margin: 5,
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<Text
						style={{
							fontSize: size / 1.5,
							fontWeight: "600",
							textAlign: "center",
							color: theme.colors?.text_secondary,
						}}
					>
						{char}
					</Text>
				</View>
			</Pressable>
		);
	};

	return (
		<>
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
				}}
			>
				{codeDigitsArray.map((v, i) => codeInput(i))}
			</View>
			<TextInput
				caretHidden={true}
				contextMenuHidden={true}
				ref={inputRef}
				keyboardType="number-pad"
				onChangeText={(v) => handleChange(v)}
				onBlur={() => handleOnBlur()}
				maxLength={numFields}
				value={code}
				style={{
					height: 100,
					width: 1,
					// backgroundColor: "white",
					position: "absolute",
					// bottom: 0,
					opacity: 0,
				}}
			></TextInput>
		</>
	);
};
