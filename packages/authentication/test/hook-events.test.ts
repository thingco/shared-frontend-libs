/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { cleanup, renderHook } from "@testing-library/react-hooks";

import { AuthStateId } from "core/enums";
import { machine } from "core/auth-system";

import { hookTestMap } from "./hook-test-map";
import { AuthHook } from "./hooks";

import type { AuthEvent } from "core/types";

/* ------------------------------------------------------------------------- *\
 * 1. UTILITIES
\* ------------------------------------------------------------------------- */

/**
 * Every exposed state (which describe a stage in the auth process), has
 * a corresponding hook, which handles sending messages to the system.
 *
 * Every exposed state is PascalCase.
 *
 * So
 *
 * @example
 * ```
 * > stateIdToHookName("CheckingForSession")
 * "useCheckingForSession"
 * ```
 */
function stateIdToHookName(stateId: AuthStateId) {
	return `use${stateId}`;
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
	event: AuthEvent | null = null;
	eventStack = new Set();

	log(event: AuthEvent) {
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

jest.mock("core/react/AuthSystemProvider", () => ({
	useAuthInterpreter: jest.fn(() => ({
		send: (event: AuthEvent) => eventSink.log(event),
	})),
}));

/* ------------------------------------------------------------------------- *\
 * 3. TESTS
\* ------------------------------------------------------------------------- */

describe("hooks fire and emit all available transition events that are specified for each state", () => {
	for (const { stateId, hookSpec } of hookTestMap) {
		describe(`hook for ${stateId} sends expected messages`, () => {
			const hookName = stateIdToHookName(stateId) as keyof typeof AuthHook;

			beforeAll(() => {
				eventSink.reset();
			});

			afterEach(cleanup);

			if (hookSpec.primaryMethod && hookSpec.callbacks) {
				for (const { args, callback, expectedEvent, runs } of hookSpec.callbacks) {
					test(`${JSON.stringify(expectedEvent)} message sent`, async () => {
						const { result, waitForNextUpdate, waitFor } = renderHook(() =>
							AuthHook[hookName](callback)
						);

						for (let i = 0; i < (runs ?? 1); i++) {
							// @ts-ignore
							result.current[hookSpec.primaryMethod](...args);

							await waitForNextUpdate();
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
				expect([...eventSink.eventStack]).toEqual(
					expect.arrayContaining(eventsForStates.get(stateId))
				);
			});
		});
	}
});
