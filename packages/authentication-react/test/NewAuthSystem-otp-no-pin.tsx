/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import * as td from "testdouble";
import { strict as assert } from "assert";
import { suite } from "uvu";
import { render, waitFor, cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { RenderResult } from "@testing-library/react";
import { AuthStateId, DeviceSecurityType, LoginFlowType } from "@thingco/authentication-core";
import { AuthProvider, useAuthenticated, useAuthProvider, useCheckingSession, useSubmittingOtp, useSubmittingOtpUsername, useAuthenticatedLoggingOut } from "@thingco/authentication-react";
import type { CheckSessionCb, LogoutCb, ValidateOtpUsernameCb, ValidateOtpCb } from "@thingco/authentication-react";
import { createModel } from "@xstate/test";
import React, { useState } from "react";
import {
    MOCK_INVALID_CODE,
    MOCK_INVALID_USERNAME, MOCK_USER_OBJECT, MOCK_VALID_CODE,
    MOCK_VALID_USERNAME
} from "test-utils/dummy-responses";
import { localStorageMock } from "test-utils/local-storage";
import { setupFakeDom, resetFakeDom } from "test-utils/dom";
import { createMachine } from "xstate";




/* ------------------------------------------------------------------------- *\
 * SYSTEM UNDER TEST
 *
 * The `AuthProvider` component provides a property called `eventSink`, which
 * can be anything, but it receives the entire current state of the auth system
 * on every event that occurs. This means that it can be used to check that
 * the React hooks are doing exactly what they're supposed to be doing.
\* ------------------------------------------------------------------------- */

let checkSessionCbStub = td.func<CheckSessionCb>()
let validateOtpUsernameCbStub = td.func<ValidateOtpUsernameCb<typeof MOCK_USER_OBJECT>>()
// let validateOtpUsernameCbStub: ValidateOtpUsernameCb<typeof MOCK_USER_OBJECT> = async (username) => {
//   switch (username) {
// 		case MOCK_VALID_USERNAME:
// 			return MOCK_USER_OBJECT;
// 		case MOCK_INVALID_USERNAME:
// 			throw new Error("Invalid username");
// 		default:
// 			throw new Error("Something wen wrong");
// 	}
// }
let validateOtpCbStub = td.func<ValidateOtpCb<typeof MOCK_USER_OBJECT>>()
let logOutCbStub = td.func<LogoutCb>()


const CURRENT_STATE = "Current state ID";
const CURRENT_DEVICE_SECURITY_TYPE = "Device security type";
const CURRENT_LOGIN_FLOW_TYPE = "Login flow type";
const CURRENT_ALLOWED_OTP_RETRIES = "Allowed OTP Retries";

const Reporter = () => {
	const systemContext = useAuthProvider();

	return (
		<header>
			<h1 title={ CURRENT_STATE }>{ systemContext.currentState }</h1>
			<p title={ CURRENT_LOGIN_FLOW_TYPE }>{ systemContext.loginFlowType }</p>
			<p title={ CURRENT_DEVICE_SECURITY_TYPE }>{ systemContext.deviceSecurityType }</p>
			<p title={ CURRENT_ALLOWED_OTP_RETRIES }>{ systemContext.allowedOtpRetries }</p>
		</header>
	)
};

const Loader = ({ isLoading }: { isLoading: boolean }) => (
	<p>Loading: { isLoading.toString() }</p>
)

const CHECK_SESSION_BUTTON = "Check Session";

const CheckingSessionStage = () => {
	const { isActive, isLoading, checkSession, error } = useCheckingSession(checkSessionCbStub);
	return isActive ? (
		<form onSubmit={(e) => {
			e.preventDefault();
			checkSession();
		}}>
			<Loader isLoading={isLoading} />
			<button type="submit">{ CHECK_SESSION_BUTTON }</button>
			{ error && <p title="error">{error}</p>}
		</form>
	) : null;
};

const USERNAME_INPUT_LABEL = "Enter username";
const VALIDATE_USERNAME_BUTTON = "Submit Username";

const SubmittingOtpUsernameStage = () => {
	const { isActive, isLoading, validateUsername, error } = useSubmittingOtpUsername(validateOtpUsernameCbStub);
	const [username, setUsername] = useState("");

	return isActive ?(
		<form onSubmit={(e) => {
			e.preventDefault();
			validateUsername(username);
		}}>
			<Loader isLoading={isLoading} />
			<label htmlFor="otpUsernameInput">{ USERNAME_INPUT_LABEL }</label>
			<input tabIndex={1} type="text" id="otpUsernameInput" value={username} onChange={(e) => setUsername(e.target.value)} />
			{ error && <p title="error">{error}</p> }
			<button type="submit">{ VALIDATE_USERNAME_BUTTON }</button>
		</form>
	) : null;
};

const OTP_INPUT_LABEL = "Enter OTP";
const VALIDATE_OTP_BUTTON = "Submit OTP";
const GO_BACK_BUTTON = "Go Back";

const SubmittingOtpStage = () => {
	const { isActive, isLoading, validateOtp, goBack, error } = useSubmittingOtp(validateOtpCbStub);
	const [otp, setOtp] = useState("");

	return isActive ? (
		<form onSubmit={(e) => {
			e.preventDefault();
			validateOtp(otp);
		}}>
			<Loader isLoading={isLoading} />
			<label htmlFor="otpInput">{ OTP_INPUT_LABEL }</label>
			<input tabIndex={1} type="text" id="otpInput" value={otp} onChange={(e) => setOtp(e.target.value)} />
			{ error && <p title="error">{error}</p> }
			<button type="submit">{ VALIDATE_OTP_BUTTON }</button>
			<button type="button" onClick={goBack}>{ GO_BACK_BUTTON }</button>
		</form>
	) : null;
};

const REQUEST_LOG_OUT_BUTTON = "Request Log Out";

const AuthenticatedStage = () => {
	const { isActive, requestLogOut } = useAuthenticated();
	return isActive ? (
		<section>
			<button type="button" onClick={requestLogOut}>{ REQUEST_LOG_OUT_BUTTON }</button>
		</section>
	) : null;
};

const LOG_OUT_BUTTON = "Log Out";
const CANCEL_LOG_OUT_BUTTON = "Cancel Log Out"

const AuthenticatedLoggingOutStage = () => {
	const { isActive, isLoading, logOut, cancelLogOut, error } = useAuthenticatedLoggingOut(logOutCbStub)

	return isActive ? (
		<form onSubmit={(e) => {
			e.preventDefault();
			logOut();
		}}>
			<Loader isLoading={isLoading} />
			<button type="submit">{ LOG_OUT_BUTTON }</button>
			<button type="button" onClick={cancelLogOut}>{ CANCEL_LOG_OUT_BUTTON }</button>
			{ error && <p title="error">{error}</p> }
		</form>
	) : null;
}

const SUT = () => (
	<AuthProvider loginFlowType="OTP" deviceSecurityType="NONE" allowedOtpRetries={3}>
		<Reporter />
		<CheckingSessionStage />
		<SubmittingOtpUsernameStage />
		<SubmittingOtpStage />
		<AuthenticatedStage />
		<AuthenticatedLoggingOutStage />
	</AuthProvider>
);

/* ------------------------------------------------------------------------- *\
 * TEST UTILITIES
 *
 * What the model tests do can be thought of as either an integration test or
 * a sequence of what is described in React-world as unit tests. There's quite
 * a bit of boilerplate, most of which involves putting known values into the
 * system under test then checking they are there in the test.
 *
\* ------------------------------------------------------------------------- */

// export async function assertCurrentStateIs(screen: RenderResult, expected: AuthStateId) {
export async function assertCurrentStateIs(expected: AuthStateId) {
		const currentState = await screen.findByTitle(CURRENT_STATE);
		return assert.equal(currentState.textContent, expected);
}

// export async function assertLoginFlowIs(screen: RenderResult, expected: LoginFlowType) {
export async function assertLoginFlowIs(expected: LoginFlowType) {
	const loginFlowType = await screen.findByTitle(CURRENT_LOGIN_FLOW_TYPE);
	return assert.equal(loginFlowType.textContent, expected);
}

// export async function assertDeviceSecurityIs(screen: RenderResult, expected: DeviceSecurityType) {
export async function assertDeviceSecurityIs(expected: DeviceSecurityType) {
	const deviceSecurityType = await screen.findByTitle(CURRENT_DEVICE_SECURITY_TYPE);
	return assert.equal(deviceSecurityType.textContent, expected);
}

// export async function assertAllowedOtpRetriesIs(screen: RenderResult, expected: number) {
export async function assertAllowedOtpRetriesIs(expected: number) {
	const allowedOtpRetries = await screen.findByTitle(CURRENT_ALLOWED_OTP_RETRIES);
	return assert.equal(parseInt(allowedOtpRetries.textContent ?? ""), expected);
}

// export async function assertLoadingStatusIs(screen: RenderResult, expected: "true" | "false") {
export async function assertLoadingStatusIs(expected: "true" | "false") {
	const loader = await screen.findByText(/Loading: /i);
	return assert.equal(loader.textContent, `Loading: ${expected}`);
}

// export async function assertSystemErrorIs(screen: RenderResult, expected: string) {
export async function assertSystemErrorIs(expected: string) {
	const stageError = await screen.findByTitle(/error/i);
	return assert.equal(stageError.textContent, expected);
}

// export async function fillInput(screen: RenderResult, inputLabel: string | RegExp, value: string) {
export async function fillInput(inputLabel: string | RegExp, value: string) {
	const input = await screen.findByLabelText(inputLabel);
	userEvent.clear(input);
	userEvent.type(input, value);
}

// export async function clickButton(screen: RenderResult, buttonText: string | RegExp) {
export async function clickButton(buttonText: string | RegExp) {
	const button = await screen.findByRole("button", { name: buttonText });
	userEvent.click(button);
}


/* ------------------------------------------------------------------------- *\
 * TEST MODEL
\* ------------------------------------------------------------------------- */

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
				// test: async (screen: RenderResult) => {
				test: async () => {
					// await assertCurrentStateIs(screen, AuthStateId.CheckingSession);
					// await assertLoginFlowIs(screen, "OTP");
					// await assertDeviceSecurityIs(screen, "NONE");
					// await assertAllowedOtpRetriesIs(screen, 3);
					await assertCurrentStateIs(AuthStateId.CheckingSession);
					await assertLoginFlowIs("OTP");
					await assertDeviceSecurityIs("NONE");
					await assertAllowedOtpRetriesIs(3);
				},
			},
		},
		SubmittingUsername: {
			on: {
				GOOD_USERNAME: "SubmittingOtp1",
				BAD_USERNAME: "UsernameError",
			},
			meta: {
				// test: async (screen: RenderResult) => {
				test: async () => {
					// await assertCurrentStateIs(screen, AuthStateId.SubmittingOtpUsername);
					await assertCurrentStateIs(AuthStateId.SubmittingOtpUsername);
				},
			},
		},
		SubmittingUsernameAfterTooManyRetries: {
			on: {
				GOOD_USERNAME: "SubmittingOtp1",
			},
			meta: {
				// test: async (screen: RenderResult) => {
				test: async () => {
					// await assertCurrentStateIs(screen, AuthStateId.SubmittingOtpUsername);
					// await assertSystemErrorIs(screen, "PASSWORD_RETRIES_EXCEEDED");
					await assertCurrentStateIs(AuthStateId.SubmittingOtpUsername);
					await assertSystemErrorIs("PASSWORD_RETRIES_EXCEEDED");
				},
			},
		},
		UsernameError: {
			on: {
				GOOD_USERNAME: "SubmittingOtp1",
			},
			meta: {
				// test: async (screen: RenderResult) => {
				test: async () => {
					// await assertCurrentStateIs(screen, AuthStateId.SubmittingOtpUsername);
					// await assertSystemErrorIs(screen, "USERNAME_INVALID");
					await assertCurrentStateIs(AuthStateId.SubmittingOtpUsername);
					await assertSystemErrorIs("USERNAME_INVALID");
				},
			},
		},
		SubmittingOtp1: {
			on: {
				GOOD_OTP: "Authenticated",
				BAD_OTP: "SubmittingOtp2",
				REENTER_USERNAME: "SubmittingUsername",
			},
			meta: {
				// test: async (screen: RenderResult) => {
				test: async () => {
					// await assertCurrentStateIs(screen, AuthStateId.SubmittingOtp);
					await assertCurrentStateIs(AuthStateId.SubmittingOtp);
				},
			},
		},
		SubmittingOtp2: {
			on: {
				GOOD_OTP: "Authenticated",
				BAD_OTP: "SubmittingOtp3",
				REENTER_USERNAME: "SubmittingUsername",
			},
			meta: {
				// test: async (screen: RenderResult) => {
				test: async () => {
					// await assertCurrentStateIs(screen, AuthStateId.SubmittingOtp);
					// await assertSystemErrorIs(screen, "PASSWORD_INVALID_2_RETRIES_REMAINING");
					await assertCurrentStateIs(AuthStateId.SubmittingOtp);
					await assertSystemErrorIs("PASSWORD_INVALID_2_RETRIES_REMAINING");
				},
			},
		},
		SubmittingOtp3: {
			on: {
				GOOD_OTP: "Authenticated",
				BAD_OTP: "SubmittingUsernameAfterTooManyRetries",
				REENTER_USERNAME: "SubmittingUsername",
			},
			meta: {
				// test: async (screen: RenderResult) => {
				test: async () => {
					// await assertCurrentStateIs(screen, AuthStateId.SubmittingOtp);
					// await assertSystemErrorIs(screen, "PASSWORD_INVALID_2_RETRIES_REMAINING");
					await assertCurrentStateIs(AuthStateId.SubmittingOtp);
					await assertSystemErrorIs("PASSWORD_INVALID_1_RETRIES_REMAINING");
				},
			},
		},
		Authenticated: {
			on: {
				REQUEST_LOG_OUT: "AuthenticatedLoggingOut",
			},
			meta: {
				// test: async (screen: RenderResult) => {
				test: async () => {
					// await assertCurrentStateIs(screen, AuthStateId.Authenticated);
					await assertCurrentStateIs(AuthStateId.Authenticated);
				},
			},
		},
		AuthenticatedLoggingOut: {
			on: {
				GOOD_LOG_OUT: "CheckingSession",
				// BAD_LOG_OUT: "Authenticated",
				CANCEL_LOG_OUT: "Authenticated",
			},
			meta: {
				// test: async (screen: RenderResult) => {
				test: async () => {
					// await assertCurrentStateIs(screen, AuthStateId.AuthenticatedLoggingOut);
					await assertCurrentStateIs(AuthStateId.AuthenticatedLoggingOut);
				},
			},
		},
	},
});


// const model = createModel<RenderResult>(machine).withEvents({
const model = createModel(machine).withEvents({
	// THERE_IS_A_SESSION: async (screen) => {
	THERE_IS_A_SESSION: async () => {
		td.when(checkSessionCbStub()).thenResolve("Valid session");
		// await clickButton(screen, CHECK_SESSION_BUTTON);
		await clickButton(CHECK_SESSION_BUTTON);

		// waitFor(async () => await assertLoadingStatusIs(screen, "false"));
		waitFor(async () => await assertLoadingStatusIs("false"));
	},
	// THERE_IS_NO_SESSION: async (screen) => {
	THERE_IS_NO_SESSION: async () => {
		td.when(checkSessionCbStub()).thenReject(Error("Invalid session"));
		// await clickButton(screen, CHECK_SESSION_BUTTON);
		await clickButton(CHECK_SESSION_BUTTON);

		// waitFor(async () => await assertLoadingStatusIs(screen, "false"));
		waitFor(async () => await assertLoadingStatusIs("false"));
	},
	// GOOD_USERNAME: async (screen) => {
	GOOD_USERNAME: async () => {
		td.when(validateOtpUsernameCbStub(MOCK_VALID_USERNAME)).thenResolve(MOCK_USER_OBJECT);
		// await fillInput(screen, USERNAME_INPUT_LABEL, MOCK_VALID_USERNAME);
		// await clickButton(screen, VALIDATE_USERNAME_BUTTON);
		await fillInput(USERNAME_INPUT_LABEL, MOCK_VALID_USERNAME);
		await clickButton(VALIDATE_USERNAME_BUTTON);

		// waitFor(async () => await assertLoadingStatusIs(screen, "false"));
		waitFor(async () => await assertLoadingStatusIs("false"));
	},
	// BAD_USERNAME: async (screen) => {
	BAD_USERNAME: async () => {
		td.when(validateOtpUsernameCbStub(MOCK_INVALID_USERNAME)).thenReject(Error("Invalid username"));
		// await fillInput(screen, USERNAME_INPUT_LABEL, MOCK_INVALID_USERNAME);
		// await clickButton(screen, VALIDATE_USERNAME_BUTTON);
		await fillInput(USERNAME_INPUT_LABEL, MOCK_INVALID_USERNAME);
		await clickButton(VALIDATE_USERNAME_BUTTON);

		// waitFor(async () => await assertLoadingStatusIs(screen, "false"));
		waitFor(async () => await assertLoadingStatusIs("false"));
	},
	// GOOD_OTP: async (screen) => {
	GOOD_OTP: async () => {
		td.when(validateOtpCbStub(MOCK_USER_OBJECT, MOCK_VALID_CODE)).thenResolve(MOCK_USER_OBJECT);
		// await fillInput(screen, OTP_INPUT_LABEL, MOCK_VALID_CODE);
		// await clickButton(screen, VALIDATE_OTP_BUTTON);
		await fillInput(OTP_INPUT_LABEL, MOCK_VALID_CODE);
		await clickButton(VALIDATE_OTP_BUTTON);

		// waitFor(async () => await assertLoadingStatusIs(screen, "false"));
		waitFor(async () => await assertLoadingStatusIs("false"));
	},
	// BAD_OTP: async (screen) => {
	BAD_OTP: async () => {
		td.when(validateOtpCbStub(MOCK_USER_OBJECT, MOCK_INVALID_CODE)).thenReject(Error("Invalid OTP"));
		// await fillInput(screen, OTP_INPUT_LABEL, MOCK_INVALID_CODE);
		// await clickButton(screen, VALIDATE_OTP_BUTTON);
		await fillInput(OTP_INPUT_LABEL, MOCK_INVALID_CODE);
		await clickButton(VALIDATE_OTP_BUTTON);

		// waitFor(async () => await assertLoadingStatusIs(screen, "false"));
		waitFor(async () => await assertLoadingStatusIs("false"));
	},
	// REENTER_USERNAME: async (screen) => {
	REENTER_USERNAME: async () => {
		// await clickButton(screen, GO_BACK_BUTTON);
		await clickButton(GO_BACK_BUTTON);
	},
	// REQUEST_LOG_OUT: async (screen) => {
	REQUEST_LOG_OUT: async () => {
		// await clickButton(screen, REQUEST_LOG_OUT_BUTTON);
		await clickButton(REQUEST_LOG_OUT_BUTTON);
	},
	// CANCEL_LOG_OUT: async (screen) => {
	CANCEL_LOG_OUT: async () => {
		// await clickButton(screen, CANCEL_LOG_OUT_BUTTON);
		await clickButton(CANCEL_LOG_OUT_BUTTON);
	},
	// GOOD_LOG_OUT: async (screen) => {
	GOOD_LOG_OUT: async () => {
		td.when(logOutCbStub()).thenResolve(null);
		// await clickButton(screen, LOG_OUT_BUTTON);
		await clickButton(LOG_OUT_BUTTON);

		// waitFor(async () => await assertLoadingStatusIs(screen, "false"));
		waitFor(async () => await assertLoadingStatusIs("false"));
	},
	// BAD_LOG_OUT: async (screen) => {
	BAD_LOG_OUT: async () => {
		td.when(logOutCbStub()).thenReject(Error("Logout failure"));
		// await clickButton(screen, LOG_OUT_BUTTON);
		await clickButton(LOG_OUT_BUTTON);

		// waitFor(async () => await assertLoadingStatusIs(screen, "false"));
		waitFor(async () => await assertLoadingStatusIs("false"));
	},
});

/* ------------------------------------------------------------------------- *\
 * TESTS
\* ------------------------------------------------------------------------- */


const testPlans = model.getSimplePathPlans();

testPlans.forEach((plan) => {
	const testPlanExecutors = suite(`authentication test system ${plan.description}`);

	testPlanExecutors.before(() => {
		globalThis.localStorage = localStorageMock();
	});

	testPlanExecutors.before.each(() => {
	});

	testPlanExecutors.after(() => {
		setTimeout(() => {
			process.exit();
		}, 500)
	});

	testPlanExecutors.after.each(() => {
		cleanup();
		globalThis.localStorage.clear();
		td.reset();
	});

	plan.paths.forEach((path) => {
		testPlanExecutors(path.description, async () => {
			const screen = render(<SUT />);
			await path.test(screen);
		});
	});
	 testPlanExecutors.run();
});

const additionalTests = suite("additional tests");

additionalTests("system test should have full coverage", () => {
	return model.testCoverage();
});
