import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";


export function fillInput(inputLabel: string | RegExp) {
	return function (value: string) {
		const input = screen.getByLabelText(inputLabel);
		userEvent.clear(input);
		userEvent.type(input, value);
	}
}

export function clickButton(buttonText: string | RegExp) {
	return function () {
		const button = screen.getByRole("button", { name: buttonText });
		userEvent.click(button);
	}
}
