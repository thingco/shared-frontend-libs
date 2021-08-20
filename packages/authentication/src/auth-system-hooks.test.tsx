/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { cleanup, renderHook } from "@testing-library/react-hooks";
import React from "react";

import { AuthenticationSystemEvent, AuthStateId, machine } from "./auth-system";
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
 * The events sent by the hooks need to go somewhere, and that somewhere is here.
 * The event sink needs to
 *
 * a. record the current event that just happened
 * b. store all the events for a single hook test run
 * c. be reset for a new hook test run
 */
class EventRecorder {
	event: AuthenticationSystemEvent | null = null;
	eventStack = new Set();

	log(event: AuthenticationSystemEvent) {
		this.eventStack.add(event.type);
	}

	reset() {
		this.event = null;
		this.eventStack = new Set();
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

jest.mock("@thingco/logger", () => ({
	useLogger: jest.fn(() => ({
		info: jest.fn(),
		log: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
	})),
}));

jest.mock("./AuthSystemProvider", () => ({
	useAuthSystem: jest.fn(() => ({
		send: (event: AuthenticationSystemEvent) => eventSink.log(event),
	})),
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
		primaryMethod?: string;
		callbacks?: {
			runs?: number;
			args: any[];
			callback: jest.MockedFunction<(...args: any[]) => Promise<any>>;
			expectedEvent: AuthenticationSystemEvent;
		}[];
		additionalMethods?: { method: string; expectedEvent: AuthenticationSystemEvent }[];
	};
}[];

const VALID_USERNAME = "validuser@example.com";
const INVALID_USERNAME = "invaliduser@example.com";

const VALID_CODE = "123456";
const INVALID_CODE = "654321";

const VALID_PASSWORD = "validpassword";
const ANOTHER_VALID_PASSWORD = "anothervalidpassword";
const INVALID_PASSWORD = "invalidpassword";
const TEMPORARY_PASSWORD = "temporarypassword";

const USER_OBJECT = { description: "I represent the user object returned by the OAuth system" };

const hookTestMap: HookTestMap = [
	{
		stateId: AuthStateId.awaitingSessionCheck,
		hookSpec: {
			primaryMethod: "checkSession",
			callbacks: [
				{
					args: [],
					callback: jest.fn(() => Promise.resolve()),
					expectedEvent: { type: "SESSION_PRESENT" },
				},
				{
					args: [],
					callback: jest.fn(() => Promise.reject()),
					expectedEvent: { type: "SESSION_NOT_PRESENT" },
				},
			],
		},
	},
	{
		stateId: AuthStateId.awaitingOtpUsername,
		hookSpec: {
			primaryMethod: "validateUsername",
			callbacks: [
				{
					args: [VALID_USERNAME],
					callback: jest.fn(() => Promise.resolve(USER_OBJECT)),
					expectedEvent: {
						type: "USERNAME_VALID",
						username: VALID_USERNAME,
						user: USER_OBJECT,
					},
				},
				{
					args: [INVALID_USERNAME],
					callback: jest.fn(() => Promise.reject()),
					expectedEvent: { type: "USERNAME_INVALID" },
				},
			],
		},
	},
	{
		stateId: AuthStateId.awaitingOtp,
		hookSpec: {
			primaryMethod: "validateOtp",
			callbacks: [
				{
					args: [VALID_CODE],
					callback: jest.fn(() => Promise.resolve(USER_OBJECT)),
					expectedEvent: { type: "OTP_VALID", user: USER_OBJECT },
				},
				{
					args: [INVALID_CODE],
					callback: jest.fn(() => Promise.reject()),
					expectedEvent: { type: "OTP_INVALID" },
				},
				{
					runs: 3,
					args: [INVALID_CODE],
					callback: jest.fn(() => Promise.reject()),
					expectedEvent: { type: "OTP_INVALID_RETRIES_EXCEEDED" },
				},
			],
			additionalMethods: [{ method: "goBack", expectedEvent: { type: "GO_BACK" } }],
		},
	},
	{
		stateId: AuthStateId.awaitingUsernameAndPassword,
		hookSpec: {
			primaryMethod: "validateUsernameAndPassword",
			callbacks: [
				{
					args: [VALID_USERNAME, VALID_PASSWORD],
					callback: jest.fn(() => Promise.resolve(USER_OBJECT)),
					expectedEvent: {
						type: "USERNAME_AND_PASSWORD_VALID",
						username: VALID_USERNAME,
						user: USER_OBJECT,
					},
				},
				{
					args: [VALID_USERNAME, TEMPORARY_PASSWORD],
					callback: jest.fn(() => Promise.resolve({ NEW_PASSWORD_REQUIRED: true, ...USER_OBJECT })),
					expectedEvent: {
						type: "USERNAME_AND_PASSWORD_VALID_PASSWORD_CHANGE_REQUIRED",
						user: { NEW_PASSWORD_REQUIRED: true, ...USER_OBJECT },
						username: VALID_USERNAME,
					},
				},
				{
					args: [INVALID_USERNAME, INVALID_PASSWORD],
					callback: jest.fn(() => Promise.reject()),
					expectedEvent: { type: "USERNAME_AND_PASSWORD_INVALID" },
				},
			],
			additionalMethods: [
				{ method: "forgottenPassword", expectedEvent: { type: "FORGOTTEN_PASSWORD" } },
			],
		},
	},
	{
		stateId: AuthStateId.awaitingForcedChangePassword,
		hookSpec: {
			primaryMethod: "validateNewPassword",
			callbacks: [
				{
					args: [VALID_PASSWORD],
					callback: jest.fn(() => Promise.resolve(USER_OBJECT)),
					expectedEvent: { type: "PASSWORD_CHANGE_SUCCESS" },
				},
				{
					args: [INVALID_PASSWORD],
					callback: jest.fn(() => Promise.reject()),
					expectedEvent: { type: "PASSWORD_CHANGE_FAILURE" },
				},
			],
		},
	},
	{
		stateId: AuthStateId.awaitingPasswordResetRequest,
		hookSpec: {
			primaryMethod: "requestNewPassword",
			callbacks: [
				{
					args: [VALID_USERNAME],
					callback: jest.fn(() => Promise.resolve()),
					expectedEvent: { type: "PASSWORD_RESET_REQUEST_SUCCESS" },
				},
				{
					args: [INVALID_USERNAME],
					callback: jest.fn(() => Promise.reject()),
					expectedEvent: { type: "PASSWORD_RESET_REQUEST_FAILURE" },
				},
			],
		},
	},
	{
		stateId: AuthStateId.awaitingPasswordResetSubmission,
		hookSpec: {
			primaryMethod: "submitNewPassword",
			callbacks: [
				{
					args: [VALID_CODE, VALID_PASSWORD],
					callback: jest.fn(() => Promise.resolve()),
					expectedEvent: { type: "PASSWORD_RESET_SUCCESS" },
				},
				{
					args: [INVALID_CODE, INVALID_PASSWORD],
					callback: jest.fn(() => Promise.reject()),
					expectedEvent: { type: "PASSWORD_RESET_FAILURE" },
				},
			],
		},
	},
	{
		stateId: AuthStateId.awaitingChangePassword,
		hookSpec: {
			primaryMethod: "submitNewPassword",
			callbacks: [
				{
					args: [VALID_PASSWORD, ANOTHER_VALID_PASSWORD],
					callback: jest.fn(() => Promise.resolve()),
					expectedEvent: { type: "PASSWORD_CHANGE_SUCCESS" },
				},
				{
					args: [INVALID_PASSWORD, INVALID_PASSWORD],
					callback: jest.fn(() => Promise.reject()),
					expectedEvent: { type: "PASSWORD_CHANGE_FAILURE" },
				},
			],
		},
	},
	{
		stateId: AuthStateId.loggingOut,
		hookSpec: {
			primaryMethod: "logOut",
			callbacks: [
				{
					args: [],
					callback: jest.fn(() => Promise.resolve()),
					expectedEvent: { type: "LOG_OUT_SUCCESS" },
				},
				{
					args: [],
					callback: jest.fn(() => Promise.reject()),
					expectedEvent: { type: "LOG_OUT_FAILURE" },
				},
			],
			additionalMethods: [{ method: "cancelLogOut", expectedEvent: { type: "CANCEL_LOG_OUT" } }],
		},
	},
	{
		stateId: AuthStateId.authenticated,
		hookSpec: {
			additionalMethods: [
				{ method: "requestLogOut", expectedEvent: { type: "REQUEST_LOG_OUT" } },
				{ method: "requestPasswordChange", expectedEvent: { type: "REQUEST_PASSWORD_CHANGE" } },
			],
		},
	},
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

			afterEach(cleanup);

			if (hookSpec.callbacks) {
				for (const { args, callback, expectedEvent, runs } of hookSpec.callbacks) {
					test(`${JSON.stringify(expectedEvent)} message sent`, () => {
						const { result, waitForNextUpdate, waitFor } = renderHook(() =>
							AuthHook[hookName](callback)
						);

						for (let i = 0; i < (runs ?? 1); i++) {
							// @ts-ignore
							result.current[hookSpec.primaryMethod](...args);
							waitForNextUpdate();
						}
						waitFor(() => expect(eventSink.event).toEqual(expectedEvent));
					});
				}
			}

			if (hookSpec.additionalMethods) {
				for (const { method, expectedEvent } of hookSpec.additionalMethods) {
					test(`${JSON.stringify(expectedEvent)} message sent`, () => {
						const { result, waitForNextUpdate, waitFor } = renderHook(() =>
							AuthHook[hookName](jest.fn())
						);

						// @ts-ignore
						result.current[method]();
						waitForNextUpdate();
						waitFor(() => expect(eventSink.event).toEqual(expectedEvent));
					});
				}
			}

			test(`${hookName} sends all possible events defined in system for ${stateId}`, () => {
				expect([...eventSink.eventStack]).toEqual(eventsForStates.get(stateId));
			});
		});
	}
});
