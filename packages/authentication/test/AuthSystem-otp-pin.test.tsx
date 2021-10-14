/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import React from "react";
import { waitFor, render } from "@testing-library/react";
import { createModel } from "@xstate/test";
import { createMachine } from "xstate";

import { AuthStateId } from "core/enums";
// Import the entire authentication structure from the test app:
import { Authentication } from "test-app/App";
// Import the config injection component from the test app:
import { ConfigInjector } from "test-app/ConfigInjector";
// The text used the UI, equivalent of translations file:
import uiText from "test-app/ui-copy";
// Local storage mock:
import { localStorageMock } from "test-utils/local-storage";
// Boilerplate query/assertion functions
import {
	currentDeviceSecurityTypeIs,
	currentLoginFlowIs,
	currentStateIs,
	stageErrorIs,
	stageLoadingStatusIs,
} from "test-utils/assertion-helpers";
import { clickButton, findInputClearInputFillInput } from "test-utils/event-helpers";

// Mock responses + API functions to mock.
import {
	VALID_CODE,
	VALID_USERNAME,
	USER_OBJECT,
	VALID_PIN,
	INVALID_PIN,
} from "test-utils/dummy-responses";

import {
	PIN_KEY,
	checkSessionCb,
	validateOtpUsernameCb,
	validateOtpCb,
	checkForExistingPinCb,
	validatePinCb,
	resetPinCb,
	setNewPinCb,
	logoutCb,
} from "test-app/stages/callback-implementations";

// Types
import type { CheckSessionCb, LogoutCb } from "core/react/callback-types";

/* ------------------------------------------------------------------------- *\
 * 1. MOCKING
\* ------------------------------------------------------------------------- */

const localStorageEmulation = localStorageMock();

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
	logOutCb: jest.fn(async () => {
		localStorageEmulation.removeItem(PIN_KEY);
		return Promise.resolve();
	}),
	resetPinCb: jest.fn(async () => {
		localStorageEmulation.removeItem(PIN_KEY);
		return Promise.resolve();
	}),
	checkForExistingPinCb: jest.fn(() => {
		const pin = localStorageEmulation.getItem(PIN_KEY);
		return pin !== null ? Promise.resolve() : Promise.reject();
	}),
	validatePinCb: jest.fn((pin) => {
		const existingPin = localStorageEmulation.getItem(PIN_KEY);
		return pin === existingPin ? Promise.resolve() : Promise.reject();
	}),
	setNewPinCb: jest.fn((pin) => {
		if (pin === VALID_PIN) {
			localStorageEmulation.setItem(PIN_KEY, pin);
			return Promise.resolve();
		} else {
			return Promise.reject();
		}
	}),
}));

/* ------------------------------------------------------------------------- *\
 * 2. SYSTEM UNDER TEST
\* ------------------------------------------------------------------------- */

const machine = createMachine({
	id: "otpPin",
	initial: "CheckingSession",
	states: {
		CheckingSession: {
			on: {
				THERE_IS_A_SESSION: "CheckingForAPinAndThereIsOne",
				THERE_IS_NO_SESSION: "SubmittingUsername",
			},
			meta: {
				test: async () => {
					await currentStateIs(AuthStateId.CheckingForSession);
					await currentLoginFlowIs("OTP");
					await currentDeviceSecurityTypeIs("PIN");
					await stageErrorIs("n/a");
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
					await currentStateIs(AuthStateId.SubmittingOtpUsername);
					await stageErrorIs("n/a");
				},
			},
		},
		// NOTE: Not interested in testing failure here, just an ability to reach
		// the PIN checking stage.
		SubmittingOtp: {
			on: {
				GOOD_OTP: "CheckingForAPinButThereIsntOne",
			},
			meta: {
				test: async () => {
					await currentStateIs(AuthStateId.SubmittingOtp);
					await stageErrorIs("n/a");
				},
			},
		},
		CheckingForAPinAndThereIsOne: {
			on: {
				THERE_IS_A_PIN_STORED: "SubmittingCurrentPin",
			},
			meta: {
				test: async () => {
					await currentStateIs(AuthStateId.CheckingForPin);
					await stageErrorIs("n/a");
				},
			},
		},
		CheckingForAPinButThereIsntOne: {
			on: {
				THERE_IS_NO_PIN_STORED: "SubmittingNewPin",
			},
			meta: {
				test: async () => {
					await currentStateIs(AuthStateId.CheckingForPin);
					await stageErrorIs("n/a");
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
					await currentStateIs(AuthStateId.SubmittingCurrentPin);
					await stageErrorIs("n/a");
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
					await currentStateIs(AuthStateId.SubmittingCurrentPin);
					await stageErrorIs("PIN_INVALID");
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
					await currentStateIs(AuthStateId.ForgottenPinRequestingReset);
					await stageErrorIs("n/a");
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
					await currentStateIs(AuthStateId.SubmittingNewPin);
					await stageErrorIs("n/a");
				},
			},
		},
		SubmittingNewPinError: {
			on: {
				NEW_PIN_IS_VALID: "Authenticated",
			},
			meta: {
				test: async () => {
					await currentStateIs(AuthStateId.SubmittingNewPin);
					await stageErrorIs("NEW_PIN_INVALID");
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
					await currentStateIs(AuthStateId.Authenticated);
					await stageErrorIs("n/a");
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
					await currentStateIs(AuthStateId.AuthenticatedValidatingPin);
					await stageErrorIs("n/a");
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
					await currentStateIs(AuthStateId.AuthenticatedValidatingPin);
					await stageErrorIs("PIN_INVALID");
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
					await currentStateIs(AuthStateId.AuthenticatedChangingPin);
					await stageErrorIs("n/a");
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
					await currentStateIs(AuthStateId.AuthenticatedChangingPin);
					await stageErrorIs("PIN_CHANGE_FAILURE");
				},
			},
		},
		PinChangedSuccess: {
			on: {
				CONFIRM_SUCCESSFUL_PIN_CHANGE: "Authenticated",
			},
			meta: {
				test: async () => {
					await currentStateIs(AuthStateId.AuthenticatedPinChangeSuccess);
					await stageErrorIs("n/a");
				},
			},
		},
		LoggingOut: {
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
		localStorageEmulation.setItem(PIN_KEY, VALID_PIN);
		clickButton(controlLabels.checkForExistingSession);
		await waitFor(() => expect(checkSessionCb).toHaveBeenCalled());
		await stageLoadingStatusIs("false");
	},
	THERE_IS_NO_SESSION: async () => {
		const controlLabels = uiText.authStages.checkingForSession.controlLabels;
		localStorageEmulation.clear();
		(checkSessionCb as jest.MockedFunction<CheckSessionCb>).mockRejectedValueOnce(null);
		clickButton(controlLabels.checkForExistingSession);
		await waitFor(() => expect(checkSessionCb).toHaveBeenCalled());
		(checkSessionCb as jest.MockedFunction<CheckSessionCb>).mockReset();
		await stageLoadingStatusIs("false");
	},
	GOOD_USERNAME: async () => {
		const controlLabels = uiText.authStages.submittingOtpUsername.controlLabels;
		findInputClearInputFillInput(controlLabels.otpUsernameInput, VALID_USERNAME);
		clickButton(controlLabels.submitOtpUsername);
		await waitFor(() => expect(validateOtpUsernameCb).toHaveBeenCalledWith(VALID_USERNAME));
		await stageLoadingStatusIs("false");
	},
	GOOD_OTP: async () => {
		const controlLabels = uiText.authStages.submittingOtp.controlLabels;
		findInputClearInputFillInput(controlLabels.otpInput, VALID_CODE);
		clickButton(controlLabels.submitOtp);
		await waitFor(() => expect(validateOtpCb).toHaveBeenCalledWith(USER_OBJECT, VALID_CODE));
		await stageLoadingStatusIs("false");
	},
	THERE_IS_A_PIN_STORED: async () => {
		const controlLabels = uiText.authStages.checkingForPin.controlLabels;
		clickButton(controlLabels.checkForExistingPin);
		await waitFor(() => expect(checkForExistingPinCb).toHaveBeenCalled());
		await stageLoadingStatusIs("false");
	},
	THERE_IS_NO_PIN_STORED: async () => {
		const controlLabels = uiText.authStages.checkingForPin.controlLabels;
		clickButton(controlLabels.checkForExistingPin);
		await waitFor(() => expect(checkForExistingPinCb).toHaveBeenCalled());
		await stageLoadingStatusIs("false");
	},
	CURRENT_PIN_IS_VALID: async () => {
		const controlLabels = uiText.authStages.submittingCurrentPin.controlLabels;
		findInputClearInputFillInput(controlLabels.pinInput, VALID_PIN);
		clickButton(controlLabels.submitPin);
		await waitFor(() => expect(validatePinCb).toHaveBeenCalledWith(VALID_PIN));
		await stageLoadingStatusIs("false");
	},
	CURRENT_PIN_IS_INVALID: async () => {
		const controlLabels = uiText.authStages.submittingCurrentPin.controlLabels;
		findInputClearInputFillInput(controlLabels.pinInput, INVALID_PIN);
		clickButton(controlLabels.submitPin);
		await waitFor(() => expect(validatePinCb).toHaveBeenCalledWith(INVALID_PIN));
		await stageLoadingStatusIs("false");
	},
	FORGOTTEN_PIN: async () => {
		const controlLabels = uiText.authStages.submittingCurrentPin.controlLabels;
		clickButton(controlLabels.forgotPin);
	},
	CONFIRM_PIN_RESET: async () => {
		const controlLabels = uiText.authStages.forgottenPinRequestingReset.controlLabels;
		clickButton(controlLabels.resetPin);
		await waitFor(() => expect(resetPinCb).toHaveBeenCalled());
		await stageLoadingStatusIs("false");
	},
	CANCEL_PIN_RESET: async () => {
		const controlLabels = uiText.authStages.forgottenPinRequestingReset.controlLabels;
		clickButton(controlLabels.cancelReset);
	},
	NEW_PIN_IS_VALID: async () => {
		const controlLabels = uiText.authStages.submittingNewPin.controlLabels;
		findInputClearInputFillInput(controlLabels.newPinInput, VALID_PIN);
		clickButton(controlLabels.submitPin);
		await waitFor(() => expect(setNewPinCb).toHaveBeenCalledWith(VALID_PIN));
		await stageLoadingStatusIs("false");
	},
	NEW_PIN_IS_INVALID: async () => {
		const controlLabels = uiText.authStages.submittingNewPin.controlLabels;
		findInputClearInputFillInput(controlLabels.newPinInput, INVALID_PIN);
		clickButton(controlLabels.submitPin);
		await waitFor(() => expect(setNewPinCb).toHaveBeenCalledWith(INVALID_PIN));
		await stageLoadingStatusIs("false");
	},
	REQUEST_PIN_CHANGE: async () => {
		const controlLabels = uiText.authStages.authenticated.controlLabels;
		clickButton(controlLabels.changePin);
	},
	CURRENT_PIN_IS_VALID_CHANGE_ALLOWED: async () => {
		const controlLabels = uiText.authStages.authenticatedValidatingPin.controlLabels;
		findInputClearInputFillInput(controlLabels.enterPin, VALID_PIN);
		clickButton(controlLabels.submitPin);
		await waitFor(() => expect(validatePinCb).toHaveBeenCalledWith(VALID_PIN));
		await stageLoadingStatusIs("false");
	},
	CURRENT_PIN_IS_INVALID_CHANGE_REJECTED: async () => {
		const controlLabels = uiText.authStages.authenticatedValidatingPin.controlLabels;
		findInputClearInputFillInput(controlLabels.enterPin, INVALID_PIN);
		clickButton(controlLabels.submitPin);
		await waitFor(() => expect(validatePinCb).toHaveBeenCalledWith(INVALID_PIN));
		await stageLoadingStatusIs("false");
	},
	CANCEL_PIN_CHANGE_REQUEST_AT_VALIDATION_STAGE: async () => {
		const controlLabels = uiText.authStages.authenticatedValidatingPin.controlLabels;
		clickButton(controlLabels.cancelPinChange);
	},
	NEW_PIN_IS_VALID_CHANGE_ACCEPTED: async () => {
		const controlLabels = uiText.authStages.authenticatedChangingPin.controlLabels;
		findInputClearInputFillInput(controlLabels.enterPinInput, VALID_PIN);
		clickButton(controlLabels.submitPin);
		await waitFor(() => expect(setNewPinCb).toHaveBeenCalledWith(VALID_PIN));
		await stageLoadingStatusIs("false");
	},
	NEW_PIN_IS_INVALID_CHANGE_REJECTED: async () => {
		const controlLabels = uiText.authStages.authenticatedChangingPin.controlLabels;
		findInputClearInputFillInput(controlLabels.enterPinInput, INVALID_PIN);
		clickButton(controlLabels.submitPin);
		await waitFor(() => expect(setNewPinCb).toHaveBeenCalledWith(INVALID_PIN));
		await stageLoadingStatusIs("false");
	},
	CANCEL_PIN_CHANGE_REQUEST_AT_CHANGE_STAGE: async () => {
		const controlLabels = uiText.authStages.authenticatedChangingPin.controlLabels;
		clickButton(controlLabels.cancelPinChange);
	},
	CONFIRM_SUCCESSFUL_PIN_CHANGE: async () => {
		const controlLabels = uiText.authStages.authenticatedPinChangeSuccess.controlLabels;
		clickButton(controlLabels.confirm);
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
		localStorageEmulation.clear();
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
							initialDeviceSecurityType="PIN"
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
