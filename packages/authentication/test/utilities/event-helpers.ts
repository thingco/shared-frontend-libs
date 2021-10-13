import userEvent from "@testing-library/user-event";
import { customScreen } from "./find-by-term";

export async function findInputClearInputFillInput(labelText: string, inputValue: string) {
	const input = await customScreen.findByLabelText(labelText);
	userEvent.clear(input);
	userEvent.type(input, inputValue);
}

export async function clickButton(name: string) {
	userEvent.click(await customScreen.findByRole("button", { name }));
}
