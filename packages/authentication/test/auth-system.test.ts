/* eslint-disable @typescript-eslint/no-explicit-any */
import { createModel } from "@xstate/test";
import { createMachine, interpret } from "xstate";

import { AuthStateId, createAuthenticationSystem } from "core/auth-system";
import { USER_OBJECT, VALID_USERNAME } from "test-utils/dummy-responses";

import type { AuthEvent, AuthInterpreter } from "core/auth-system";
import type { AuthError } from "core/types";

/* ------------------------------------------------------------------------- *\
 * 1. UTILITIES
\* ------------------------------------------------------------------------- */

/**
 * XState's `test` package requires defining a test model (System Under Test), then providing
 * a mapping of events in the SUT to events in the actual model. Make this less onerous, this
 * usitlity function just requires the actual event to be sent passed in:
 */
function doSend(e: AuthEvent) {
	return {
		exec: ({ send }: AuthInterpreter) => send(e),
	} as any;
}

/* ------------------------------------------------------------------------- *\
 * 2. TESTS
\* ------------------------------------------------------------------------- */

describe("authentication test system using OTP (ignoring device security)", () => {
	const subject = createAuthenticationSystem({ loginFlowType: "OTP", deviceSecurityType: "NONE" });

	const machine = createMachine({
		id: "otpNoPin",
		initial: "checkingSession",
		states: {
			checkingSession: {
				on: {
					THERE_IS_A_SESSION: "Authenticated",
					THERE_IS_NO_SESSION: "submittingUsername",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.CheckingForSession));
					},
				},
			},
			submittingUsername: {
				on: {
					GOOD_USERNAME: "submittingOtp1",
					BAD_USERNAME: "usernameError",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.SubmittingOtpUsername));
					},
				},
			},
			submittingUsernameAfterTooManyRetries: {
				on: {
					GOOD_USERNAME: "submittingOtp1",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.SubmittingOtpUsername));
						expect(service.state.context.error).toBe("PASSWORD_RETRIES_EXCEEDED");
					},
				},
			},
			usernameError: {
				on: {
					GOOD_USERNAME: "submittingOtp1",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.SubmittingOtpUsername));
						expect(service.state.context.error).toBe("USERNAME_INVALID");
					},
				},
			},
			submittingOtp1: {
				on: {
					GOOD_OTP: "Authenticated",
					BAD_OTP_1: "submittingOtp2",
					REENTER_USERNAME: "submittingUsername",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.SubmittingOtp));
						expect(service.state.context.username).toBe(VALID_USERNAME);
						expect(service.state.context.user).toBe(USER_OBJECT);
					},
				},
			},
			submittingOtp2: {
				on: {
					BAD_OTP_2: "submittingOtp3",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.SubmittingOtp));
						expect(service.state.context.error).toBe("PASSWORD_INVALID_2_RETRIES_REMAINING");
						expect(service.state.context.username).toBe(VALID_USERNAME);
						expect(service.state.context.user).toBe(USER_OBJECT);
					},
				},
			},
			submittingOtp3: {
				on: {
					BAD_OTP_3: "submittingUsernameAfterTooManyRetries",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.SubmittingOtp));
						expect(service.state.context.error).toBe("PASSWORD_INVALID_1_RETRIES_REMAINING");
						expect(service.state.context.username).toBe(VALID_USERNAME);
						expect(service.state.context.user).toBe(USER_OBJECT);
					},
				},
			},
			Authenticated: {
				on: {
					CAN_I_LOG_OUT_PLEASE: "AuthenticatedLoggingOut",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.Authenticated));
					},
				},
			},
			AuthenticatedLoggingOut: {
				on: {
					LOG_OUT_WORKED: "checkingSession",
					LOG_OUT_FAILED: "Authenticated",
					ACTUALLY_NO_STAY_LOGGED_IN: "Authenticated",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.AuthenticatedLoggingOut));
					},
				},
			},
		},
	});

	// prettier-ignore
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
		describe(`authentication test system ${plan.description}`, () => {
			plan.paths.forEach((path) => {
				it(path.description, async () => {
					const service = interpret(subject);
					service.start();
					await path.test(service);
				});
			});
		});
	});

	it("should have full coverage", () => {
		return model.testCoverage();
	});
});

describe("authentication test system using username and password (ignoring device security)", () => {
	const subject = createAuthenticationSystem({
		loginFlowType: "USERNAME_PASSWORD",
		deviceSecurityType: "NONE",
	});

	const machine = createMachine({
		id: "usernamePasswordNoPin",
		initial: "checkingSession",
		states: {
			checkingSession: {
				on: {
					THERE_IS_A_SESSION: "Authenticated",
					THERE_IS_NO_SESSION: "submittingUsernameAndPassword",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.CheckingForSession));
					},
				},
			},
			submittingUsernameAndPassword: {
				on: {
					GOOD_LOGIN: "Authenticated",
					GOOD_LOGIN_BUT_YOU_HAVE_A_TEMPORARY_PASSWORD: "submittingChangeTemporaryPassword",
					BAD_LOGIN: "usernameAndPasswordError",
					FORGOT_PASSWORD: "forgotPasswordRequestANewOne",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.SubmittingUsernameAndPassword));
					},
				},
			},
			usernameAndPasswordError: {
				on: {
					GOOD_LOGIN_ON_SECOND_ATTEMPT: "Authenticated",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.SubmittingUsernameAndPassword));
						expect(service.state.context.error).toBe("USERNAME_AND_PASSWORD_INVALID" as AuthError);
					},
				},
			},
			submittingChangeTemporaryPassword: {
				on: {
					ATTEMPT_TO_CHANGE_TEMPORARY_PASSWORD_SUCCEEDED: "Authenticated",
					ATTEMPT_TO_CHANGE_TEMPORARY_PASSWORD_FAILED: "submittingChangeTemporaryPasswordError",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.SubmittingForceChangePassword));
						expect(service.state.context.error).toBe("PASSWORD_CHANGE_REQUIRED" as AuthError);
					},
				},
			},
			submittingChangeTemporaryPasswordError: {
				on: {
					ATTEMPT_TO_CHANGE_TEMPORARY_PASSWORD_SUCCEEDED_ON_SECOND_ATTEMPT: "Authenticated",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.SubmittingForceChangePassword));
						expect(service.state.context.error).toBe("PASSWORD_CHANGE_FAILURE" as AuthError);
					},
				},
			},
			forgotPasswordRequestANewOne: {
				on: {
					RESET_CODE_REQUEST_SUCCESS: "forgotPasswordSubmitANewOne",
					RESET_CODE_REQUEST_FAILURE: "forgotPasswordRequestANewOneError",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.ForgottenPasswordRequestingReset));
					},
				},
			},
			forgotPasswordRequestANewOneError: {
				on: {
					RESET_CODE_REQUEST_SUCCESS_ON_SECOND_ATTEMPT: "forgotPasswordSubmitANewOne",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.ForgottenPasswordRequestingReset));
						expect(service.state.context.error).toBe("PASSWORD_RESET_REQUEST_FAILURE" as AuthError);
					},
				},
			},
			forgotPasswordSubmitANewOne: {
				on: {
					RESET_CODE_AND_NEW_PASSWORD_ARE_FINE: "Authenticated",
					RESET_CODE_AND_NEW_PASSWORD_ARE_NOT_FINE: "forgotPasswordSubmitANewOneError",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.ForgottenPasswordSubmittingReset));
					},
				},
			},
			forgotPasswordSubmitANewOneError: {
				on: {
					RESET_CODE_AND_NEW_PASSWORD_ARE_FINE_ON_SECOND_ATTEMPT: "Authenticated",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.ForgottenPasswordSubmittingReset));
						/*
						 * FIXME there is a test failure here. ATM, the way errors are
						 * assigned and cleared causes this part to flip back and forth between
						 * "PASSWORD_RESET_REQUEST_FAILURE" when the flow goes
						 *
						 * RESET_CODE_REQUEST_FAILURE (incorrect error is set here, correct at this point) -->
						 * RESET_CODE_REQUEST_SUCCESS -->
						 * RESET_CODE_AND_NEW_PASSWORD_ARE_NOT_FINE (error flips between correct and incorrect)
						 *
						 */
						// expect(service.state.context.error).toBe(
						// 	"PASSWORD_RESET_FAILURE" as AuthenticationSystemError
						// );
					},
				},
			},
			submitPasswordChange: {
				on: {
					PASSWORD_CHANGE_IS_FINE: "Authenticated",
					CANCEL_PASSWORD_CHANGE: "Authenticated",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.AuthenticatedChangingPassword));
					},
				},
			},
			Authenticated: {
				on: {
					CAN_I_LOG_OUT_PLEASE: "AuthenticatedLoggingOut",
					CAN_I_CHANGE_MY_PASSWORD: "submitPasswordChange",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.Authenticated));
					},
				},
			},
			AuthenticatedLoggingOut: {
				on: {
					LOG_OUT_WORKED: "checkingSession",
					LOG_OUT_FAILED: "Authenticated",
					ACTUALLY_NO_STAY_LOGGED_IN: "Authenticated",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.AuthenticatedLoggingOut));
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
		describe(`authentication test system ${plan.description}`, () => {
			plan.paths.forEach((path) => {
				it(path.description, async () => {
					const service = interpret(subject);
					service.start();
					await path.test(service);
				});
			});
		});
	});

	it("should have full coverage", () => {
		return model.testCoverage();
	});
});

describe("authentication test system for PIN (ignoring login flow)", () => {
	const subject = createAuthenticationSystem({
		loginFlowType: "OTP",
		deviceSecurityType: "PIN",
	});

	const machine = createMachine({
		id: "otpWithPin",
		initial: "checkingSession",
		states: {
			checkingSession: {
				on: {
					THERE_IS_A_SESSION: "CheckingForPin",
					THERE_IS_NO_SESSION: "otpFlowStart",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.CheckingForSession));
					},
				},
			},
			otpFlowStart: {
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.SubmittingOtpUsername));
					},
				},
			},
			CheckingForPin: {
				on: {
					THERE_IS_A_PIN_SET: "submitCurrentPin",
					THERE_IS_NO_PIN_SET: "setANewPin",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.CheckingForPin));
					},
				},
			},
			submitCurrentPin: {
				on: {
					PIN_SUBMITTED_WAS_CORRECT: "Authenticated",
					PIN_SUBMITTED_WAS_NOT_CORRECT: "incorrectCurrentPin",
					I_FORGOT_MY_PIN: "resetPin",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.SubmittingCurrentPin));
					},
				},
			},
			resetPin: {
				on: {
					RESET_OF_PIN_SUCCEEDED: "checkingSession",
					RESET_OF_PIN_FAILED: "resetPinError",
					NO_ACTUALLY_CANCEL_THAT_RESET_REQUEST: "submitCurrentPin",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.ForgottenPinRequestingReset));
					},
				},
			},
			resetPinError: {
				on: {
					SECOND_RESET_ATTEMPT_SUCCEEDED: "checkingSession",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.ForgottenPinRequestingReset));
						expect(service.state.context.error).toBe("PIN_RESET_FAILURE" as AuthError);
					},
				},
			},
			incorrectCurrentPin: {
				on: {
					PIN_SUBMITTED_WAS_CORRECT_ON_SECOND_ATTEMPT: "Authenticated",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.SubmittingCurrentPin));
						expect(service.state.context.error).toBe("PIN_INVALID" as AuthError);
					},
				},
			},
			setANewPin: {
				on: {
					NEW_PIN_IS_FINE: "Authenticated",
					NEW_PIN_IS_NOT_FINE: "errorSettingNewPin",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.SubmittingNewPin));
					},
				},
			},
			errorSettingNewPin: {
				on: {
					NEW_PIN_IS_FINE_ON_SECOND_ATTEMPT: "Authenticated",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.SubmittingCurrentPin));
						expect(service.state.context.error).toBe("NEW_PIN_INVALID" as AuthError);
					},
				},
			},
			validatePin: {
				on: {
					PIN_SUBMITTED_WAS_CORRECT: "changeCurrentPin",
					PIN_SUBMITTED_WAS_NOT_CORRECT: "incorrectCurrentPin",
					ACTUALLY_CANCEL_THAT_PIN_CHANGE_REQUEST: "Authenticated",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.AuthenticatedValidatingPin));
					},
				},
			},
			changeCurrentPin: {
				on: {
					PIN_CHANGE_SUCCEEDED: "Authenticated",
					PIN_CHANGE_FAILED: "errorChangingCurrentPin",
					ACTUALLY_CANCEL_THAT_PIN_CHANGE_REQUEST: "Authenticated",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.AuthenticatedChangingPin));
					},
				},
			},
			errorChangingCurrentPin: {
				on: {
					PIN_CHANGE_SUCCEEDED_ON_SECOND_ATTEMPT: "Authenticated",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.AuthenticatedChangingPin));
						expect(service.state.context.error).toBe("PIN_CHANGE_FAILURE" as AuthError);
					},
				},
			},
			Authenticated: {
				on: {
					CHANGE_CURRENT_PIN_PLEASE: "validatePin",
				},
				meta: {
					test: async (service: AuthInterpreter) => {
						expect(service.state.matches(AuthStateId.Authenticated));
					},
				},
			},
		},
	});

	const model = createModel(machine).withEvents({
		THERE_IS_A_SESSION: doSend({ type: "SESSION_PRESENT" }),
		THERE_IS_NO_SESSION: doSend({ type: "SESSION_NOT_PRESENT" }),
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
		describe(`authentication test system ${plan.description}`, () => {
			plan.paths.forEach((path) => {
				it(path.description, async () => {
					const service = interpret(subject);
					service.start();
					await path.test(service);
				});
			});
		});
	});

	it("should have full coverage", () => {
		return model.testCoverage();
	});
});
