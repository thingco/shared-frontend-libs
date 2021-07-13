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
import {
	AuthenticatorEvent,
	PinServiceContext,
	PinServiceFunctions,
	PinServiceSchema,
} from "../types";
import { assertEventType } from "../utils";

const pinServiceConfig: MachineConfig<PinServiceContext, PinServiceSchema, AuthenticatorEvent> = {
	initial: "checkingForExistingPin",
	context: {
		pin: "",
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
			},
		},
		idle: {
			entry: PinServiceActionId.clearLocalPin,
			on: {
				"PIN_FLOW.CHANGE_CURRENT_PIN": {
					target: "awaitingCurrentPinForReset",
				},
				"PIN_FLOW.VALIDATE_CURRENT_PIN": {
					target: "awaitingPin",
				},
				"PIN_FLOW.SET_UP_PIN": {
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
			entry: sendParent({ type: "NETWORK_REQUEST.INITIALISED" } as AuthenticatorEvent),
			invoke: {
				src: PinServiceId.validatePin,
				onDone: {
					actions: [
						sendParent({ type: "NETWORK_REQUEST.COMPLETE" } as AuthenticatorEvent),
						sendParent({ type: "PIN_FLOW.PIN_VALIDATED" } as AuthenticatorEvent),
					],
					target: "idle",
				},
				onError: {
					target: "awaitingPin",
				},
			},
		},
		awaitingCurrentPinForReset: {
			on: {
				"PIN_FLOW.SUBMIT_PIN": {
					actions: PinServiceActionId.setLocalPin,
					target: "validatingCurrentPinForReset",
				},
			},
		},
		validatingCurrentPinForReset: {
			entry: sendParent({ type: "NETWORK_REQUEST.INITIALISED" } as AuthenticatorEvent),
			invoke: {
				src: PinServiceId.validatePin,
				onDone: {
					actions: [sendParent({ type: "NETWORK_REQUEST.COMPLETE" } as AuthenticatorEvent)],
					target: "clearingCurrentPinForReset",
				},
				onError: {
					target: "awaitingPin",
				},
			},
		},
		clearingCurrentPinForReset: {
			invoke: {
				src: PinServiceId.clearPin,
				onDone: {
					actions: [
						sendParent<PinServiceContext, DoneInvokeEvent<boolean>>(() => ({
							type: "PIN_FLOW.USER_HAS_PIN_SET",
							userHasPinSet: false,
						})),
						sendParent({ type: "PIN_FLOW.PIN_VALIDATED" } as AuthenticatorEvent),
					],
					target: "idle",
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
			entry: sendParent({ type: "NETWORK_REQUEST.INITIALISED" } as AuthenticatorEvent),
			invoke: {
				src: PinServiceId.setNewPin,
				onDone: {
					actions: [
						sendParent({ type: "NETWORK_REQUEST.COMPLETE" } as AuthenticatorEvent),
						sendParent({ type: "PIN_FLOW.NEW_PIN_SET" } as AuthenticatorEvent),
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

const pinServiceOptions: MachineOptions<PinServiceContext, AuthenticatorEvent> = {
	actions: {
		[PinServiceActionId.setLocalPin]: assign<PinServiceContext, AuthenticatorEvent>({
			pin: (_, e) => {
				assertEventType(e, "PIN_FLOW.SUBMIT_PIN");
				return e.pin;
			},
		}),
		[PinServiceActionId.clearLocalPin]: assign<PinServiceContext, AuthenticatorEvent>({
			pin: () => "",
		}),
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
		[PinServiceId.setNewPin]: () => {
			throw new Error("No service set");
		},
		[PinServiceId.clearPin]: () => {
			throw new Error("No service set");
		},
	},
};

export function createPinService(
	pinServiceFunctions: PinServiceFunctions
): StateMachine<PinServiceContext, PinServiceSchema, AuthenticatorEvent> {
	const pinMachine = createMachine(pinServiceConfig, pinServiceOptions);
	return (pinMachine as StateMachine<
		PinServiceContext,
		PinServiceSchema,
		AuthenticatorEvent
	>).withConfig({
		services: {
			[PinServiceId.hasPinSet]: () => {
				return pinServiceFunctions.hasPinSet();
			},
			[PinServiceId.validatePin]: (ctx) => {
				return pinServiceFunctions.validatePin(ctx.pin);
			},
			[PinServiceId.setNewPin]: (ctx) => {
				return pinServiceFunctions.setNewPin(ctx.pin);
			},
			[PinServiceId.clearPin]: () => {
				return pinServiceFunctions.clearPin();
			},
		},
	});
}
