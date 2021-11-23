/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { render, waitFor } from "@testing-library/react";
import { AuthStateId } from "@thingco/authentication-core";
import type { CheckSessionCb, LogoutCb } from "@thingco/authentication-react";
import { createModel } from "@xstate/test";
import React from "react";
import { Authentication } from "test-app/App";
import { ConfigInjector } from "test-app/ConfigInjector";
import {
    checkSessionCb, logoutCb, validateOtpCb, validateOtpUsernameCb
} from "test-app/stages/callback-implementations";
import uiText from "test-app/ui-copy";
import {
    currentDeviceSecurityTypeIs,
    currentLoginFlowIs,
    currentStateIs,
    stageErrorIs,
    stageLoadingStatusIs
} from "test-utils/assertion-helpers";
import {
    MOCK_INVALID_CODE,
    MOCK_INVALID_USERNAME, MOCK_USER_OBJECT, MOCK_VALID_CODE,
    MOCK_VALID_USERNAME
} from "test-utils/dummy-responses";
import { clickButton, findInputClearInputFillInput } from "test-utils/event-helpers";
import { localStorageMock } from "test-utils/local-storage";
import { createMachine } from "xstate";


jest.mock("test-app/stages/callback-implementations", () => ({
	checkSessionCb: jest.fn(),
	validateOtpUsernameCb: jest.fn(async (username) => {
		if (username === MOCK_VALID_USERNAME) {
			return Promise.resolve(MOCK_USER_OBJECT);
		} else {
			return Promise.reject();
		}
	}),
	validateOtpCb: jest.fn(async (_user, otp) => {
		if (otp === MOCK_VALID_CODE) {
			return Promise.resolve(MOCK_USER_OBJECT);
		} else {
			return Promise.reject();
		}
	}),
	logOutCb: jest.fn(),
}));


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
				test: async () => {
					await currentStateIs(AuthStateId.CheckingSession);
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
		findInputClearInputFillInput(controlLabels.otpUsernameInput, MOCK_VALID_USERNAME);
		clickButton(controlLabels.submitOtpUsername);
		await waitFor(() => expect(validateOtpUsernameCb).toHaveBeenCalledWith(MOCK_VALID_USERNAME));
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await stageLoadingStatusIs("false");
	},
	BAD_USERNAME: async () => {
		const controlLabels = uiText.authStages.submittingOtpUsername.controlLabels;
		findInputClearInputFillInput(controlLabels.otpUsernameInput, MOCK_INVALID_USERNAME);
		clickButton(controlLabels.submitOtpUsername);
		await waitFor(() => expect(validateOtpUsernameCb).toHaveBeenCalledWith(MOCK_INVALID_USERNAME));
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await stageLoadingStatusIs("false");
	},
	GOOD_OTP: async () => {
		const controlLabels = uiText.authStages.submittingOtp.controlLabels;
		findInputClearInputFillInput(controlLabels.otpInput, MOCK_VALID_CODE);
		clickButton(controlLabels.submitOtp);
		await waitFor(() => expect(validateOtpCb).toHaveBeenCalledWith(MOCK_USER_OBJECT, MOCK_VALID_CODE));
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await stageLoadingStatusIs("false");
	},
	BAD_OTP: async () => {
		const controlLabels = uiText.authStages.submittingOtp.controlLabels;
		findInputClearInputFillInput(controlLabels.otpInput, MOCK_INVALID_CODE);
		clickButton(controlLabels.submitOtp);
		await waitFor(() => expect(validateOtpCb).toHaveBeenCalledWith(MOCK_USER_OBJECT, MOCK_INVALID_CODE));
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
 * TESTS
\* ------------------------------------------------------------------------- */

describe("authentication test system using OTP and no device security", () => {
	beforeAll(() => {
		globalThis.localStorage = localStorageMock();
	});

	afterEach(() => {
		globalThis.localStorage.clear();
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
