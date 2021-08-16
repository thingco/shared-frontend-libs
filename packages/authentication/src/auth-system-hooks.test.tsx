/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { renderHook } from "@testing-library/react-hooks";
import React from "react";
import { createMachine } from "xstate";

import {
	AuthenticationSystemContext,
	AuthenticationSystemEvent,
	AuthStateId,
	machine,
} from "./auth-system";
import * as AuthHook from "./auth-system-hooks";

/* ========================================================================= *\
 * 1. UTILITIES
 * 2. SETUP
 * 3. TEST MAP
 * 4. SANITY CHECKS
 * 5. TESTS
\* ========================================================================= */

/* ------------------------------------------------------------------------- *\
 * 1. UTILITIES
\* ------------------------------------------------------------------------- */

/**
 * For every exposed state (which describe a stage in the auth process), there
 * is a corresponding hook, which handles sending messages to the system.
 *
 * @example
 * ```
 * > stateIdToHookName("awaitingSessionCheck")
 * "useAwaitingSessionCheck"
 * ```
 */
function stateIdToHookName(stateId: AuthStateId) {
	return `use${stateId[0].toUpperCase()}${stateId.slice(1)}`;
}

/**
 * For every state in the system, want to know the corresponding events that
 * have been defined so as to ensure the hooks cover them all:
 */
const eventsForStates = Object.entries(machine.config.states!).reduce((eventMap, [state, node]) => {
	return eventMap.set(state, Object.keys(node.on ?? {}));
}, new Map());

/**
 * The state machine needs to be primed for the tests. Each hook relates to a
 * specific exposed state, and so the machine must start in that state. And
 * some events depend upon specific context values, so again, those need to be
 * forced
 *
 * THIS DOESN'T WORK :(
 */
function createTestAuthSystem(
	initialState: AuthStateId,
	contextOverride: Partial<AuthenticationSystemContext> = {}
) {
	const rawConfig = machine.config;
	rawConfig.initial = initialState;
	// @ts-ignore
	rawConfig.context = { ...rawConfig.context, ...contextOverride };

	return createMachine(rawConfig);
}

/**
 * The events sent by the hooks need to go somewhere, and that somewhere is here.
 * The event sink needs to
 *
 * a. record the current event that just happened
 * b. store all the events for a single hook test run
 * c. be reset for a new hook test run
 */
class EventRecorder {
	eventType: any = null;
	eventStack: any[] = [];

	log(event: AuthenticationSystemEvent) {
		this.eventType = event.type;
		this.eventStack.push(event);
	}

	reset() {
		this.eventType = null;
		this.eventStack = [];
	}
}

/* ------------------------------------------------------------------------- *\
 * 2. SETUP
\* ------------------------------------------------------------------------- */

/**
 * The hooks all use the `useAuthSystem` hook, which allows access to
 * the authentication system state machine, returning a 2-item tuple
 * of `state` and the `send` function.
 *
 * For the tests, **we do not care about this**, all we want to know is
 * that when `send` is called, the correct event is sent, and that
 * each hook covers every possible event defined in the system for that
 * state.
 *
 * Instead, the `send` function fills an instance of the EventBucket class,
 * and that is used by the tests to check everything is working.
 */
const eventSink = new EventRecorder();

jest.mock("@xstate/react", () => ({
	useSelector: jest.fn(),
}));

jest.mock("./AuthSystemProvider", () => ({
	useAuthSystem: jest.fn(() => ({
		send: (event: AuthenticationSystemEvent) => eventSink.log(event),
	})),
	useAuthSystemLogger: jest.fn(),
}));

/* ------------------------------------------------------------------------- *\
 * 3. TEST MAP
\* ------------------------------------------------------------------------- */

/**
 * Now to test the hooks, the tests will just cycle through a table of hook
 * descriptions, the TestHookMap
 */
type HookTestMap = {
	stateId: AuthStateId;
	hookSpec: {
		primaryMethod: string;
		callbacks: {
			args: any[];
			callback: jest.Mock<Promise<void>, []>;
			eventType: string;
			contextAdjustment?: any;
		}[];
		additionalMethods?: any[];
	};
}[];

const hookTestMap: HookTestMap = [
	{
		stateId: AuthStateId.awaitingSessionCheck,
		hookSpec: {
			primaryMethod: "checkSession",
			callbacks: [
				{
					args: [],
					callback: jest.fn(() => Promise.resolve()),
					eventType: "SESSION_PRESENT",
				},
				{
					args: [],
					callback: jest.fn(() => Promise.reject()),
					eventType: "SESSION_NOT_PRESENT",
				},
			],
		},
	},
	// {
	// 	stateId: AuthStateId.awaitingUsername,
	// 	hookSpec: {
	// 		primaryMethod: "validateUsername",
	// 		callbacks: [
	// 			{
	// 				args: ["valid_username__otp_flow_inferred@example.com"],
	// 				callback: jest.fn(() => Promise.resolve()),
	// 				eventType: "USERNAME_VALID__OTP_FLOW_DETECTED",
	// 			},
	// 			{
	// 				args: ["invalid_username__otp_flow_inferred@example.com"],
	// 				callback: jest.fn(() => Promise.reject()),
	// 				eventType: "USERNAME_INVALID",
	// 			},
	// 			{
	// 				args: ["unknown_username__username_password_flow_inferred@example.com"],
	// 				callback: jest.fn(() => Promise.reject("CUSTOM_AUTH is not enabled for the client.")),
	// 				eventType: "USERNAME_VALIDITY_UNKNOWN__PASSWORD_FLOW_DETECTED",
	// 			},
	// 		],
	// 	},
	// },
];

/* ------------------------------------------------------------------------- *\
 * 4. SANITY CHECKS
\* ------------------------------------------------------------------------- */

describe("sanity checks for the auth system hooks", () => {
	it("module exports a hook for each state that is not internal to the machine, and only that", () => {
		const nonInternalMachineStatesAsHookNames = Object.values(AuthStateId)
			.filter((state) => !state.startsWith("INTERNAL"))
			.map(stateIdToHookName);

		const actualExportedHookNames = Object.keys(AuthHook);

		expect(nonInternalMachineStatesAsHookNames).toEqual(actualExportedHookNames);
	});
});

/* ------------------------------------------------------------------------- *\
 * 5. TESTS
\* ------------------------------------------------------------------------- */

describe("hooks fire and emit all available transition events that are specified for each state", () => {
	for (const { stateId, hookSpec } of hookTestMap) {
		describe(`hook for ${stateId} sends expected messages`, () => {
			const hookName = stateIdToHookName(stateId) as keyof typeof AuthHook;

			beforeAll(() => {
				eventSink.reset();
			});

			for (const { args, callback, contextAdjustment, eventType } of hookSpec.callbacks) {
				// const testAuthSystem = createTestAuthSystem(stateId, contextAdjustment);
				// const wrapper = ({ children }: { children: any }) => (
				// 	<AuthenticationSystemProvider
				// 		authenticationSystem={testAuthSystem}
				// 		eventSink={eventRecorder.log}
				// 	>
				// 		{children}
				// 	</AuthenticationSystemProvider>
				// );
				const { result, waitForNextUpdate } = renderHook(() => AuthHook[hookName](callback));

				test(`${eventType} message sent`, async () => {
					// @ts-ignore
					result.current[hookSpec.primaryMethod](...args);

					await waitForNextUpdate();

					expect(eventSink.eventType).toEqual(eventType);
				});
			}

			test(`${hookName} sends all possible events defined in system for ${stateId}`, () => {
				expect(eventSink.eventStack).toEqual(eventsForStates.get(stateId));
			});
		});
	}
});
