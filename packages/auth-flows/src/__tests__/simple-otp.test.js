import { createModel } from "@xstate/test";
import { createMachine, interpret } from "xstate";

import { authSystemModel, createAuthSystem } from "../auth-system";
import { DummyOTPService } from "./dummy-otp-service";

const testMachine = createMachine({
	id: "simpleOTPTestMachine",
	initial: "sessionChecking",
	states: {
		sessionChecking: {
			on: {
				SESSION_PRESENT: "authorised",
				SESSION_NOT_PRESENT: "usernameInput",
			},
			meta: {
				test: async (service) => {
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
				test: async (service) => {
					const { context, matches } = service.state;
					expect(context.sessionCheckBehaviour).toBe("forceFailure");
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
				test: async (service) => {
					const { context, matches } = service.state;
					expect(context.sessionCheckBehaviour).toBe("forceFailure");
					expect(matches("otpPasswordInput")).toBe(true);
				},
			},
		},
		authorised: {
			on: {
				LOG_OUT: "usernameInput",
			},
			meta: {
				test: async (service) => {
					const { matches } = service.state;
					expect(matches("authorised")).toBe(true);
				},
			},
		},
	},
});

const testModel = createModel(testMachine).withEvents({
	SESSION_PRESENT: {
		exec: ({ send }) => send(authSystemModel.events.CHECK_FOR_SESSION("forceSuccess")),
	},
	SESSION_NOT_PRESENT: {
		exec: ({ send }) => send(authSystemModel.events.CHECK_FOR_SESSION("forceFailure")),
	},
	VALID_USERNAME_INPUT: {
		exec: ({ send }) => send(authSystemModel.events.SUBMIT_USERNAME("validuser@example.com")),
	},
	INVALID_USERNAME_INPUT: {
		exec: ({ send }) => send(authSystemModel.events.SUBMIT_USERNAME("invaliduser@bad.com")),
	},
	VALID_PASSWORD_INPUT: {
		exec: ({ send }) => send(authSystemModel.events.SUBMIT_PASSWORD("123456")),
	},
	INVALID_PASSWORD_INPUT: {
		exec: ({ send }) => send(authSystemModel.events.SUBMIT_PASSWORD("badpassword")),
	},
	LOG_OUT: {
		exec: ({ send }) => send(authSystemModel.events.LOG_OUT()),
	},
});

describe("simple OTP auth flow", () => {
	const testPlans = testModel.getSimplePathPlans();
	const configuredSubject = createAuthSystem({
		otpServiceInstance: DummyOTPService.init({
			testUsername: "validuser@example.com",
			testPassword: "123456",
		}),
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
