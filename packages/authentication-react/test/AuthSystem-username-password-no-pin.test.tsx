/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import React from "react";
import { render, waitFor } from "@testing-library/react";
import { AuthStateId } from "@thingco/authentication-core";
import type { CheckSessionCb, LogoutCb } from "@thingco/authentication-react";
import { createModel } from "@xstate/test";
import { Authentication } from "test-app/App";
import { ConfigInjector } from "test-app/ConfigInjector";
import {
    changePasswordCb, checkSessionCb, logoutCb, requestNewPasswordCb,
    submitNewPasswordCb, validateForceChangePasswordCb, validateUsernameAndPasswordCb
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
    MOCK_INVALID_CODE, MOCK_INVALID_PASSWORD, MOCK_INVALID_USERNAME, MOCK_OLD_PASSWORD, MOCK_USER_OBJECT, MOCK_VALID_CODE,
    MOCK_VALID_PASSWORD,
    MOCK_VALID_USERNAME
} from "test-utils/dummy-responses";
import { clickButton, findInputClearInputFillInput } from "test-utils/event-helpers";
import { localStorageMock } from "test-utils/local-storage";
import { createMachine } from "xstate";

jest.mock("test-app/stages/callback-implementations", () => ({
	checkSessionCb: jest.fn(),
	validateUsernameAndPasswordCb: jest.fn(async (username, password) => {
		if (username === MOCK_VALID_USERNAME && password === MOCK_VALID_PASSWORD) {
			return Promise.resolve(MOCK_USER_OBJECT);
		} else if (username === MOCK_VALID_USERNAME && password === MOCK_OLD_PASSWORD) {
			return Promise.resolve(["NEW_PASSWORD_REQUIRED", MOCK_USER_OBJECT]);
		} else {
			return Promise.reject();
		}
	}),
	validateForceChangePasswordCb: jest.fn(async (user, password) => {
		if (user === MOCK_USER_OBJECT && password === MOCK_VALID_PASSWORD) {
			return Promise.resolve();
		} else {
			return Promise.reject();
		}
	}),
	requestNewPasswordCb: jest.fn(async (username) => {
		if (username === MOCK_VALID_USERNAME) {
			return Promise.resolve();
		} else {
			return Promise.reject();
		}
	}),
	submitNewPasswordCb: jest.fn(async (username, code, newPassword) => {
		if (username === MOCK_VALID_USERNAME && code === MOCK_VALID_CODE && newPassword === MOCK_VALID_PASSWORD) {
			return Promise.resolve();
		} else {
			return Promise.reject();
		}
	}),
	changePasswordCb: jest.fn(async (oldPassword, newPassword) => {
		if (oldPassword === MOCK_VALID_PASSWORD && newPassword === MOCK_VALID_PASSWORD) {
			return Promise.resolve();
		} else {
			return Promise.reject();
		}
	}),
	logOutCb: jest.fn(),
}));


/* ------------------------------------------------------------------------- *\
 * SYSTEM UNDER TEST
\* ------------------------------------------------------------------------- */

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
				test: async () => {
					await currentStateIs(AuthStateId.CheckingSession);
					await currentLoginFlowIs("USERNAME_PASSWORD");
					await currentDeviceSecurityTypeIs("NONE");
					await stageErrorIs("n/a");
				},
			},
		},
		SubmittingUsernameAndPassword: {
			on: {
				GOOD_USERNAME_AND_PASSWORD: "Authenticated",
				FORCE_PASSWORD_RESET_REQUIRED: "SubmittingForceResetPassword",
				BAD_USERNAME_AND_PASSWORD: "UsernameOrPasswordError",
				FORGOT_PASSWORD: "RequestingNewPassword",
			},
			meta: {
				test: async () => {
					await currentStateIs(AuthStateId.SubmittingUsernameAndPassword);
					await stageErrorIs("n/a");
				},
			},
		},
		UsernameOrPasswordError: {
			on: {
				GOOD_USERNAME_AND_PASSWORD: "Authenticated",
			},
			meta: {
				test: async () => {
					await currentStateIs(AuthStateId.SubmittingUsernameAndPassword);
					await stageErrorIs("USERNAME_AND_PASSWORD_INVALID");
				},
			},
		},
		SubmittingForceResetPassword: {
			on: {
				GOOD_FORCE_RESET_PASSWORD: "Authenticated",
				BAD_FORCE_RESET_PASSWORD: "SubmittingForceResetPasswordError",
			},
			meta: {
				test: async () => {
					await currentStateIs(AuthStateId.SubmittingForceChangePassword);
					await stageErrorIs("PASSWORD_CHANGE_REQUIRED");
				},
			},
		},
		SubmittingForceResetPasswordError: {
			on: {
				GOOD_FORCE_RESET_PASSWORD: "Authenticated",
			},
			meta: {
				test: async () => {
					await currentStateIs(AuthStateId.SubmittingForceChangePassword);
					await stageErrorIs("PASSWORD_CHANGE_FAILURE");
				},
			},
		},
		RequestingNewPassword: {
			on: {
				PASSWORD_RESET_REQUEST_SUCCESS: "SubmittingNewPassword",
				PASSWORD_RESET_REQUEST_FAILURE: "RequestingNewPasswordError",
				CANCEL_PASSWORD_RESET: "SubmittingUsernameAndPassword",
			},
			meta: {
				test: async () => {
					await currentStateIs(AuthStateId.ForgottenPasswordRequestingReset);
					await stageErrorIs("n/a");
				},
			},
		},
		RequestingNewPasswordError: {
			on: {
				PASSWORD_RESET_REQUEST_SUCCESS: "SubmittingNewPassword",
			},
			meta: {
				test: async () => {
					await currentStateIs(AuthStateId.ForgottenPasswordRequestingReset);
					await stageErrorIs("PASSWORD_RESET_REQUEST_FAILURE");
				},
			},
		},
		SubmittingNewPassword: {
			on: {
				PASSWORD_RESET_SUCCESS: "CheckingSession",
				PASSWORD_RESET_FAILURE: "SubmittingNewPasswordError",
			},
			meta: {
				test: async () => {
					await currentStateIs(AuthStateId.ForgottenPasswordSubmittingReset);
					await stageErrorIs("n/a");
				},
			},
		},
		SubmittingNewPasswordError: {
			on: {
				PASSWORD_RESET_SUCCESS: "CheckingSession",
				REENTER_USERNAME_TO_RESEND_CODE: "RequestingNewPassword",
			},
			meta: {
				test: async () => {
					await currentStateIs(AuthStateId.ForgottenPasswordSubmittingReset);
					await stageErrorIs("PASSWORD_RESET_FAILURE");
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
		AuthenticatedChangingPassword: {
			on: {
				SUCCESSFUL_PASSWORD_CHANGE: "Authenticated",
				UNSUCCESSFUL_PASSWORD_CHANGE: "AuthenticatedChangingPasswordError",
				CANCEL_PASSWORD_CHANGE: "Authenticated",
			},
			meta: {
				test: async () => {
					await currentStateIs(AuthStateId.AuthenticatedChangingPassword);
					await stageErrorIs("n/a");
				},
			},
		},
		AuthenticatedChangingPasswordError: {
			on: {
				SUCCESSFUL_PASSWORD_CHANGE: "Authenticated",
				CANCEL_PASSWORD_CHANGE: "Authenticated",
			},
			meta: {
				test: async () => {
					await currentStateIs(AuthStateId.AuthenticatedChangingPassword);
					await stageErrorIs("PASSWORD_CHANGE_FAILURE");
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
		await stageLoadingStatusIs("false");
	},
	GOOD_USERNAME_AND_PASSWORD: async () => {
		const controlLabels = uiText.authStages.submittingUsernameAndPassword.controlLabels;
		findInputClearInputFillInput(controlLabels.usernameInput, MOCK_VALID_USERNAME);
		findInputClearInputFillInput(controlLabels.passwordInput, MOCK_VALID_PASSWORD);
		clickButton(controlLabels.logIn);
		await waitFor(() =>
			expect(validateUsernameAndPasswordCb).toHaveBeenCalledWith(MOCK_VALID_USERNAME, MOCK_VALID_PASSWORD)
		);
		await stageLoadingStatusIs("false");
	},
	BAD_USERNAME_AND_PASSWORD: async () => {
		const controlLabels = uiText.authStages.submittingUsernameAndPassword.controlLabels;
		findInputClearInputFillInput(controlLabels.usernameInput, MOCK_INVALID_USERNAME);
		findInputClearInputFillInput(controlLabels.passwordInput, MOCK_INVALID_PASSWORD);
		clickButton(controlLabels.logIn);
		await waitFor(() =>
			expect(validateUsernameAndPasswordCb).toHaveBeenCalledWith(MOCK_INVALID_USERNAME, MOCK_INVALID_PASSWORD)
		);
		await stageLoadingStatusIs("false");
	},
	FORCE_PASSWORD_RESET_REQUIRED: async () => {
		const controlLabels = uiText.authStages.submittingUsernameAndPassword.controlLabels;
		findInputClearInputFillInput(controlLabels.usernameInput, MOCK_VALID_USERNAME);
		findInputClearInputFillInput(controlLabels.passwordInput, MOCK_OLD_PASSWORD);
		clickButton(controlLabels.logIn);
		await waitFor(() =>
			expect(validateUsernameAndPasswordCb).toHaveBeenCalledWith(MOCK_VALID_USERNAME, MOCK_OLD_PASSWORD)
		);
		await stageLoadingStatusIs("false");
	},
	GOOD_FORCE_RESET_PASSWORD: async () => {
		const controlLabels = uiText.authStages.submittingForceChangePassword.controlLabels;
		findInputClearInputFillInput(controlLabels.newPasswordInput, MOCK_VALID_PASSWORD);
		clickButton(controlLabels.submitPassword);
		await waitFor(() =>
			expect(validateForceChangePasswordCb).toHaveBeenCalledWith(MOCK_USER_OBJECT, MOCK_VALID_PASSWORD)
		);
		await stageLoadingStatusIs("false");
	},
	BAD_FORCE_RESET_PASSWORD: async () => {
		const controlLabels = uiText.authStages.submittingForceChangePassword.controlLabels;
		findInputClearInputFillInput(controlLabels.newPasswordInput, MOCK_INVALID_PASSWORD);
		clickButton(controlLabels.submitPassword);
		await waitFor(() =>
			expect(validateForceChangePasswordCb).toHaveBeenCalledWith(MOCK_USER_OBJECT, MOCK_INVALID_PASSWORD)
		);
		await stageLoadingStatusIs("false");
	},
	FORGOT_PASSWORD: async () => {
		const controlLabels = uiText.authStages.submittingUsernameAndPassword.controlLabels;
		clickButton(controlLabels.forgotPassword);
	},
	PASSWORD_RESET_REQUEST_SUCCESS: async () => {
		const controlLabels = uiText.authStages.forgottenPasswordRequestingReset.controlLabels;
		findInputClearInputFillInput(controlLabels.enterEmailInput, MOCK_VALID_USERNAME);
		clickButton(controlLabels.requestResetCode);
		await waitFor(() => expect(requestNewPasswordCb).toHaveBeenCalledWith(MOCK_VALID_USERNAME));
		await stageLoadingStatusIs("false");
	},
	PASSWORD_RESET_REQUEST_FAILURE: async () => {
		const controlLabels = uiText.authStages.forgottenPasswordRequestingReset.controlLabels;
		findInputClearInputFillInput(controlLabels.enterEmailInput, MOCK_INVALID_USERNAME);
		clickButton(controlLabels.requestResetCode);
		await waitFor(() => expect(requestNewPasswordCb).toHaveBeenCalledWith(MOCK_INVALID_USERNAME));
		await stageLoadingStatusIs("false");
	},
	CANCEL_PASSWORD_RESET: async () => {
		const controlLabels = uiText.authStages.forgottenPasswordRequestingReset.controlLabels;
		clickButton(controlLabels.cancelPasswordReset);
	},
	PASSWORD_RESET_SUCCESS: async () => {
		const controlLabels = uiText.authStages.forgottenPasswordSubmittingReset.controlLabels;
		findInputClearInputFillInput(controlLabels.resetCodeInput, MOCK_VALID_CODE);
		findInputClearInputFillInput(controlLabels.newPasswordInput, MOCK_VALID_PASSWORD);
		clickButton(controlLabels.submitReset);
		await waitFor(() =>
			expect(submitNewPasswordCb).toHaveBeenCalledWith(MOCK_VALID_USERNAME, MOCK_VALID_CODE, MOCK_VALID_PASSWORD)
		);
		await stageLoadingStatusIs("false");
	},
	PASSWORD_RESET_FAILURE: async () => {
		const controlLabels = uiText.authStages.forgottenPasswordSubmittingReset.controlLabels;
		findInputClearInputFillInput(controlLabels.resetCodeInput, MOCK_INVALID_CODE);
		findInputClearInputFillInput(controlLabels.newPasswordInput, MOCK_INVALID_PASSWORD);
		clickButton(controlLabels.submitReset);
		await waitFor(() =>
			expect(submitNewPasswordCb).toHaveBeenCalledWith(
				MOCK_VALID_USERNAME,
				MOCK_INVALID_CODE,
				MOCK_INVALID_PASSWORD
			)
		);
		await stageLoadingStatusIs("false");
	},
	REENTER_USERNAME_TO_RESEND_CODE: async () => {
		const controlLabels = uiText.authStages.forgottenPasswordSubmittingReset.controlLabels;
		clickButton(controlLabels.resendCode);
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
	REQUEST_PASSWORD_CHANGE_WHEN_AUTHENTICATED: async () => {
		const controlLabels = uiText.authStages.authenticated.controlLabels;
		clickButton(controlLabels.changePassword);
	},
	SUCCESSFUL_PASSWORD_CHANGE: async () => {
		const controlLabels = uiText.authStages.authenticatedChangingPassword.controlLabels;
		findInputClearInputFillInput(controlLabels.currentPasswordInput, MOCK_VALID_PASSWORD);
		findInputClearInputFillInput(controlLabels.newPasswordInput, MOCK_VALID_PASSWORD);
		clickButton(controlLabels.changePassword);
		await waitFor(() =>
			expect(changePasswordCb).toHaveBeenCalledWith(MOCK_VALID_PASSWORD, MOCK_VALID_PASSWORD)
		);
		await stageLoadingStatusIs("false");
	},
	UNSUCCESSFUL_PASSWORD_CHANGE: async () => {
		const controlLabels = uiText.authStages.authenticatedChangingPassword.controlLabels;
		findInputClearInputFillInput(controlLabels.currentPasswordInput, MOCK_INVALID_PASSWORD);
		findInputClearInputFillInput(controlLabels.newPasswordInput, MOCK_INVALID_PASSWORD);
		clickButton(controlLabels.changePassword);
		await waitFor(() =>
			expect(changePasswordCb).toHaveBeenCalledWith(MOCK_INVALID_PASSWORD, MOCK_INVALID_PASSWORD)
		);
		await stageLoadingStatusIs("false");
	},
	CANCEL_PASSWORD_CHANGE: async () => {
		const controlLabels = uiText.authStages.authenticatedChangingPassword.controlLabels;
		clickButton(controlLabels.cancelChangePassword);
	},
});

/* ------------------------------------------------------------------------- *\
 * TESTS
\* ------------------------------------------------------------------------- */

describe("authentication test system using username password and no device security", () => {
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
							initialLoginFlowType="USERNAME_PASSWORD"
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
