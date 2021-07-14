import { createModel } from "@xstate/test";
import { createMachine, interpret } from "xstate";

import { authSystemModel, createAuthSystem } from "../auth-system";
import { DummyUsernamePasswordService } from "./dummy-username-password-service";

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
				test: async (service) => {
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
				test: async (service) => {
					const { context, matches } = service.state;
					expect(context.forceSessionCheckFailure).toBe(true);
					expect(matches("usernamePasswordInput")).toBe(true);
				},
			},
		},
		authorised: {
			on: {
				LOG_OUT: "usernamePasswordInput",
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
		exec: ({ send }) => send(authSystemModel.events.CHECK_FOR_SESSION(false)),
	},
	SESSION_NOT_PRESENT: {
		exec: ({ send }) => send(authSystemModel.events.CHECK_FOR_SESSION(true)),
	},
	VALID_USERNAME_PASSWORD_INPUT: {
		exec: ({ send }) =>
			send(authSystemModel.events.SUBMIT_USERNAME_AND_PASSWORD("validuser@example.com", "123456")),
	},
	INVALID_USERNAME_PASSWORD_INPUT: {
		exec: ({ send }) =>
			send(
				authSystemModel.events.SUBMIT_USERNAME_AND_PASSWORD("invaliduser@bad.com", "badpassword")
			),
	},
	LOG_OUT: {
		exec: ({ send }) => send(authSystemModel.events.LOG_OUT()),
	},
});

describe("simple username/password auth flow", () => {
	const testPlans = testModel.getSimplePathPlans();
	const configuredSubject = createAuthSystem({
		usernamePasswordServiceInstance: DummyUsernamePasswordService.init({
			testUsername: "validuser@example.com",
			testPassword: "123456",
		}),
		loginFlowType: "USERNAME_PASSWORD",
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
