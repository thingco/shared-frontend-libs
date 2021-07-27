/* eslint-disable @typescript-eslint/no-explicit-any */
import { createModel } from "@xstate/test";
import { createMachine, interpret } from "xstate";

import { authSystemModel, createAuthSystem } from "../auth-system";
import { VALID_PASSWORD, VALID_USERNAME } from "./mock-inputs";
import { createMockOTPService } from "./mock-otp-service";

import type { Interpreter, ContextFrom, EventFrom } from "xstate";

type Service = Interpreter<
	ContextFrom<typeof authSystemModel>,
	any,
	EventFrom<typeof authSystemModel>
>;

const testMachine = createMachine({
	id: "otpTestMachine",
	initial: "sessionChecking",
	states: {
		sessionChecking: {
			on: {
				SESSION_PRESENT: "authorised",
				SESSION_NOT_PRESENT: "usernameInput",
			},
			meta: {
				test: async (service: Service) => {
					const { context, matches } = service.state;
					expect(context.loginFlowType).toBe("OTP");
					expect(matches("otpFlowInit")).toBe(true);
				},
			},
		},
		usernameInput: {
			on: {
				VALID_USERNAME_INPUT: "passwordInput",
				INVALID_USERNAME_INPUT: "usernameInput",
			},
			meta: {
				test: async (service: Service) => {
					const { matches } = service.state;
					// expect(context.sessionCheckBehaviour).toBe("forceFailure");
					expect(matches("otpUsernameInput")).toBe(true);
				},
			},
		},
		passwordInput: {
			on: {
				VALID_PASSWORD_INPUT: "authorised",
				INVALID_PASSWORD_INPUT: "usernameInput",
			},
			meta: {
				test: async (service: Service) => {
					const { matches } = service.state;
					// expect(context.sessionCheckBehaviour).toBe("forceFailure");
					expect(matches("otpPasswordInput")).toBe(true);
				},
			},
		},
		authorised: {
			on: {
				LOG_OUT: "usernameInput",
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
		exec: ({ send }: Service) => send(authSystemModel.events.CHECK_FOR_SESSION("forceSuccess")),
	} as any,
	SESSION_NOT_PRESENT: {
		exec: ({ send }: Service) => send(authSystemModel.events.CHECK_FOR_SESSION("forceFailure")),
	} as any,
	VALID_USERNAME_INPUT: {
		exec: ({ send }: Service) => send(authSystemModel.events.SUBMIT_USERNAME(VALID_USERNAME)),
	} as any,
	INVALID_USERNAME_INPUT: {
		exec: ({ send }: Service) =>
			send(authSystemModel.events.SUBMIT_USERNAME("invaliduser@bad.com")),
	} as any,
	VALID_PASSWORD_INPUT: {
		exec: ({ send }: Service) => send(authSystemModel.events.SUBMIT_PASSWORD(VALID_PASSWORD)),
	} as any,
	INVALID_PASSWORD_INPUT: {
		exec: ({ send }: Service) => send(authSystemModel.events.SUBMIT_PASSWORD("badpassword")),
	} as any,
	LOG_OUT: {
		exec: ({ send }: Service) => send(authSystemModel.events.LOG_OUT()),
	} as any,
});

describe("simple OTP auth flow", () => {
	const testPlans = testModel.getSimplePathPlans();
	const otpServiceApi = createMockOTPService();
	const configuredSubject = createAuthSystem({
		otpServiceApi,
	});

	testPlans.forEach((plan) => {
		describe(plan.description, () => {
			plan.paths.forEach((path) => {
				it(path.description, async () => {
					const service = interpret(configuredSubject).onTransition((/* state */) => {
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
