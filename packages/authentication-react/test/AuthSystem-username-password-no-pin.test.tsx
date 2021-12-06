/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import * as td from "testdouble";
import { suite } from "uvu";
import { render, cleanup } from "@testing-library/react";
import { AuthStateId, } from "@thingco/authentication-core";
import { AuthProvider } from "@thingco/authentication-react";
import { createModel } from "@xstate/test";
import React from "react";
import {
    MOCK_INVALID_CODE,
    MOCK_INVALID_PASSWORD,
    MOCK_INVALID_USERNAME, MOCK_USER_OBJECT, MOCK_VALID_CODE,
    MOCK_VALID_PASSWORD,
    MOCK_VALID_USERNAME
} from "test-utils/dummy-responses";
import { createMachine } from "xstate";
import {
	Reporter,
	ReporterAssertions,
	CommonAssertions,
	CheckingSession,
	CheckingSessionEvents,
	checkSessionCb,
	SubmittingUsernameAndPassword,
	SubmittingUsernameAndPasswordEvents,
	validateUsernameAndPasswordCb,
	SubmittingForceChangePassword,
	SubmittingForceChangePasswordEvents,
	validateForceChangePasswordCb,
	ForgottenPasswordRequestingReset,
	ForgottenPasswordRequestingResetEvents,
	requestNewPasswordCb,
	ForgottenPasswordSubmittingReset,
	ForgottenPasswordSubmittingResetEvents,
	submitNewPasswordCb,
	ForgottenPasswordResetSuccess,
	ForgottenPasswordResetSuccessEvents,
	Authenticated,
	AuthenticatedEvents,
	AuthenticatedLoggingOut,
	AuthenticatedLoggingOutEvents,
	logoutCb,
	AuthenticatedChangingPassword,
	AuthenticatedChangingPasswordEvents,
	changePasswordCb,
	AuthenticatedPasswordChangeSuccess,
	AuthenticatedPasswordChangeSuccessEvents,
} from "./stages";

/* ------------------------------------------------------------------------- *\
 * SYSTEM UNDER TEST
\* ------------------------------------------------------------------------- */

const SUT = () => (
	<AuthProvider
		loginFlowType="USERNAME_PASSWORD"
		deviceSecurityType="NONE"
		allowedOtpRetries={3}
	>
		<Reporter />
		<CheckingSession/>
		<SubmittingUsernameAndPassword />
		<SubmittingForceChangePassword />
		<ForgottenPasswordRequestingReset />
		<ForgottenPasswordSubmittingReset />
		<ForgottenPasswordResetSuccess />
		<Authenticated/>
		<AuthenticatedLoggingOut/>
		<AuthenticatedChangingPassword />
		<AuthenticatedPasswordChangeSuccess />
	</AuthProvider>
);


/* ------------------------------------------------------------------------- *\
 * TEST MODEL
\* ------------------------------------------------------------------------- */

const machine = createMachine({
	id: "usernamePasswordNoPin",
	initial: "CheckingSession",
	states: {
		CheckingSession: {
			on: {
				SESSION_PRESENT: "Authenticated",
				SESSION_NOT_PRESENT: "SubmittingUsernameAndPassword",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.CheckingSession);
					ReporterAssertions.loginFlowIs("USERNAME_PASSWORD");
					ReporterAssertions.deviceSecurityIs("NONE");
				},
			},
		},
		SubmittingUsernameAndPassword: {
			on: {
				USERNAME_AND_PASSWORD_VALID: "Authenticated",
				USERNAME_AND_PASSWORD_VALID_PASSWORD_CHANGE_REQUIRED: "SubmittingForceChangePassword",
				USERNAME_AND_PASSWORD_INVALID: "SubmittingUsernameAndPassword__Error",
				FORGOTTEN_PASSWORD: "ForgottenPasswordRequestingReset",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.SubmittingUsernameAndPassword);
					CommonAssertions.stageErrorIs("n/a");
				},
			},
		},
		SubmittingUsernameAndPassword__Error: {
			on: {
				USERNAME_AND_PASSWORD_VALID: "Authenticated",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.SubmittingUsernameAndPassword);
					CommonAssertions.stageErrorIs("USERNAME_AND_PASSWORD_INVALID");
					td.reset();
				},
			},
		},
		SubmittingForceChangePassword: {
			on: {
				GOOD_FORCE_RESET_PASSWORD: "Authenticated",
				BAD_FORCE_RESET_PASSWORD: "SubmittingForceChangePassword__Error",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.SubmittingForceChangePassword);
					CommonAssertions.stageErrorIs("PASSWORD_CHANGE_REQUIRED");
				},
			},
		},
		SubmittingForceChangePassword__Error: {
			on: {
				GOOD_FORCE_RESET_PASSWORD: "Authenticated",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.SubmittingForceChangePassword);
					CommonAssertions.stageErrorIs("PASSWORD_CHANGE_FAILURE");
					td.reset();
				},
			},
		},
		ForgottenPasswordRequestingReset: {
			on: {
				PASSWORD_RESET_REQUEST_SUCCESS: "ForgottenPasswordSubmittingReset",
				PASSWORD_RESET_REQUEST_FAILURE: "ForgottenPasswordRequestingReset__Error",
				CANCEL_PASSWORD_RESET: "SubmittingUsernameAndPassword",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.ForgottenPasswordRequestingReset);
				},
			},
		},
		ForgottenPasswordRequestingReset__Error: {
			on: {
				PASSWORD_RESET_REQUEST_SUCCESS: "ForgottenPasswordSubmittingReset",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.ForgottenPasswordRequestingReset);
					CommonAssertions.stageErrorIs("PASSWORD_RESET_REQUEST_FAILURE");
					td.reset();
				},
			},
		},
		ForgottenPasswordSubmittingReset: {
			on: {
				PASSWORD_RESET_SUCCESS: "ForgottenPasswordResetSuccess",
				PASSWORD_RESET_FAILURE: "ForgottenPasswordSubmittingReset__Error",
				// CANCEL_PASSWORD_RESET_AT_SUBMIT_STAGE: "SubmittingUsernameAndPassword"
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.ForgottenPasswordSubmittingReset);
				},
			},
		},
		ForgottenPasswordSubmittingReset__Error: {
			on: {
				PASSWORD_RESET_SUCCESS: "ForgottenPasswordResetSuccess",
				REENTER_USERNAME_TO_RESEND_CODE: "ForgottenPasswordRequestingReset",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.ForgottenPasswordSubmittingReset);
					CommonAssertions.stageErrorIs("PASSWORD_RESET_FAILURE");
					td.reset();
				},
			},
		},
		ForgottenPasswordResetSuccess: {
			on: {
				CONFIRM_SUCCESSFUL_PASSWORD_CHANGE: "SubmittingUsernameAndPassword",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.ForgottenPasswordResetSuccess);
				},
			},
		},
		Authenticated: {
			on: {
				REQUEST_LOG_OUT: "AuthenticatedLoggingOut",
				REQUEST_PASSWORD_CHANGE_WHEN_AUTHENTICATED: "AuthenticatedChangingPassword",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.Authenticated);
				},
			},
		},
		AuthenticatedLoggingOut: {
			on: {
				GOOD_LOG_OUT: "CheckingSession",
				BAD_LOG_OUT: "AuthenticatedLoggingOut__Error",
				CANCEL_LOG_OUT: "Authenticated",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.AuthenticatedLoggingOut);
				},
			},
		},
		AuthenticatedLoggingOut__Error: {
			on: {
				GOOD_LOG_OUT: "CheckingSession",
				CANCEL_LOG_OUT: "Authenticated",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.AuthenticatedLoggingOut);
					CommonAssertions.stageErrorIs("LOG_OUT_FAILURE");
					td.reset();
				},
			},
		},
		AuthenticatedChangingPassword: {
			on: {
				SUCCESSFUL_PASSWORD_CHANGE: "AuthenticatedChangingPasswordSuccess",
				UNSUCCESSFUL_PASSWORD_CHANGE: "AuthenticatedChangingPassword__Error",
				CANCEL_PASSWORD_CHANGE: "Authenticated",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.AuthenticatedChangingPassword);
				},
			},
		},
		AuthenticatedChangingPassword__Error: {
			on: {
				SUCCESSFUL_PASSWORD_CHANGE: "AuthenticatedChangingPasswordSuccess",
				CANCEL_PASSWORD_CHANGE: "Authenticated",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.AuthenticatedChangingPassword);
					CommonAssertions.stageErrorIs("PASSWORD_CHANGE_FAILURE");
					td.reset();
				},
			},
		},
		AuthenticatedChangingPasswordSuccess: {
			on: {
				CONFIRM_SUCCESSFUL_AUTHENTICATED_PASSWORD_CHANGE: "Authenticated",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.AuthenticatedPasswordChangeSuccess);
				},
			},
		},
	},
});

const model = createModel(machine).withEvents({
	SESSION_PRESENT: async () => {
		td.when(checkSessionCb()).thenResolve("Valid session");
		CheckingSessionEvents.clickCheckSession();
	},
	SESSION_NOT_PRESENT: async () => {
		td.when(checkSessionCb()).thenReject(new Error("Invalid session"));
		CheckingSessionEvents.clickCheckSession();
	},
	USERNAME_AND_PASSWORD_VALID: async () => {
		td.when(validateUsernameAndPasswordCb(MOCK_VALID_USERNAME, MOCK_VALID_PASSWORD)).thenResolve(MOCK_USER_OBJECT as any);
		SubmittingUsernameAndPasswordEvents.fillUsernameInput(MOCK_VALID_USERNAME);
		SubmittingUsernameAndPasswordEvents.fillPasswordInput(MOCK_VALID_PASSWORD);
		SubmittingUsernameAndPasswordEvents.clickSubmit();
	},
	USERNAME_AND_PASSWORD_VALID_PASSWORD_CHANGE_REQUIRED: async () => {
		td.when(validateUsernameAndPasswordCb(MOCK_VALID_USERNAME, MOCK_VALID_PASSWORD)).thenResolve(["NEW_PASSWORD_REQUIRED", MOCK_USER_OBJECT] as any);
		SubmittingUsernameAndPasswordEvents.fillUsernameInput(MOCK_VALID_USERNAME);
		SubmittingUsernameAndPasswordEvents.fillPasswordInput(MOCK_VALID_PASSWORD);
		SubmittingUsernameAndPasswordEvents.clickSubmit();
	},
	USERNAME_AND_PASSWORD_INVALID: async () => {
		td.when(validateUsernameAndPasswordCb(MOCK_INVALID_USERNAME, MOCK_INVALID_PASSWORD)).thenReject(new Error("Username and password validation failure"));
		SubmittingUsernameAndPasswordEvents.fillUsernameInput(MOCK_INVALID_USERNAME);
		SubmittingUsernameAndPasswordEvents.fillPasswordInput(MOCK_INVALID_PASSWORD);
		SubmittingUsernameAndPasswordEvents.clickSubmit();
	},
	FORGOTTEN_PASSWORD: async () => {
		SubmittingUsernameAndPasswordEvents.clickForgotPassword();
	},
	GOOD_FORCE_RESET_PASSWORD: async () => {
		td.when(validateForceChangePasswordCb(MOCK_USER_OBJECT, MOCK_VALID_PASSWORD)).thenResolve(MOCK_USER_OBJECT);
		SubmittingForceChangePasswordEvents.fillPasswordInput(MOCK_VALID_PASSWORD)
		SubmittingForceChangePasswordEvents.clickSubmit();
	},
	BAD_FORCE_RESET_PASSWORD: async () => {
		td.when(validateForceChangePasswordCb(MOCK_USER_OBJECT, MOCK_INVALID_PASSWORD)).thenReject(new Error("New password doesn't validate"));
		SubmittingForceChangePasswordEvents.fillPasswordInput(MOCK_INVALID_PASSWORD)
		SubmittingForceChangePasswordEvents.clickSubmit();
	},
	PASSWORD_RESET_REQUEST_SUCCESS: async () => {
		td.when(requestNewPasswordCb(MOCK_VALID_USERNAME)).thenResolve(MOCK_USER_OBJECT);
		ForgottenPasswordRequestingResetEvents.fillEmailInput(MOCK_VALID_USERNAME);
		ForgottenPasswordRequestingResetEvents.clickRequestNewPassword();
	},
	PASSWORD_RESET_REQUEST_FAILURE: async () => {
		td.when(requestNewPasswordCb(MOCK_INVALID_USERNAME)).thenReject(new Error("Password request failed"));
		ForgottenPasswordRequestingResetEvents.fillEmailInput(MOCK_INVALID_USERNAME);
		ForgottenPasswordRequestingResetEvents.clickRequestNewPassword();
	},
	CANCEL_PASSWORD_RESET: async () => {
		ForgottenPasswordRequestingResetEvents.clickCancel();
	},
	PASSWORD_RESET_SUCCESS: async () => {
		td.when(submitNewPasswordCb(MOCK_VALID_USERNAME, MOCK_VALID_CODE, MOCK_VALID_PASSWORD)).thenResolve(MOCK_USER_OBJECT);
		ForgottenPasswordSubmittingResetEvents.fillCodeInput(MOCK_VALID_CODE);
		ForgottenPasswordSubmittingResetEvents.fillPasswordInput(MOCK_VALID_PASSWORD);
		ForgottenPasswordSubmittingResetEvents.clickSubmit();
	},
	PASSWORD_RESET_FAILURE: async () => {
		td.when(submitNewPasswordCb(MOCK_VALID_USERNAME, MOCK_INVALID_CODE, MOCK_VALID_PASSWORD)).thenReject(Error("Password reset failure"));
		ForgottenPasswordSubmittingResetEvents.fillCodeInput(MOCK_INVALID_CODE);
		ForgottenPasswordSubmittingResetEvents.fillPasswordInput(MOCK_VALID_PASSWORD);
		ForgottenPasswordSubmittingResetEvents.clickSubmit();
	},
	REENTER_USERNAME_TO_RESEND_CODE: async () => {
		ForgottenPasswordSubmittingResetEvents.clickResendCode();
	},
	CONFIRM_SUCCESSFUL_PASSWORD_CHANGE: async () => {
		ForgottenPasswordResetSuccessEvents.confirmReset();
	},
	REQUEST_LOG_OUT: async () => {
		AuthenticatedEvents.clickRequestLogOut();
	},
	CANCEL_LOG_OUT: async () => {
		AuthenticatedLoggingOutEvents.clickCancelLogOut();
	},
	GOOD_LOG_OUT: async () => {
		td.when(logoutCb()).thenResolve(null);
		AuthenticatedLoggingOutEvents.clickConfirmLogOut();
	},
	BAD_LOG_OUT: async () => {
		td.when(logoutCb()).thenReject(Error("Logout failure"));
		AuthenticatedLoggingOutEvents.clickConfirmLogOut();
	},
	REQUEST_PASSWORD_CHANGE_WHEN_AUTHENTICATED: async () => {
		AuthenticatedEvents.clickRequestPasswordChange();
	},
	SUCCESSFUL_PASSWORD_CHANGE: async () => {
		td.when(changePasswordCb(MOCK_VALID_PASSWORD, MOCK_VALID_PASSWORD)).thenResolve(null);
		AuthenticatedChangingPasswordEvents.fillCurrentPasswordInput(MOCK_VALID_PASSWORD);
		AuthenticatedChangingPasswordEvents.fillNewPasswordInput(MOCK_VALID_PASSWORD);
		AuthenticatedChangingPasswordEvents.clickSubmit();
	},
	UNSUCCESSFUL_PASSWORD_CHANGE: async () => {
		td.when(changePasswordCb(MOCK_VALID_PASSWORD, MOCK_INVALID_PASSWORD)).thenReject(Error("Password change failure"));
		AuthenticatedChangingPasswordEvents.fillCurrentPasswordInput(MOCK_VALID_PASSWORD);
		AuthenticatedChangingPasswordEvents.fillNewPasswordInput(MOCK_INVALID_PASSWORD);
		AuthenticatedChangingPasswordEvents.clickSubmit();
	},
	CANCEL_PASSWORD_CHANGE: async () => {
		AuthenticatedChangingPasswordEvents.clickCancel();
	},
	CONFIRM_SUCCESSFUL_AUTHENTICATED_PASSWORD_CHANGE: async () => {
		AuthenticatedPasswordChangeSuccessEvents.clickConfirm();
	},
});


/* ------------------------------------------------------------------------- *\
 * TESTS
\* ------------------------------------------------------------------------- */


const testPlans = model.getSimplePathPlans();

testPlans.forEach((plan) => {
	const testPlanExecutors = suite(`authentication test system ${plan.description}`);

	testPlanExecutors.after(() => {
	  // NOTE: using the global-jsdom module has some side effects, one of which
		// is that, if there is an error/timeout, the tests just hang.
		// Providing a timeout solves this, but *if* there is an error, there
		// won't be any feedback about *what* the error is, that's the tradeoff.
		// setTimeout(() => {
		// 	process.exit();
		// }, 500)
	});

	testPlanExecutors.after.each(() => {
		cleanup();
		td.reset();
	});

	plan.paths.forEach((path) => {
		testPlanExecutors(path.description, async () => {
			render(<SUT />);
			await path.test(null);
		});
	});
	testPlanExecutors.run();
});

const coverageTests = suite("additional tests");

coverageTests("system test should have full coverage", () => model.testCoverage());

coverageTests.run();
