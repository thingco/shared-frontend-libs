/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import * as td from "testdouble";
import { suite } from "uvu";
import { render, cleanup} from "@testing-library/react";
import { AuthStateId, } from "@thingco/authentication-core";
import { AuthProvider } from "@thingco/authentication-react";
import { createModel } from "@xstate/test";
import React from "react";
import {
	MOCK_INVALID_PIN,
	MOCK_USER_OBJECT,
	MOCK_VALID_CODE,
	MOCK_VALID_PIN,
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
	SubmittingOtpUsername,
	SubmittingOtpUsernameEvents,
	validateOtpUsernameCb,
	SubmittingOtp,
	SubmittingOtpEvents,
	validateOtpCb,
	CheckingForPin,
	CheckingForPinEvents,
	checkForExistingPinCb,
	SubmittingCurrentPin,
	SubmittingCurrentPinEvents,
	ForgottenPinRequestingReset,
	ForgottenPinRequestingResetEvents,
	validatePinCb,
	SubmittingNewPin,
	SubmittingNewPinEvents,
	setNewPinCb,
	Authenticated,
	AuthenticatedEvents,
	AuthenticatedLoggingOut,
	AuthenticatedLoggingOutEvents,
	logoutCb,
	AuthenticatedChangingPin,
	AuthenticatedChangingPinEvents,
	AuthenticatedValidatingPin,
	AuthenticatedValidatingPinEvents,
	AuthenticatedPinChangeSuccess,
	AuthenticatedPinChangeSuccessEvents,
} from "./stages";


/* ------------------------------------------------------------------------- *\
 * SYSTEM UNDER TEST
 *
 * The `AuthProvider` component provides a property called `eventSink`, which
 * can be anything, but it receives the entire current state of the auth system
 * on every event that occurs. This means that it can be used to check that
 * the React hooks are doing exactly what they're supposed to be doing.
\* ------------------------------------------------------------------------- */


const SUT = () => (
	<AuthProvider loginFlowType="OTP" deviceSecurityType="PIN" pinLength={4} allowedOtpRetries={3}>
		<Reporter />
		<CheckingSession/>
		<SubmittingOtpUsername/>
		<SubmittingOtp/>
		<CheckingForPin/>
		<SubmittingCurrentPin />
		<ForgottenPinRequestingReset />
		<SubmittingNewPin />
		<Authenticated/>
		<AuthenticatedLoggingOut/>
		<AuthenticatedValidatingPin />
		<AuthenticatedChangingPin />
		<AuthenticatedPinChangeSuccess />
	</AuthProvider>
);


/* ------------------------------------------------------------------------- *\
 * TEST MODEL
\* ------------------------------------------------------------------------- */

const machine = createMachine({
	id: "otpPin",
	initial: "CheckingSession",
	states: {
		CheckingSession: {
			on: {
				SESSION_PRESENT: "CheckingForPin__LoginBypassedPinExists",
				SESSION_NOT_PRESENT: "SubmittingUsername",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.CheckingSession);
					ReporterAssertions.loginFlowIs("OTP");
					ReporterAssertions.deviceSecurityIs("PIN");
					ReporterAssertions.pinLengthIs(4);
				},
			},
		},
		// NOTE: Not interested in testing failure here, just an ability to reach
		// the PIN checking stage.
		SubmittingUsername: {
			on: {
				GOOD_USERNAME: "SubmittingOtp",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.SubmittingOtpUsername);
					CommonAssertions.stageErrorIs("n/a");
				},
			},
		},
		// NOTE: Not interested in testing failure here, just an ability to reach
		// the PIN checking stage.
		SubmittingOtp: {
			on: {
				GOOD_OTP_NEW_ACCOUNT: "CheckingForPin__LoginCompletedNoPinExists",
				GOOD_OTP_EXISTING_ACCOUNT: "CheckingForPin__LoginCompletedPinExists"
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.SubmittingOtp);
					CommonAssertions.stageErrorIs("n/a");
				},
			},
		},
		CheckingForPin__LoginCompletedNoPinExists: {
			on: {
				THERE_IS_NO_PIN_STORED: "SubmittingNewPin",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.CheckingForPin);
					CommonAssertions.stageErrorIs("n/a");
				},
			},
		},
		CheckingForPin__LoginCompletedPinExists: {
			on: {
				THERE_IS_A_PIN_STORED: "Authenticated",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.CheckingForPin);
				},
			},
		},
		CheckingForPin__LoginBypassedPinExists: {
			on: {
				THERE_IS_A_PIN_STORED: "SubmittingCurrentPin",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.CheckingForPin);
					CommonAssertions.stageErrorIs("n/a");
				},
			},
		},
		SubmittingCurrentPin: {
			on: {
				CURRENT_PIN_IS_VALID: "Authenticated",
				CURRENT_PIN_IS_INVALID: "SubmittingCurrentPinError",
				FORGOTTEN_PIN: "ForgotPin",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.SubmittingCurrentPin);
					CommonAssertions.stageErrorIs("n/a");
				},
			},
		},
		SubmittingCurrentPinError: {
			on: {
				CURRENT_PIN_IS_VALID: "Authenticated",
				FORGOTTEN_PIN: "ForgotPin",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.SubmittingCurrentPin);
					CommonAssertions.stageErrorIs("PIN_INVALID");
				},
			},
		},
		ForgotPin: {
			on: {
				CONFIRM_PIN_RESET: "CheckingSession",
				CANCEL_PIN_RESET: "SubmittingCurrentPin",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.ForgottenPinRequestingReset);
					CommonAssertions.stageErrorIs("n/a");
				},
			},
		},
		SubmittingNewPin: {
			on: {
				NEW_PIN_IS_VALID: "Authenticated",
				NEW_PIN_IS_INVALID: "SubmittingNewPinError",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.SubmittingNewPin);
					CommonAssertions.stageErrorIs("n/a");
				},
			},
		},
		SubmittingNewPinError: {
			on: {
				NEW_PIN_IS_VALID: "Authenticated",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.SubmittingNewPin);
					CommonAssertions.stageErrorIs("NEW_PIN_INVALID");
				},
			},
		},
		Authenticated: {
			on: {
				REQUEST_LOG_OUT: "LoggingOut",
				REQUEST_PIN_CHANGE: "ValidatingCurrentPinReadyForPinChange",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.Authenticated);
					CommonAssertions.stageErrorIs("n/a");
				},
			},
		},
		ValidatingCurrentPinReadyForPinChange: {
			on: {
				CURRENT_PIN_IS_VALID_CHANGE_ALLOWED: "SubmittingNewPinForPinChange",
				CURRENT_PIN_IS_INVALID_CHANGE_REJECTED: "ValidatingCurrentPinReadyForPinChangeError",
				CANCEL_PIN_CHANGE_REQUEST: "Authenticated",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.AuthenticatedValidatingPin);
					CommonAssertions.stageErrorIs("n/a");
				},
			},
		},
		ValidatingCurrentPinReadyForPinChangeError: {
			on: {
				CURRENT_PIN_IS_VALID_CHANGE_ALLOWED: "SubmittingNewPinForPinChange",
				CANCEL_PIN_CHANGE_REQUEST_AT_VALIDATION_STAGE: "Authenticated",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.AuthenticatedValidatingPin);
					CommonAssertions.stageErrorIs("PIN_INVALID");
				},
			},
		},
		SubmittingNewPinForPinChange: {
			on: {
				NEW_PIN_IS_VALID_CHANGE_ACCEPTED: "PinChangedSuccess",
				NEW_PIN_IS_INVALID_CHANGE_REJECTED: "SubmittingNewPinForPinChangeError",
				CANCEL_PIN_CHANGE_REQUEST_AT_CHANGE_STAGE: "Authenticated",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.AuthenticatedChangingPin);
					CommonAssertions.stageErrorIs("n/a");
				},
			},
		},
		SubmittingNewPinForPinChangeError: {
			on: {
				NEW_PIN_IS_VALID_CHANGE_ACCEPTED: "PinChangedSuccess",
				CANCEL_PIN_CHANGE_REQUEST: "Authenticated",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.AuthenticatedChangingPin);
					CommonAssertions.stageErrorIs("PIN_CHANGE_FAILURE");
				},
			},
		},
		PinChangedSuccess: {
			on: {
				CONFIRM_SUCCESSFUL_PIN_CHANGE: "Authenticated",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.AuthenticatedPinChangeSuccess);
					CommonAssertions.stageErrorIs("n/a");
				},
			},
		},
		LoggingOut: {
			on: {
				GOOD_LOG_OUT: "CheckingSession",
				BAD_LOG_OUT: "LoggingOut",
				CANCEL_LOG_OUT: "Authenticated",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.AuthenticatedLoggingOut);
					CommonAssertions.stageErrorIs("n/a");
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
		td.when(checkSessionCb()).thenReject(Error("Invalid session"));
		CheckingSessionEvents.clickCheckSession();
	},
	GOOD_USERNAME: async () => {
		td.when(validateOtpUsernameCb(MOCK_VALID_USERNAME)).thenResolve(MOCK_USER_OBJECT);
		SubmittingOtpUsernameEvents.fillUsernameInput(MOCK_VALID_USERNAME);
		SubmittingOtpUsernameEvents.clickSubmit();
	},
	GOOD_OTP_NEW_ACCOUNT: async () => {
		td.when(validateOtpCb(MOCK_USER_OBJECT, MOCK_VALID_CODE)).thenResolve(MOCK_USER_OBJECT);
		SubmittingOtpEvents.fillOtpInput(MOCK_VALID_CODE);
		SubmittingOtpEvents.clickSubmit();
	},
	GOOD_OTP_EXISTING_ACCOUNT: async () => {
		td.when(validateOtpCb(MOCK_USER_OBJECT, MOCK_VALID_CODE)).thenResolve(MOCK_USER_OBJECT);
		SubmittingOtpEvents.fillOtpInput(MOCK_VALID_CODE);
		SubmittingOtpEvents.clickSubmit();
	},
	THERE_IS_A_PIN_STORED: async () => {
		td.when(checkForExistingPinCb()).thenResolve(MOCK_VALID_PIN);
		CheckingForPinEvents.clickCheckForPin();
	},
	THERE_IS_NO_PIN_STORED: async () => {
		td.when(checkForExistingPinCb()).thenReject(Error("No pin found"));
		CheckingForPinEvents.clickCheckForPin();
	},
	CURRENT_PIN_IS_VALID: async () => {
		td.when(validatePinCb(MOCK_VALID_PIN)).thenResolve(null);
		SubmittingCurrentPinEvents.fillPinInput(MOCK_VALID_PIN);
		SubmittingCurrentPinEvents.clickSubmit();
	},
	CURRENT_PIN_IS_INVALID: async () => {
		td.when(validatePinCb(MOCK_INVALID_PIN)).thenReject(Error("Invalid PIN"));
		SubmittingCurrentPinEvents.fillPinInput(MOCK_INVALID_PIN);
		SubmittingCurrentPinEvents.clickSubmit();
	},
	FORGOTTEN_PIN: async () => {
		SubmittingCurrentPinEvents.clickForgotPin();
	},
	CONFIRM_PIN_RESET: async () => {
		ForgottenPinRequestingResetEvents.clickResetPin();
	},
	CANCEL_PIN_RESET: async () => {
		ForgottenPinRequestingResetEvents.clickCancel();
	},
	NEW_PIN_IS_VALID: async () => {
		td.when(setNewPinCb(MOCK_VALID_PIN)).thenResolve(null);
		SubmittingNewPinEvents.fillPinInput(MOCK_VALID_PIN);
		SubmittingNewPinEvents.clickSubmit();
	},
	NEW_PIN_IS_INVALID: async () => {
		td.when(setNewPinCb(MOCK_INVALID_PIN)).thenReject(Error("Invalid new PIN"));
		SubmittingNewPinEvents.fillPinInput(MOCK_INVALID_PIN);
		SubmittingNewPinEvents.clickSubmit();
	},
	REQUEST_PIN_CHANGE: async () => {
		AuthenticatedEvents.clickRequestPinChange();
	},
	CURRENT_PIN_IS_VALID_CHANGE_ALLOWED: async () => {
		td.when(validatePinCb(MOCK_VALID_PIN)).thenResolve(null);
		AuthenticatedValidatingPinEvents.fillPinInput(MOCK_VALID_PIN);
		AuthenticatedValidatingPinEvents.clickSubmit();
	},
	CURRENT_PIN_IS_INVALID_CHANGE_REJECTED: async () => {
		td.when(validatePinCb(MOCK_INVALID_PIN)).thenReject(Error("Invalid PIN"));
		AuthenticatedValidatingPinEvents.fillPinInput(MOCK_INVALID_PIN);
		AuthenticatedValidatingPinEvents.clickSubmit();
	},
	CANCEL_PIN_CHANGE_REQUEST_AT_VALIDATION_STAGE: async () => {
		AuthenticatedValidatingPinEvents.clickCancel();
	},
	NEW_PIN_IS_VALID_CHANGE_ACCEPTED: async () => {
		td.when(setNewPinCb(MOCK_VALID_PIN)).thenResolve(null);
		AuthenticatedChangingPinEvents.fillPinInput(MOCK_VALID_PIN);
		AuthenticatedChangingPinEvents.clickPinSubmit();
	},
	NEW_PIN_IS_INVALID_CHANGE_REJECTED: async () => {
		td.when(setNewPinCb(MOCK_INVALID_PIN)).thenReject(Error("Invalid PIN"));
		AuthenticatedChangingPinEvents.fillPinInput(MOCK_INVALID_PIN);
		AuthenticatedChangingPinEvents.clickPinSubmit();
	},
	CANCEL_PIN_CHANGE_REQUEST_AT_CHANGE_STAGE: async () => {
		AuthenticatedChangingPinEvents.clickCancel();
	},
	CONFIRM_SUCCESSFUL_PIN_CHANGE: async () => {
		AuthenticatedPinChangeSuccessEvents.clickConfirm();
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
		setTimeout(() => {
			process.exit();
		}, 500)
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
