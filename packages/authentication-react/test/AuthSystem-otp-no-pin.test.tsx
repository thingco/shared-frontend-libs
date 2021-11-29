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
    MOCK_INVALID_CODE,
    MOCK_INVALID_USERNAME, MOCK_USER_OBJECT, MOCK_VALID_CODE,
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
	Authenticated,
	AuthenticatedEvents,
	AuthenticatedLoggingOut,
	AuthenticatedLoggingOutEvents,
	logoutCb,
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
	<AuthProvider loginFlowType="OTP" deviceSecurityType="NONE" allowedOtpRetries={3}>
		<Reporter />
		<CheckingSession/>
		<SubmittingOtpUsername/>
		<SubmittingOtp/>
		<Authenticated/>
		<AuthenticatedLoggingOut/>
	</AuthProvider>
);


/* ------------------------------------------------------------------------- *\
 * TEST MODEL
\* ------------------------------------------------------------------------- */

const machine = createMachine({
	id: "otpNoPin",
	initial: "CheckingSession",
	states: {
		CheckingSession: {
			on: {
				SESSION_PRESENT: "Authenticated",
				SESSION_NOT_PRESENT: "SubmittingUsername",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.CheckingSession);
					ReporterAssertions.loginFlowIs("OTP");
					ReporterAssertions.deviceSecurityIs("NONE");
					ReporterAssertions.allowedOtpRetriesIs(3);
				}
			},
		},
		SubmittingUsername: {
			on: {
				USERNAME_VALID: "SubmittingOtp__1",
				USERNAME_INVALID: "SubmittingUsername__Error",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.SubmittingOtpUsername);
				},
			},
		},
		SubmittingUsername__RetriesExceeded: {
			on: {
				USERNAME_VALID: "SubmittingOtp__1",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.SubmittingOtpUsername);
					CommonAssertions.stageErrorIs("PASSWORD_RETRIES_EXCEEDED");
				},
			},
		},
		SubmittingUsername__Error: {
			on: {
				USERNAME_VALID: "SubmittingOtp__1",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.SubmittingOtpUsername);
					CommonAssertions.stageErrorIs("USERNAME_INVALID");
				},
			},
		},
		SubmittingOtp__1: {
			on: {
				PASSWORD_VALID: "Authenticated",
				PASSWORD_INVALID: "SubmittingOtp__2",
				REENTER_USERNAME: "SubmittingUsername",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.SubmittingOtp);
					CommonAssertions.otpAttemptsMadeIs(0);
				},
			},
		},
		SubmittingOtp__2: {
			on: {
				PASSWORD_VALID: "Authenticated",
				PASSWORD_INVALID: "SubmittingOtp__3",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.SubmittingOtp);
					CommonAssertions.stageErrorIs("PASSWORD_INVALID_2_RETRIES_REMAINING");
					CommonAssertions.otpAttemptsMadeIs(1);
				},
			},
		},
		SubmittingOtp__3: {
			on: {
				PASSWORD_VALID: "Authenticated",
				PASSWORD_INVALID: "SubmittingUsername__RetriesExceeded",
			},
			meta: {
				test: async () => {
					ReporterAssertions.currentStateIs(AuthStateId.SubmittingOtp);
					CommonAssertions.stageErrorIs("PASSWORD_INVALID_1_RETRIES_REMAINING");
					CommonAssertions.otpAttemptsMadeIs(2);
				},
			},
		},
		Authenticated: {
			on: {
				REQUEST_LOG_OUT: "AuthenticatedLoggingOut",
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
	USERNAME_VALID: async () => {
		td.when(validateOtpUsernameCb(MOCK_VALID_USERNAME)).thenResolve(MOCK_USER_OBJECT);
		SubmittingOtpUsernameEvents.fillUsernameInput(MOCK_VALID_USERNAME);
		SubmittingOtpUsernameEvents.clickSubmit();
	},
	USERNAME_INVALID: async () => {
		td.when(validateOtpUsernameCb(MOCK_INVALID_USERNAME)).thenReject(new Error("Invalid username"));
		SubmittingOtpUsernameEvents.fillUsernameInput(MOCK_INVALID_USERNAME);
		SubmittingOtpUsernameEvents.clickSubmit();
	},
	PASSWORD_VALID: async () => {
		td.when(validateOtpCb(MOCK_USER_OBJECT, MOCK_VALID_CODE)).thenResolve(MOCK_USER_OBJECT);
		SubmittingOtpEvents.fillOtpInput(MOCK_VALID_CODE);
		SubmittingOtpEvents.clickSubmit();
	},
	PASSWORD_INVALID: async () => {
		td.when(validateOtpCb(MOCK_USER_OBJECT, MOCK_INVALID_CODE)).thenReject(new Error("Invalid OTP"));
		SubmittingOtpEvents.fillOtpInput(MOCK_INVALID_CODE);
		SubmittingOtpEvents.clickSubmit();
	},
	REENTER_USERNAME: async () => {
		SubmittingOtpEvents.clickGoBack();
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
		td.when(logoutCb()).thenReject(new Error("Logout failure"));
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
		// setTimeout(() => {
		// 	process.exit(0);
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
