/* eslint-disable @typescript-eslint/no-explicit-any */
import { createModel } from "@xstate/test";
import { createMachine, interpret } from "xstate";

import { authSystemModel, createAuthSystem } from "../authentication-system";
import { VALID_PASSWORD, VALID_USERNAME } from "./mock-inputs";
import { createMockUsernamePasswordService } from "./mock-username-password-service";

import type { Interpreter } from "xstate";
import type { ModelContextFrom, ModelEventsFrom } from "xstate/lib/model";

type Service = Interpreter<
	ModelContextFrom<typeof authSystemModel>,
	any,
	ModelEventsFrom<typeof authSystemModel>
>;

const testMachine = createMachine({
	id: "simpleUsernamePasswordTestMachine",
	initial: "sessionChecking",
	states: {
		sessionChecking: {
			on: {
				SESSION_PRESENT: "authorised",
				SESSION_NOT_PRESENT: "usernamePasswordInput",
			},
			meta: {
				test: async (service: Service) => {
					const { context, matches } = service.state;
					expect(context.loginFlowType).toBe("USERNAME_PASSWORD");
					expect(matches("checkingSession")).toBe(true);
				},
			},
		},
		usernamePasswordInput: {
			on: {
				VALID_USERNAME_PASSWORD_INPUT: "authorised",
				INVALID_USERNAME_PASSWORD_INPUT: "usernamePasswordInput",
			},
			meta: {
				test: async (service: Service) => {
					const { matches } = service.state;
					// expect(context.forceSessionCheckFailure).toBe(true);
					expect(matches("usernamePasswordInput")).toBe(true);
				},
			},
		},
		authorised: {
			on: {
				LOG_OUT: "usernamePasswordInput",
			},
			meta: {
				test: async (service: Service) => {
					const { matches } = service.state;
					expect(matches("authorised")).toBe(true);
				},
			},
		},
	},
});

const testModel = createModel(testMachine).withEvents({
	SESSION_PRESENT: {
		exec: ({ send }: Service) => send(authSystemModel.events.CHECK_FOR_SESSION("normal")),
	} as any,
	SESSION_NOT_PRESENT: {
		exec: ({ send }: Service) => send(authSystemModel.events.CHECK_FOR_SESSION("forceFailure")),
	} as any,
	VALID_USERNAME_PASSWORD_INPUT: {
		exec: ({ send }: Service) =>
			send(authSystemModel.events.SUBMIT_USERNAME_AND_PASSWORD(VALID_USERNAME, VALID_PASSWORD)),
	} as any,
	INVALID_USERNAME_PASSWORD_INPUT: {
		exec: ({ send }: Service) =>
			send(
				authSystemModel.events.SUBMIT_USERNAME_AND_PASSWORD("invaliduser@bad.com", "badpassword")
			),
	} as any,
	LOG_OUT: {
		exec: ({ send }: Service) => send(authSystemModel.events.LOG_OUT()),
	} as any,
});

describe("simple username/password auth flow", () => {
	const testPlans = testModel.getSimplePathPlans();
	const usernamePasswordServiceApi = createMockUsernamePasswordService();
	const configuredSubject = createAuthSystem({
		loginFlowType: "USERNAME_PASSWORD",
		usernamePasswordServiceApi,
	});

	testPlans.forEach((plan) => {
		describe(plan.description, () => {
			plan.paths.forEach((path) => {
				it(path.description, async () => {
					const service = interpret(configuredSubject).onTransition((/* state*/) => {
						// NOTE test logging for debugging purposes goes here.
						// console.log(`${path.description}: ${state.value}`);
					});
					service.start();
					await path.test(service);
				});
			});
		});
	});

	it("should have full coverage", () => {
		return testModel.testCoverage();
	});
});
