import { createMachine, sendParent } from "xstate";
import { log } from "xstate/lib/actions";
import { createModel } from "xstate/lib/model";

import { DeviceSecurityService } from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ModelContextFrom } from "xstate/lib/model";

const model = createModel(
	{
		currentPin: "",
		newPin: "",
	},
	{
		events: {
			CHECK_FOR_EXISTING_PIN: () => ({}),
			CHANGE_EXISTING_PIN: () => ({}),
			SUBMIT_CURRENT_PIN: (currentPin: string) => ({ currentPin }),
			SUBMIT_CURRENT_AND_NEW_PIN: (currentPin: string, newPin: string) => ({ currentPin, newPin }),
			SUBMIT_NEW_PIN: (newPin: string) => ({ newPin }),
		},
	}
);

const implementations = {
	services: {
		checkPinIsSet: (_ctx: ModelContextFrom<typeof model>) => {
			throw new Error("No implementation for checkPinIsSet method");
		},
		checkPinIsValid: (_ctx: ModelContextFrom<typeof model>) => {
			throw new Error("No implementation for checkPinIsValid method");
		},
		clearExistingPin: (_ctx: ModelContextFrom<typeof model>) => {
			throw new Error("No implementation for clearExistingPin method");
		},
		setNewPin: (_ctx: ModelContextFrom<typeof model>) => {
			throw new Error("No implementation for setNewPin method");
		},
	},
	actions: {
		assignCurrentPinToContext: model.assign((_, e) => {
			if (e.type !== "SUBMIT_CURRENT_PIN") return {};
			return { currentPin: e.currentPin };
		}),
		assignCurrentPinAndNewPinToContext: model.assign((_, e) => {
			if (e.type !== "SUBMIT_CURRENT_AND_NEW_PIN") return {};
			return { currentPin: e.currentPin, newPin: e.newPin };
		}),
		clearPinsFromContext: model.assign({ currentPin: "", newPin: "" }),
		// Keep in touch with yr parents
		requestExistingPin: sendParent("REQUEST_EXISTING_PIN"),
		requestExistingPinAndNewPin: sendParent("REQUEST_EXISTING_PIN_AND_NEW_PIN"),
		requestNewPinSetup: sendParent("REQUEST_NEW_PIN"),
		notifyRequestStarted: sendParent("ASYNC_REQUEST_PENDING"),
		notifyRequestComplete: sendParent("ASYNC_REQUEST_SETTLED"),
		notifyAuthFlowComplete: sendParent("AUTH_FLOW_COMPLETE"),
	},
};

const machine = createMachine<typeof model>(
	{
		id: "pinService",
		initial: "init",
		context: model.initialContext,
		states: {
			init: {
				on: {
					CHECK_FOR_EXISTING_PIN: {
						target: "checkingForExistingPin",
					},
					CHANGE_EXISTING_PIN: {
						target: "awaitingPinInputForPinChange",
					},
				},
			},
			checkingForExistingPin: {
				entry: "notifyRequestStarted",
				invoke: {
					id: "checkPinIsSet",
					src: "checkPinIsSet",
					onDone: {
						actions: "requestExistingPin",
						target: "awaitingPinInput",
					},
					onError: {
						actions: "requestNewPin",
						target: "awaitingNewPinInput",
					},
				},
				exit: "notifyRequestComplete",
			},
			awaitingPinInput: {
				on: {
					SUBMIT_CURRENT_PIN: {
						actions: "assignCurrentPinToContext",
						target: "validatingPinInput",
					},
				},
			},
			validatingPinInput: {
				entry: "notifyRequestStarted",
				invoke: {
					id: "checkPinIsValid",
					src: "checkPinIsValid",
					onDone: {
						actions: "clearPinsFromContext",
						target: "authorised",
					},
					onError: {
						actions: log("TODO: PIN INPUT FAILURE"),
						target: "awaitingNewPinInput",
					},
				},
				exit: "notifyRequestComplete",
			},
			awaitingPinInputForPinChange: {
				entry: "requestExistingPinAndNewPin",
				on: {
					SUBMIT_CURRENT_AND_NEW_PIN: {
						actions: "assignCurrentPinAndNewPinToContext",
						target: "attemptingPinChange",
					},
				},
			},
			attemptingPinChange: {
				entry: "notifyRequestStarted",
				invoke: {
					id: "changePin",
					src: "changePin",
					onDone: {
						actions: "clearPinsFromContext",
						target: "authorised",
					},
					onError: {
						actions: log("TODO: PIN CHANGE FAILURE"),
						target: "awaitingPinInputForPinChange",
					},
				},
				exit: "notifyRequestComplete",
			},
			awaitingNewPinInput: {
				on: {
					SUBMIT_NEW_PIN: {
						actions: "assignNewPinToContext",
						target: "settingNewPin",
					},
				},
			},
			settingNewPin: {
				entry: "notifyRequestStarted",
				invoke: {
					id: "setNewPin",
					src: "setNewPin",
					onDone: {
						actions: "clearPinsFromContext",
						target: "authorised",
					},
					onError: {
						actions: log("TODO: PIN SETUP FAILURE"),
						target: "awaitingNewPinInput",
					},
				},
				exit: "notifyRequestComplete",
			},
			authorised: {
				entry: "notifyAuthFlowComplete",
				type: "final",
			},
		},
	},
	implementations
);

export function createPinWorker(serviceApi: DeviceSecurityService) {
	return machine.withConfig({
		services: {
			changeExistingPin: (ctx: ModelContextFrom<typeof model>) =>
				serviceApi.changeExistingPin(ctx.currentPin, ctx.newPin),
			checkPinIsSet: () => serviceApi.checkPinIsSet(),
			checkPinIsValid: (ctx: ModelContextFrom<typeof model>) =>
				serviceApi.checkPinIsValid(ctx.currentPin),
			clearExistingPin: () => serviceApi.clearExistingPin(),
			setNewPin: (ctx: ModelContextFrom<typeof model>) => serviceApi.setNewPin(ctx.currentPin),
		},
	});
}
