/*
 * Input Validation
 *
 * Some hooks return a method that accepts user input. This input is
 * always a string, and can be validated via regex at the call site
 * prior to any remote API request being made.
 *
 * NOTE: in an HTML app, input patterns can be defined on input
 * elements. The validation logic here is primarily to cover native
 * app input validation, where that option is not available.
 *
 * TODO: this is a stopgap, basically. The input components for native
 * should be built in such a way as to emulate HTML behaviour: this would
 * then negate the need for this validation logic.
 */

export type InputValidationPattern = {
	pattern: RegExp;
	failureMessage: string;
};
export type InputValidationsMap = {
	[inputKey: string]: InputValidationPattern[];
};

/**
 * Given a map of regex validations for each input key, and a map of input key to input value,
 * iterate through the values testing against the relevant regex patterns.
 *
 * Return a map of the input keys, with each value being an array of the failure messages
 * that match each input validation.
 *
 * @example
 * ```
 * const passwordValidations = [
 * 	{ pattern: /^$/, failureMessage: "Password cannot be blank"},
 * 	{ pattern: /^\d{6}$/, failureMessage: "Password must be six digits" },
 * ];
 *
 * validateInputs(passwordValidations, { password: "" })
 * // returns { password: ["Password cannot be blank", "Password must be six digits" ]}
 * validateInputs(passwordValidations, { password: "abc123" })
 * // returns { password: ["Password must be six digits" ]}
 * validateInputs(passwordValidations, { password: "123456" })
 * // returns { password: []}
 * ```
 *
 * @param inputValidations - a mapping of input keys to arrays of `{ pattern: RegExp; failureMessage: string }`
 * @param inputValues - a mapping of `{ inputKey: inputValue }` to be used against the validations
 * @returns a mapping of `{ inputKey: failureMessage[] }`
 */
export function validateInputs(
	inputValidations: InputValidationsMap,
	inputValues: {
		[inputKey in keyof InputValidationsMap]: string;
	}
): { [inputKey in keyof InputValidationsMap]: string[] } {
	return Object.fromEntries(
		Object.entries(inputValues).map(([k, v]) => {
			const failedValidations = inputValidations[k]
				.filter(({ pattern }) => !pattern.test(v))
				.map(({ failureMessage }) => failureMessage);

			return [k, failedValidations];
		})
	);
}
