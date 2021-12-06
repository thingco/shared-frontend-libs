/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AuthInterpreter } from "@thingco/authentication-core";
import { AuthStateId, createAuthenticationSystem } from "@thingco/authentication-core";
import { createModel } from "@xstate/test";
import assert from "assert";
import { doSend } from "test-utils/do-send";
import { USER_OBJECT, VALID_USERNAME } from "test-utils/dummy-responses";
import { suite } from "uvu";
import { createMachine, interpret } from "xstate";


const subject = createAuthenticationSystem({ loginFlowType: "OTP", deviceSecurityType: "NONE" });

const machine = createMachine({
	id: "otpNoPin",
	initial: "CheckingSession",
	states: {
		CheckingSession: {
			on: {
				THERE_IS_A_SESSION: "Authenticated",
				THERE_IS_NO_SESSION: "SubmittingUsername",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.CheckingSession));
				},
			},
		},
		SubmittingUsername: {
			on: {
				GOOD_USERNAME: "SubmittingOtp1",
				BAD_USERNAME: "UsernameError",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.SubmittingOtpUsername));
				},
			},
		},
		SubmittingUsernameAfterTooManyRetries: {
			on: {
				GOOD_USERNAME: "SubmittingOtp1",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.SubmittingOtpUsername));
					assert.equal(service.state.context.error, "PASSWORD_RETRIES_EXCEEDED");
				},
			},
		},
		UsernameError: {
			on: {
				GOOD_USERNAME: "SubmittingOtp1",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.SubmittingOtpUsername));
					assert.equal(service.state.context.error, "USERNAME_INVALID");
				},
			},
		},
		SubmittingOtp1: {
			on: {
				GOOD_OTP: "Authenticated",
				BAD_OTP_1: "SubmittingOtp2",
				REENTER_USERNAME: "SubmittingUsername",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.SubmittingOtp));
					assert.equal(service.state.context.username, VALID_USERNAME);
					assert.equal(service.state.context.user, USER_OBJECT);
				},
			},
		},
		SubmittingOtp2: {
			on: {
				BAD_OTP_2: "SubmittingOtp3",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.SubmittingOtp));
					assert.equal(service.state.context.error, "PASSWORD_INVALID_2_RETRIES_REMAINING");
					assert.equal(service.state.context.username, VALID_USERNAME);
					assert.equal(service.state.context.user, USER_OBJECT);
				},
			},
		},
		SubmittingOtp3: {
			on: {
				BAD_OTP_3: "SubmittingUsernameAfterTooManyRetries",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.SubmittingOtp));
					assert.equal(service.state.context.error, "PASSWORD_INVALID_1_RETRIES_REMAINING");
					assert.equal(service.state.context.username, VALID_USERNAME);
					assert.equal(service.state.context.user, USER_OBJECT);
				},
			},
		},
		Authenticated: {
			on: {
				CAN_I_LOG_OUT_PLEASE: "AuthenticatedLoggingOut",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.Authenticated));
				},
			},
		},
		AuthenticatedLoggingOut: {
			on: {
				LOG_OUT_WORKED: "CheckingSession",
				LOG_OUT_FAILED: "Authenticated",
				ACTUALLY_NO_STAY_LOGGED_IN: "Authenticated",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.AuthenticatedLoggingOut));
				},
			},
		},
	},
});

const model = createModel(machine).withEvents({
	THERE_IS_A_SESSION: doSend({ type: "SESSION_PRESENT"}),
	THERE_IS_NO_SESSION: doSend({ type: "SESSION_NOT_PRESENT"}),
	GOOD_USERNAME: doSend({ type: "USERNAME_VALID", username: VALID_USERNAME, user: USER_OBJECT }),
	BAD_USERNAME: doSend({ type: "USERNAME_INVALID", error: "USERNAME_INVALID" }),
	GOOD_OTP: doSend({ type: "OTP_VALID" }),
	BAD_OTP_1: doSend({ type: "OTP_INVALID", error: "PASSWORD_INVALID_2_RETRIES_REMAINING" }),
	BAD_OTP_2: doSend({ type: "OTP_INVALID", error: "PASSWORD_INVALID_1_RETRIES_REMAINING" }),
	BAD_OTP_3: doSend({ type: "OTP_INVALID_RETRIES_EXCEEDED", error: "PASSWORD_RETRIES_EXCEEDED"}),
	REENTER_USERNAME: doSend({ type: "GO_BACK"}),
	CAN_I_LOG_OUT_PLEASE: doSend({ type: "REQUEST_LOG_OUT" }),
	LOG_OUT_WORKED: doSend({ type: "LOG_OUT_SUCCESS"}),
	LOG_OUT_FAILED: doSend({ type: "LOG_OUT_FAILURE", error: "LOG_OUT_FAILURE" }),
	ACTUALLY_NO_STAY_LOGGED_IN: doSend({ type: "CANCEL_LOG_OUT" }),
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
