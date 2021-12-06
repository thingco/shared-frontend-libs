import type { AuthInterpreter } from "@thingco/authentication-core";
import { AuthStateId, createAuthenticationSystem } from "@thingco/authentication-core";
import { createModel } from "@xstate/test";
import assert from "assert";
import { doSend } from "test-utils/do-send";
import { USER_OBJECT, VALID_USERNAME } from "test-utils/dummy-responses";
import { suite } from "uvu";
import { createMachine, interpret } from "xstate";


const subject = createAuthenticationSystem({
	loginFlowType: "OTP",
	deviceSecurityType: "PIN",
});

const machine = createMachine({
	id: "otpInvalidSessionWithPin",
	initial: "CheckingSession",
	states: {
		CheckingSession: {
			on: {
				THERE_IS_NO_SESSION: "OtpFlowStart",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.CheckingSession));
				},
			},
		},
		OtpFlowStart: {
			on: {
				GOOD_USERNAME: "CompleteOtpFlow"
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.SubmittingOtpUsername));
				},
			},
		},
		CompleteOtpFlow: {
			on: {
				GOOD_OTP: "CheckingForPin"
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.SubmittingOtp));
				},
			},
		},
		CheckingForPin: {
			on: {
				THERE_IS_A_PIN_SET: "Authenticated",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.CheckingForPin));
				},
			},
		},
		Authenticated: {
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.Authenticated));
				},
			},
		},
	},
});

const model = createModel(machine).withEvents({
	GOOD_USERNAME: doSend({ type: "USERNAME_VALID", username: VALID_USERNAME, user: USER_OBJECT }),
	GOOD_OTP: doSend({ type: "OTP_VALID" }),
	THERE_IS_NO_SESSION: doSend({ type: "SESSION_NOT_PRESENT" }),
	THERE_IS_A_PIN_SET: doSend({ type: "PIN_IS_SET_UP" }),
});

const testPlans = model.getSimplePathPlans();

testPlans.forEach((plan) => {
	const testPlanExecutors = suite(`authentication test system ${plan.description}`);
	plan.paths.forEach((path) => {
		testPlanExecutors(path.description, async () => {
			const service = interpret(subject);
			service.start();
			await path.test(service);
		});
	});
	testPlanExecutors.run();
});

const additionalTests = suite("additional tests");

additionalTests("system test should have full coverage", () => {
	return model.testCoverage();
});

additionalTests.run();
