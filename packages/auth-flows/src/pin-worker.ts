/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendParent, StateMachine } from "xstate";
import { log } from "xstate/lib/actions";
import { createModel, ModelEventsFrom } from "xstate/lib/model";

import { ServiceError } from "./errors";

import type { DeviceSecurityService } from "./types";

import type { ModelContextFrom } from "xstate/lib/model";

const model = createModel(
	{
		currentPin: "",
		newPin: "",
	},
	{
		events: {
			CHECK_FOR_CURRENT_PIN: () => ({}),
			CHANGE_CURRENT_PIN: () => ({}),
			CLEAR_CURRENT_PIN: () => ({}),
			SUBMIT_CURRENT_PIN: (currentPin: string) => ({ currentPin }),
			SUBMIT_CURRENT_AND_NEW_PIN: (currentPin: string, newPin: string) => ({ currentPin, newPin }),
			SUBMIT_NEW_PIN: (newPin: string) => ({ newPin }),
			SERVICE_NOTIFICATION__ASYNC_REQUEST_PENDING: () => ({}),
			SERVICE_NOTIFICATION__ASYNC_REQUEST_SETTLED: () => ({}),
			SERVICE_NOTIFICATION__AUTH_FLOW_COMPLETE: () => ({}),
			SERVICE_REQUEST__CURRENT_PIN_AND_NEW_PIN: () => ({}),
			SERVICE_REQUEST__CURRENT_PIN: () => ({}),
			SERVICE_REQUEST__NEW_PIN: () => ({}),
		},
	}
);

const machine = model.createMachine(
	{
		id: "pinService",
		initial: "init",
		context: model.initialContext,
		states: {
			init: {
				on: {
					CHECK_FOR_CURRENT_PIN: {
						target: "checkingForCurrentPin",
					},
				},
			},
			checkingForCurrentPin: {
				entry: "notifyRequestStarted",
				invoke: {
					id: "checkPinIsSet",
					src: "checkPinIsSet",
					onDone: {
						actions: "requestCurrentPin",
						target: "awaitingCurrentPinInput",
					},
					onError: {
						actions: "requestNewPin",
						target: "awaitingNewPinInput",
					},
				},
				exit: "notifyRequestComplete",
			},
			clearingCurrentPin: {
				entry: "notifyRequestStarted",
				invoke: {
					id: "clearCurrentPin",
					src: "clearCurrentPin",
					onDone: "authorised",
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
			awaitingCurrentPinInput: {
				on: {
					SUBMIT_CURRENT_PIN: {
						actions: "assignCurrentPinToContext",
						target: "validatingCurrentPinInput",
					},
				},
			},
			validatingCurrentPinInput: {
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
				entry: "requestCurrentPinAndNewPin",
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
			authorised: {
				entry: "notifyAuthFlowComplete",
				on: {
					CHANGE_CURRENT_PIN: {
						target: "awaitingPinInputForPinChange",
					},
					CLEAR_CURRENT_PIN: {
						target: "clearingCurrentPin",
					},
				},
			},
		},
	},
	{
		services: {
			changeCurrentPin: () => {
				throw new ServiceError("No implementation for changeCurrentPin method");
			},
			checkPinIsSet: () => {
				throw new ServiceError("No implementation for checkPinIsSet method");
			},
			checkPinIsValid: () => {
				throw new ServiceError("No implementation for checkPinIsValid method");
			},
			clearCurrentPin: () => {
				throw new ServiceError("No implementation for clearCurrentPin method");
			},
			setNewPin: () => {
				throw new ServiceError("No implementation for setNewPin method");
			},
		},
		actions: {
			assignCurrentPinToContext: model.assign((_, e: ModelEventsFrom<typeof model>) => {
				if (e.type !== "SUBMIT_CURRENT_PIN") return {};
				return { currentPin: e.currentPin };
			}),
			assignCurrentPinAndNewPinToContext: model.assign((_, e: ModelEventsFrom<typeof model>) => {
				if (e.type !== "SUBMIT_CURRENT_AND_NEW_PIN") return {};
				return { currentPin: e.currentPin, newPin: e.newPin };
			}),
			clearPinsFromContext: model.assign({ currentPin: "", newPin: "" }) as any,
			// Keep in touch with yr parents
			notifyAuthFlowComplete: sendParent(model.events.SERVICE_NOTIFICATION__AUTH_FLOW_COMPLETE),
			notifyRequestComplete: sendParent(model.events.SERVICE_NOTIFICATION__ASYNC_REQUEST_SETTLED),
			notifyRequestStarted: sendParent(model.events.SERVICE_NOTIFICATION__ASYNC_REQUEST_PENDING),
			requestCurrentPin: sendParent(model.events.SERVICE_REQUEST__CURRENT_PIN),
			requestCurrentPinAndNewPin: sendParent(model.events.SERVICE_REQUEST__CURRENT_PIN_AND_NEW_PIN),
			requestNewPin: sendParent(model.events.SERVICE_REQUEST__NEW_PIN),
		},
	}
);

export function createPinWorker(
	serviceApi: DeviceSecurityService
): StateMachine<ModelContextFrom<typeof model>, any, ModelEventsFrom<typeof model>> {
	return machine.withConfig({
		services: {
			changeCurrentPin: (ctx: ModelContextFrom<typeof model>) =>
				serviceApi.changeCurrentPin(ctx.currentPin, ctx.newPin),
			checkPinIsSet: () => serviceApi.checkPinIsSet(),
			checkPinIsValid: (ctx: ModelContextFrom<typeof model>) =>
				serviceApi.checkPinIsValid(ctx.currentPin),
			clearCurrentPin: () => serviceApi.clearCurrentPin(),
			setNewPin: (ctx: ModelContextFrom<typeof model>) => serviceApi.setNewPin(ctx.currentPin),
		},
	});
}
