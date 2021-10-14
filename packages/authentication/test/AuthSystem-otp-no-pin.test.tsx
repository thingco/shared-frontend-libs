/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import React from "react";
import { waitFor, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createModel } from "@xstate/test";
import { createMachine } from "xstate";

import { AuthStateId } from "core/auth-system";
// Import the entire authentication structure from the test app:
import { Authentication } from "test-app/App";
// Import the config injection component from the test app:
import { ConfigInjector } from "test-app/ConfigInjector";
// The text used the UI, equivalent of translations file:
import uiText from "test-app/ui-copy";
// Local storage mock:
import { localStorageMock } from "test-utils/local-storage";
// Custom `screen` from `@testing-library/react` enhanced with ...ByTerm queries
import { customScreen } from "test-utils/find-by-term";
// Boilerplate query/assertion functions
import {
	currentDeviceSecurityTypeIs,
	currentLoginFlowIs,
	currentStateIs,
	stageErrorIs,
	stageLoadingStatusIs,
} from "test-utils/assertion-helpers";

// Mock responses + API functions to mock.
import {
	INVALID_CODE,
	INVALID_USERNAME,
	VALID_CODE,
	VALID_USERNAME,
	USER_OBJECT,
} from "test-utils/dummy-responses";

import {
	checkSessionCb,
	validateOtpUsernameCb,
	validateOtpCb,
	logoutCb,
} from "test-app/stages/callback-implementations";

// Types
import type { CheckSessionCb, LogoutCb } from "core/react/callback-types";
import { clickButton, findInputClearInputFillInput } from "test-utils/event-helpers";

/* ------------------------------------------------------------------------- *\
 * 1. MOCKING
\* ------------------------------------------------------------------------- */

jest.mock("test-app/stages/callback-implementations", () => ({
	checkSessionCb: jest.fn(),
	validateOtpUsernameCb: jest.fn(async (username) => {
		if (username === VALID_USERNAME) {
			return Promise.resolve(USER_OBJECT);
		} else {
			return Promise.reject();
		}
	}),
	validateOtpCb: jest.fn(async (_, otp) => {
		if (otp === VALID_CODE) {
			return Promise.resolve(USER_OBJECT);
		} else {
			return Promise.reject();
		}
	}),
	logOutCb: jest.fn(),
}));

/* ------------------------------------------------------------------------- *\
 * 2. SYSTEM UNDER TEST
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
				test: async () => {
					await currentStateIs(AuthStateId.CheckingForSession);
					await currentLoginFlowIs("OTP");
					await currentDeviceSecurityTypeIs("NONE");
					await stageErrorIs("n/a");
				},
			},
		},
		SubmittingUsername: {
			on: {
				GOOD_USERNAME: "SubmittingOtp1",
				BAD_USERNAME: "UsernameError",
			},
			meta: {
				test: async () => {
					await currentStateIs(AuthStateId.SubmittingOtpUsername);
					await stageErrorIs("n/a");
				},
			},
		},
		SubmittingUsernameAfterTooManyRetries: {
			on: {
				GOOD_USERNAME: "SubmittingOtp1",
			},
			meta: {
				test: async () => {
					await currentStateIs(AuthStateId.SubmittingOtpUsername);
					await stageErrorIs("PASSWORD_RETRIES_EXCEEDED");
				},
			},
		},
		UsernameError: {
			on: {
				GOOD_USERNAME: "SubmittingOtp1",
			},
			meta: {
				test: async () => {
					await currentStateIs(AuthStateId.SubmittingOtpUsername);
					await stageErrorIs("USERNAME_INVALID");
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
				test: async () => {
					await currentStateIs(AuthStateId.SubmittingOtp);
					await stageErrorIs("n/a");
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
				test: async () => {
					await currentStateIs(AuthStateId.SubmittingOtp);
					await stageErrorIs("PASSWORD_INVALID_2_RETRIES_REMAINING");
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
				test: async () => {
					await currentStateIs(AuthStateId.SubmittingOtp);
					await stageErrorIs("PASSWORD_INVALID_1_RETRIES_REMAINING");
				},
			},
		},
		Authenticated: {
			on: {
				REQUEST_LOG_OUT: "AuthenticatedLoggingOut",
			},
			meta: {
				test: async () => {
					await currentStateIs(AuthStateId.Authenticated);
					await stageErrorIs("n/a");
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
				test: async () => {
					await currentStateIs(AuthStateId.AuthenticatedLoggingOut);
					await stageErrorIs("n/a");
				},
			},
		},
	},
});

const model = createModel(machine).withEvents({
	THERE_IS_A_SESSION: async () => {
		const controlLabels = uiText.authStages.checkingForSession.controlLabels;
		clickButton(controlLabels.checkForExistingSession);
		await waitFor(() => expect(checkSessionCb).toHaveBeenCalled());
		await stageLoadingStatusIs("false");
	},
	THERE_IS_NO_SESSION: async () => {
		const controlLabels = uiText.authStages.checkingForSession.controlLabels;
		(checkSessionCb as jest.MockedFunction<CheckSessionCb>).mockRejectedValueOnce(null);
		clickButton(controlLabels.checkForExistingSession);
		await waitFor(() => expect(checkSessionCb).toHaveBeenCalled());
		(checkSessionCb as jest.MockedFunction<CheckSessionCb>).mockReset();
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await stageLoadingStatusIs("false");
	},
	GOOD_USERNAME: async () => {
		const controlLabels = uiText.authStages.submittingOtpUsername.controlLabels;
		findInputClearInputFillInput(controlLabels.otpUsernameInput, VALID_USERNAME);
		clickButton(controlLabels.submitOtpUsername);
		await waitFor(() => expect(validateOtpUsernameCb).toHaveBeenCalledWith(VALID_USERNAME));
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await stageLoadingStatusIs("false");
	},
	BAD_USERNAME: async () => {
		const controlLabels = uiText.authStages.submittingOtpUsername.controlLabels;
		findInputClearInputFillInput(controlLabels.otpUsernameInput, INVALID_USERNAME);
		clickButton(controlLabels.submitOtpUsername);
		await waitFor(() => expect(validateOtpUsernameCb).toHaveBeenCalledWith(INVALID_USERNAME));
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await stageLoadingStatusIs("false");
	},
	GOOD_OTP: async () => {
		const controlLabels = uiText.authStages.submittingOtp.controlLabels;
		findInputClearInputFillInput(controlLabels.otpInput, VALID_CODE);
		clickButton(controlLabels.submitOtp);
		await waitFor(() => expect(validateOtpCb).toHaveBeenCalledWith(USER_OBJECT, VALID_CODE));
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await stageLoadingStatusIs("false");
	},
	BAD_OTP: async () => {
		const controlLabels = uiText.authStages.submittingOtp.controlLabels;
		findInputClearInputFillInput(controlLabels.otpInput, INVALID_CODE);
		clickButton(controlLabels.submitOtp);
		await waitFor(() => expect(validateOtpCb).toHaveBeenCalledWith(USER_OBJECT, INVALID_CODE));
		await stageLoadingStatusIs("false");
	},
	REENTER_USERNAME: async () => {
		const controlLabels = uiText.authStages.submittingOtp.controlLabels;
		clickButton(controlLabels.reenterUsername);
	},
	REQUEST_LOG_OUT: async () => {
		const controlLabels = uiText.authStages.authenticated.controlLabels;
		clickButton(controlLabels.logOut);
	},
	CANCEL_LOG_OUT: async () => {
		const controlLabels = uiText.authStages.authenticatedLoggingOut.controlLabels;
		clickButton(controlLabels.cancelLogOut);
	},
	GOOD_LOG_OUT: async () => {
		const controlLabels = uiText.authStages.authenticatedLoggingOut.controlLabels;
		clickButton(controlLabels.logOut);
		await waitFor(() => expect(logoutCb).toHaveBeenCalled());
		await stageLoadingStatusIs("false");
	},
	BAD_LOG_OUT: async () => {
		const controlLabels = uiText.authStages.authenticatedLoggingOut.controlLabels;
		(logoutCb as jest.MockedFunction<LogoutCb>).mockRejectedValueOnce(null);
		clickButton(controlLabels.logOut);
		await waitFor(() => expect(logoutCb).toHaveBeenCalled());
		(logoutCb as jest.MockedFunction<LogoutCb>).mockReset();
		await stageLoadingStatusIs("false");
	},
});

/* ------------------------------------------------------------------------- *\
 * 3. TESTS
\* ------------------------------------------------------------------------- */

describe("authentication test system using OTP and no device security", () => {
	beforeAll(() => {
		globalThis.localStorage = localStorageMock();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	const testPlans = model.getSimplePathPlans();

	testPlans.forEach((plan) => {
		describe(`authentication test system ${plan.description}`, () => {
			plan.paths.forEach((path) => {
				it(path.description, async () => {
					const screen = render(
						<ConfigInjector
							initialLoginFlowType="OTP"
							initialDeviceSecurityType="NONE"
							isInTestMode={true}
						>
							<Authentication />
						</ConfigInjector>
					);
					await path.test(screen);
				});
			});
		});
	});

	it("should have full coverage", () => {
		return model.testCoverage();
	});
});
