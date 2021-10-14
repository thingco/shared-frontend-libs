import userEvent from "@testing-library/user-event";
import { customScreen } from "./find-by-term";

export function findInputClearInputFillInput(labelText: string, inputValue: string) {
	const input = customScreen.getByLabelText(labelText);
	userEvent.clear(input);
	userEvent.type(input, inputValue);
}

export function clickButton(name: string) {
	const target = customScreen.getByRole("button", { name });
	userEvent.click(target);
}
