import {
	assign,
	createMachine,
	DoneInvokeEvent,
	MachineConfig,
	MachineOptions,
	sendParent,
	StateMachine,
} from "xstate";
import { log } from "xstate/lib/actions";

import { PinServiceId } from "../enums";
import { AuthEvent, PinServiceContext, PinServiceFunctions, PinServiceSchema } from "../types";
import { assertEventType } from "../utils";

const pinServiceConfig: MachineConfig<PinServiceContext, PinServiceSchema, AuthEvent> = {
	initial: "checkingForExistingPin",
	context: {
		pin: "",
		newPin: "",
	},
	states: {
		checkingForExistingPin: {
			invoke: {
				src: PinServiceId.hasPinSet,
				onDone: {
					actions: sendParent<PinServiceContext, DoneInvokeEvent<boolean>>((_, e) => ({
						type: "PIN_FLOW.USER_HAS_PIN_SET",
						userHasPinSet: e.data,
					})),
					target: "idle",
				},
				onError: {
					actions: log(
						(_, e) =>
							`There has been an error when attempting to check for an existing PIN; returned message is ${JSON.stringify(
								e.data
							)}`
					),
					target: "idle",
				},
			},
		},
		clearExistingPin: {
			invoke: {
				src: PinServiceId.clearPin,
				onDone: {
					actions: sendParent<PinServiceContext, DoneInvokeEvent<boolean>>(() => ({
						type: "PIN_FLOW.USER_HAS_PIN_SET",
						userHasPinSet: false,
					})),
					target: "idle",
				},
				onError: {
					actions: log(
						(_, e) =>
							`There has been an error when attempting to clear the existing PIN; returned message is ${JSON.stringify(
								e.data
							)}`
					),
					target: "idle",
				},
			},
		},
		idle: {
			entry: PinServiceActionId.clearLocalPin,
			on: {
				"PIN_FLOW.CHANGE_CURRENT_PIN": {
					target: "awaitingCurrentPin",
				},
				"PIN_FLOW.SET_UP_PIN": {
					target: "awaitingNewPin",
				},
				"PIN_FLOW.VALIDATE_PIN": {
					target: "awaitingNewPin",
				},
				"PIN_FLOW.TURN_OFF_PIN_SECURITY": {
					target: "clearExistingPin",
				},
			},
		},
		awaitingPin: {
			on: {
				"PIN_FLOW.SUBMIT_PIN": {
					actions: PinServiceActionId.setLocalPin,
					target: "validatingPin",
				},
			},
		},
		validatingPin: {
			entry: sendParent({ type: "NETWORK_REQUEST.INITIALISED" } as AuthEvent),
			invoke: {
				src: PinServiceId.validatePin,
				onDone: {
					actions: [
						sendParent({ type: "NETWORK_REQUEST.COMPLETE" } as AuthEvent),
						sendParent({ type: "PIN_FLOW.PIN_VALIDATED" } as AuthEvent),
					],
					target: "idle",
				},
				onError: {
					target: "awaitingPin",
				},
			},
		},
		awaitingCurrentPin: {
			on: {
				"PIN_FLOW.SUBMIT_PIN": {
					actions: PinServiceActionId.setLocalPin,
					target: "validatingCurrentPin",
				},
			},
		},
		validatingCurrentPin: {
			entry: sendParent({ type: "NETWORK_REQUEST.INITIALISED" } as AuthEvent),
			invoke: {
				src: PinServiceId.validatePin,
				onDone: {
					actions: sendParent({ type: "NETWORK_REQUEST.COMPLETE" } as AuthEvent),
					target: "awaitingNewPin",
				},
				onError: {
					target: "awaitingCurrentPin",
				},
			},
		},
		awaitingNewPin: {
			on: {
				"PIN_FLOW.SUBMIT_PIN": {
					actions: PinServiceActionId.setLocalPin,
					target: "settingNewPin",
				},
			},
		},
		settingNewPin: {
			invoke: {
				src: PinServiceId.setPin,
				onDone: {
					actions: [
						sendParent({ type: "NETWORK_REQUEST.COMPLETE" } as AuthEvent),
						sendParent({ type: "PIN_FLOW.NEW_PIN_SET" } as AuthEvent),
					],
					target: "idle",
				},
			},
		},
	},
};

const enum PinServiceActionId {
	setLocalPin = "setLocalPin",
	clearLocalPin = "clearLocalPin",
}

const pinServiceOptions: MachineOptions<PinServiceContext, AuthEvent> = {
	actions: {
		[PinServiceActionId.setLocalPin]: assign<PinServiceContext, AuthEvent>({
			pin: (ctx, e) => {
				assertEventType(e, "PIN_FLOW.SUBMIT_PIN");
				return e.pin;
			},
		}),
		[PinServiceActionId.clearLocalPin]: assign<PinServiceContext, AuthEvent>({ pin: () => "" }),
	},
	activities: {},
	delays: {},
	guards: {},
	services: {
		[PinServiceId.hasPinSet]: () => {
			throw new Error("No service set");
		},
		[PinServiceId.validatePin]: () => {
			throw new Error("No service set");
		},
		[PinServiceId.setPin]: () => {
			throw new Error("No service set");
		},
		[PinServiceId.clearPin]: () => {
			throw new Error("No service set");
		},
	},
};

export function createPinService(
	pinServiceFunctions: PinServiceFunctions
): StateMachine<PinServiceContext, PinServiceSchema, AuthEvent> {
	const pinMachine = createMachine(pinServiceConfig, pinServiceOptions);
	return (pinMachine as StateMachine<PinServiceContext, PinServiceSchema, AuthEvent>).withConfig({
		services: {
			[PinServiceId.hasPinSet]: () => {
				return pinServiceFunctions.hasPinSet();
			},
			[PinServiceId.validatePin]: (ctx) => {
				return pinServiceFunctions.validatePin(ctx.pin);
			},
			[PinServiceId.setPin]: (ctx) => {
				return pinServiceFunctions.setPin(ctx.pin);
			},
			[PinServiceId.clearPin]: () => {
				return pinServiceFunctions.clearPin();
			},
		},
	});
}
