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
			WORKER_ASYNC_REQUEST_PENDING: () => ({}),
			WORKER_ASYNC_REQUEST_SETTLED: () => ({}),
			WORKER_AUTH_FLOW_COMPLETE: () => ({}),
			WORKER_REQUIRES_CURRENT_PIN_AND_NEW_PIN: () => ({}),
			WORKER_REQUIRES_CURRENT_PIN: () => ({}),
			WORKER_REQUIRES_NEW_PIN: () => ({}),
		},
	}
);

type ModelCtx = ModelContextFrom<typeof model>;
type ModelEvt = ModelEventsFrom<typeof model>;

const implementations = {
	preserveActionOrder: true,
	services: {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		changeCurrentPin: (_c: ModelCtx, _e: ModelEvt) => {
			throw new ServiceError("No implementation for changeCurrentPin method");
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		checkPinIsSet: (_c: ModelCtx, _e: ModelEvt) => {
			throw new ServiceError("No implementation for checkPinIsSet method");
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		checkPinIsValid: (_c: ModelCtx, _e: ModelEvt) => {
			throw new ServiceError("No implementation for checkPinIsValid method");
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		clearCurrentPin: (_c: ModelCtx, _e: ModelEvt) => {
			throw new ServiceError("No implementation for clearCurrentPin method");
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		setNewPin: (_c: ModelCtx, _e: ModelEvt) => {
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
		assignNewPinToContext: model.assign((_, e: ModelEventsFrom<typeof model>) => {
			if (e.type !== "SUBMIT_NEW_PIN") return {};
			return { newPin: e.newPin };
		}),
		clearPinsFromContext: model.assign({ currentPin: "", newPin: "" }) as any,
		// Keep in touch with yr parents
		notifyAuthFlowComplete: sendParent(model.events.WORKER_AUTH_FLOW_COMPLETE),
		notifyRequestComplete: sendParent(model.events.WORKER_ASYNC_REQUEST_SETTLED),
		notifyRequestStarted: sendParent(model.events.WORKER_ASYNC_REQUEST_PENDING),
		requestCurrentPin: sendParent(model.events.WORKER_REQUIRES_CURRENT_PIN),
		requestCurrentPinAndNewPin: sendParent(model.events.WORKER_REQUIRES_CURRENT_PIN_AND_NEW_PIN),
		requestNewPin: sendParent(model.events.WORKER_REQUIRES_NEW_PIN),
	},
};

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
						actions: log((_, e) => e.data),
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
						actions: log((_, e) => e.data),
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
					id: "changeCurrentPin",
					src: "changeCurrentPin",
					onDone: {
						actions: "clearPinsFromContext",
						target: "authorised",
					},
					onError: {
						actions: log((_, e) => e.data),
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
	implementations
);

export function createPinWorker(
	serviceApi: DeviceSecurityService
): StateMachine<ModelCtx, any, ModelEvt> {
	console.log("Initialising PIN service worker machine...");
	return machine.withConfig({
		services: {
			changeCurrentPin: (ctx: ModelCtx) => serviceApi.changeCurrentPin(ctx.currentPin, ctx.newPin),
			checkPinIsSet: () => serviceApi.checkPinIsSet(),
			checkPinIsValid: (ctx: ModelCtx) => serviceApi.checkPinIsValid(ctx.currentPin),
			clearCurrentPin: () => serviceApi.clearCurrentPin(),
			setNewPin: (ctx: ModelCtx) => serviceApi.setNewPin(ctx.newPin),
		},
	});
}
