/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AuthError, AuthInterpreter } from "@thingco/authentication-core";
import { AuthStateId, createAuthenticationSystem } from "@thingco/authentication-core";
import { createModel } from "@xstate/test";
import assert from "assert";
import { doSend } from "test-utils/do-send";
import { suite } from "uvu";
import { createMachine, interpret } from "xstate";


const subject = createAuthenticationSystem({
	loginFlowType: "OTP",
	deviceSecurityType: "PIN",
});

const machine = createMachine({
	id: "otpValidSessionWithPin",
	initial: "CheckingSession",
	states: {
		CheckingSession: {
			on: {
				THERE_IS_A_SESSION: "CheckingForPin",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.CheckingSession));
				},
			},
		},
		CheckingForPin: {
			on: {
				THERE_IS_A_PIN_SET: "SubmitCurrentPin",
				THERE_IS_NO_PIN_SET: "SetANewPin",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.CheckingForPin));
				},
			},
		},
		SubmitCurrentPin: {
			on: {
				PIN_SUBMITTED_WAS_CORRECT: "Authenticated",
				PIN_SUBMITTED_WAS_NOT_CORRECT: "IncorrectCurrentPin",
				I_FORGOT_MY_PIN: "ResetPin",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.SubmittingCurrentPin));
				},
			},
		},
		IncorrectCurrentPin: {
			on: {
				PIN_SUBMITTED_WAS_CORRECT_ON_SECOND_ATTEMPT: "Authenticated",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.SubmittingCurrentPin));
					assert.equal(service.state.context.error, "PIN_INVALID" as AuthError);
				},
			},
		},
		ResetPin: {
			on: {
				RESET_OF_PIN_SUCCEEDED: "CheckingSession",
				RESET_OF_PIN_FAILED: "ResetPinError",
				NO_ACTUALLY_CANCEL_THAT_RESET_REQUEST: "SubmitCurrentPin",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.ForgottenPinRequestingReset));
				},
			},
		},
		ResetPinError: {
			on: {
				SECOND_RESET_ATTEMPT_SUCCEEDED: "CheckingSession",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.ForgottenPinRequestingReset));
					assert.equal(service.state.context.error, "PIN_RESET_FAILURE" as AuthError);
				},
			},
		},
		SetANewPin: {
			on: {
				NEW_PIN_IS_FINE: "Authenticated",
				NEW_PIN_IS_NOT_FINE: "ErrorSettingNewPin",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.SubmittingNewPin));
				},
			},
		},
		ErrorSettingNewPin: {
			on: {
				NEW_PIN_IS_FINE_ON_SECOND_ATTEMPT: "Authenticated",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.SubmittingNewPin));
					assert.equal(service.state.context.error, "NEW_PIN_INVALID" as AuthError);
				},
			},
		},
		Authenticated: {
			on: {
				CHANGE_CURRENT_PIN_PLEASE: "ValidateCurrentPinBeforeChangingIt",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.Authenticated));
				},
			},
		},
		ValidateCurrentPinBeforeChangingIt: {
			on: {
				PIN_SUBMITTED_WAS_CORRECT: "ChangeCurrentPin",
				PIN_SUBMITTED_WAS_NOT_CORRECT: "IncorrectCurrentPinWhenTryingToChangeIt",
				ACTUALLY_CANCEL_THAT_PIN_CHANGE_REQUEST: "Authenticated",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.AuthenticatedValidatingPin));
				},
			},
		},
		IncorrectCurrentPinWhenTryingToChangeIt: {
			on: {
				PIN_SUBMITTED_WAS_CORRECT_ON_SECOND_ATTEMPT: "ChangeCurrentPin",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.AuthenticatedValidatingPin));
					assert.equal(service.state.context.error, "PIN_INVALID" as AuthError);
				},
			},
		},
		ChangeCurrentPin: {
			on: {
				PIN_CHANGE_SUCCEEDED: "Authenticated",
				PIN_CHANGE_FAILED: "ErrorChangingCurrentPin",
				ACTUALLY_CANCEL_THAT_PIN_CHANGE_REQUEST: "Authenticated",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.AuthenticatedChangingPin));
				},
			},
		},
		ErrorChangingCurrentPin: {
			on: {
				PIN_CHANGE_SUCCEEDED_ON_SECOND_ATTEMPT: "Authenticated",
			},
			meta: {
				test: async (service: AuthInterpreter) => {
					assert.ok(service.state.matches(AuthStateId.AuthenticatedChangingPin));
					assert.equal(service.state.context.error, "PIN_CHANGE_FAILURE" as AuthError);
				},
			},
		},
	},
});

const model = createModel(machine).withEvents({
	THERE_IS_A_SESSION: doSend({ type: "SESSION_PRESENT" }),
	THERE_IS_A_PIN_SET: doSend({ type: "PIN_IS_SET_UP" }),
	THERE_IS_NO_PIN_SET: doSend({ type: "PIN_IS_NOT_SET_UP" }),
	PIN_SUBMITTED_WAS_CORRECT: doSend({ type: "PIN_VALID" }),
	PIN_SUBMITTED_WAS_NOT_CORRECT: doSend({ type: "PIN_INVALID", error: "PIN_INVALID" }),
	PIN_SUBMITTED_WAS_CORRECT_ON_SECOND_ATTEMPT: doSend({ type: "PIN_VALID" }),
	I_FORGOT_MY_PIN: doSend({ type: "REQUEST_PIN_RESET" }),
	RESET_OF_PIN_SUCCEEDED: doSend({ type: "PIN_RESET_SUCCESS" }),
	SECOND_RESET_ATTEMPT_SUCCEEDED: doSend({ type: "PIN_RESET_SUCCESS" }),
	RESET_OF_PIN_FAILED: doSend({ type: "PIN_RESET_FAILURE", error: "PIN_RESET_FAILURE" }),
	NO_ACTUALLY_CANCEL_THAT_RESET_REQUEST: doSend({ type: "CANCEL_PIN_RESET" }),
	NEW_PIN_IS_FINE: doSend({ type: "NEW_PIN_VALID" }),
	NEW_PIN_IS_NOT_FINE: doSend({ type: "NEW_PIN_INVALID", error: "NEW_PIN_INVALID" }),
	NEW_PIN_IS_FINE_ON_SECOND_ATTEMPT: doSend({ type: "NEW_PIN_VALID" }),
	PIN_CHANGE_SUCCEEDED: doSend({ type: "PIN_CHANGE_SUCCESS" }),
	PIN_CHANGE_FAILED: doSend({ type: "PIN_CHANGE_FAILURE", error: "PIN_CHANGE_FAILURE" }),
	PIN_CHANGE_SUCCEEDED_ON_SECOND_ATTEMPT: doSend({ type: "PIN_CHANGE_SUCCESS" }),
	ACTUALLY_CANCEL_THAT_PIN_CHANGE_REQUEST: doSend({ type: "CANCEL_PIN_CHANGE" }),
	CHANGE_CURRENT_PIN_PLEASE: doSend({ type: "REQUEST_PIN_CHANGE" }),
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
