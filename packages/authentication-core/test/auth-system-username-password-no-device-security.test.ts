/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AuthError, AuthInterpreter } from "@thingco/authentication-core";
import { AuthStateId, createAuthenticationSystem } from "@thingco/authentication-core";
import { createModel } from "@xstate/test";
import assert from "assert";
import { doSend } from "test-utils/do-send";
import { USER_OBJECT, VALID_USERNAME } from "test-utils/dummy-responses";
import { suite } from "uvu";
import { createMachine, interpret } from "xstate";


const subject = createAuthenticationSystem({
	loginFlowType: "USERNAME_PASSWORD",
	deviceSecurityType: "NONE",
});

const machine = createMachine({
	id: "usernamePasswordNoPin",
	initial: "CheckingSession",
	states: {
		CheckingSession: {
			on: {
				THERE_IS_A_SESSION: "Authenticated",
				THERE_IS_NO_SESSION: "SubmittingUsernameAndPassword",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.CheckingSession));
				},
			},
		},
		SubmittingUsernameAndPassword: {
			on: {
				GOOD_LOGIN: "Authenticated",
				GOOD_LOGIN_BUT_YOU_HAVE_A_TEMPORARY_PASSWORD: "SubmittingChangeTemporaryPassword",
				BAD_LOGIN: "UsernameAndPasswordError",
				FORGOT_PASSWORD: "ForgotPasswordRequestANewOne",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.SubmittingUsernameAndPassword));
				},
			},
		},
		UsernameAndPasswordError: {
			on: {
				GOOD_LOGIN_ON_SECOND_ATTEMPT: "Authenticated",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.SubmittingUsernameAndPassword));
					assert.equal(service.state.context.error, "USERNAME_AND_PASSWORD_INVALID" as AuthError);
				},
			},
		},
		SubmittingChangeTemporaryPassword: {
			on: {
				ATTEMPT_TO_CHANGE_TEMPORARY_PASSWORD_SUCCEEDED: "Authenticated",
				ATTEMPT_TO_CHANGE_TEMPORARY_PASSWORD_FAILED: "SubmittingChangeTemporaryPasswordError",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.SubmittingForceChangePassword));
					assert.equal(service.state.context.error, "PASSWORD_CHANGE_REQUIRED" as AuthError);
				},
			},
		},
		SubmittingChangeTemporaryPasswordError: {
			on: {
				ATTEMPT_TO_CHANGE_TEMPORARY_PASSWORD_SUCCEEDED_ON_SECOND_ATTEMPT: "Authenticated",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.SubmittingForceChangePassword));
					assert.equal(service.state.context.error, "PASSWORD_CHANGE_FAILURE" as AuthError);
				},
			},
		},
		ForgotPasswordRequestANewOne: {
			on: {
				RESET_CODE_REQUEST_SUCCESS: "ForgotPasswordSubmitANewOne",
				RESET_CODE_REQUEST_FAILURE: "ForgotPasswordRequestANewOneError",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.ForgottenPasswordRequestingReset));
				},
			},
		},
		ForgotPasswordRequestANewOneError: {
			on: {
				RESET_CODE_REQUEST_SUCCESS_ON_SECOND_ATTEMPT: "ForgotPasswordSubmitANewOne",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.ForgottenPasswordRequestingReset));
					assert.equal(service.state.context.error, "PASSWORD_RESET_REQUEST_FAILURE" as AuthError);
				},
			},
		},
		ForgotPasswordSubmitANewOne: {
			on: {
				RESET_CODE_AND_NEW_PASSWORD_ARE_FINE: "ConfirmEverythingLooksOkWithThatPasswordChange",
				RESET_CODE_AND_NEW_PASSWORD_ARE_NOT_FINE: "ForgotPasswordSubmitANewOneError",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.ForgottenPasswordSubmittingReset));
				},
			},
		},
		ForgotPasswordSubmitANewOneError: {
			on: {
				RESET_CODE_AND_NEW_PASSWORD_ARE_FINE_ON_SECOND_ATTEMPT: "ConfirmEverythingLooksOkWithThatPasswordChange",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.ForgottenPasswordSubmittingReset));
				},
			},
		},
		ConfirmEverythingLooksOkWithThatPasswordChange: {
			on: {
				YEP_PASSWORD_CHANGE_IS_OK: "SubmittingUsernameAndPassword",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.ForgottenPasswordResetSuccess));
				},
			},
		},
		Authenticated: {
			on: {
				CAN_I_LOG_OUT_PLEASE: "AuthenticatedLoggingOut",
				CAN_I_CHANGE_MY_PASSWORD: "SubmitPasswordChange",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.Authenticated));
				},
			},
		},
		SubmitPasswordChange: {
			on: {
				PASSWORD_CHANGE_IS_FINE: "Authenticated",
				CANCEL_PASSWORD_CHANGE: "Authenticated",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.AuthenticatedChangingPassword));
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

// prettier-ignore
const model = createModel(machine).withEvents({
	THERE_IS_A_SESSION: doSend({ type: "SESSION_PRESENT"}),
	THERE_IS_NO_SESSION: doSend({ type: "SESSION_NOT_PRESENT"}),
	GOOD_LOGIN: doSend({ type: "USERNAME_AND_PASSWORD_VALID", username: VALID_USERNAME, user: USER_OBJECT }),
	BAD_LOGIN: doSend({ type: "USERNAME_AND_PASSWORD_INVALID", error: "USERNAME_AND_PASSWORD_INVALID"}),
	GOOD_LOGIN_ON_SECOND_ATTEMPT: doSend({ type: "USERNAME_AND_PASSWORD_VALID", username: VALID_USERNAME, user: USER_OBJECT }),
	GOOD_LOGIN_BUT_YOU_HAVE_A_TEMPORARY_PASSWORD: doSend({ type: "USERNAME_AND_PASSWORD_VALID_PASSWORD_CHANGE_REQUIRED", error: "PASSWORD_CHANGE_REQUIRED", username: VALID_USERNAME, user: USER_OBJECT }),
	ATTEMPT_TO_CHANGE_TEMPORARY_PASSWORD_SUCCEEDED: doSend({ type: "PASSWORD_CHANGE_SUCCESS" }),
	ATTEMPT_TO_CHANGE_TEMPORARY_PASSWORD_FAILED: doSend({ type: "PASSWORD_CHANGE_FAILURE", error: "PASSWORD_CHANGE_FAILURE" }),
	ATTEMPT_TO_CHANGE_TEMPORARY_PASSWORD_SUCCEEDED_ON_SECOND_ATTEMPT: doSend({ type: "PASSWORD_CHANGE_SUCCESS" }),
	FORGOT_PASSWORD: doSend({ type: "FORGOTTEN_PASSWORD"}),
	NEW_PASSWORD_IS_FINE: doSend({ type: "PASSWORD_CHANGE_SUCCESS" }),
	NEW_PASSWORD_IS_NOT_FINE: doSend({ type: "PASSWORD_CHANGE_FAILURE", error: "PASSWORD_CHANGE_FAILURE" }),
	NEW_PASSWORD_IS_FINE_ON_SECOND_ATTEMPT: doSend({ type: "PASSWORD_CHANGE_SUCCESS" }),
	YEP_PASSWORD_CHANGE_IS_OK: doSend({ type: "PASSWORD_RESET_SUCCESS" }),
	RESET_CODE_REQUEST_SUCCESS: doSend({ type: "PASSWORD_RESET_REQUEST_SUCCESS", username: VALID_USERNAME }),
	RESET_CODE_REQUEST_FAILURE: doSend({ type: "PASSWORD_RESET_REQUEST_FAILURE", error: "PASSWORD_RESET_REQUEST_FAILURE"}),
	RESET_CODE_REQUEST_SUCCESS_ON_SECOND_ATTEMPT: doSend({ type: "PASSWORD_RESET_REQUEST_SUCCESS", username: VALID_USERNAME }),
	RESET_CODE_AND_NEW_PASSWORD_ARE_FINE: doSend({ type: "PASSWORD_RESET_SUCCESS" }),
	RESET_CODE_AND_NEW_PASSWORD_ARE_NOT_FINE: doSend({ type: "PASSWORD_RESET_FAILURE", error: "PASSWORD_RESET_FAILURE" }),
	RESET_CODE_AND_NEW_PASSWORD_ARE_FINE_ON_SECOND_ATTEMPT: doSend({ type: "PASSWORD_RESET_SUCCESS" }),
	CAN_I_LOG_OUT_PLEASE: doSend({ type: "REQUEST_LOG_OUT" }),
	CAN_I_CHANGE_MY_PASSWORD: doSend({ type: "REQUEST_PASSWORD_CHANGE"}),
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
