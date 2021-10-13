/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { createModel } from "@xstate/test";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMachine } from "xstate";

import { AuthStateId } from "core/auth-system";
import { customScreen } from "test-utils/find-by-term";
import {
	currentDeviceSecurityTypeIs,
	currentLoginFlowIs,
	currentStateIs,
	stageErrorIs,
	stageLoadingStatusIs,
} from "test-utils/assertion-helpers";
import {
	VALID_USERNAME,
	INVALID_USERNAME,
	VALID_CODE,
	INVALID_CODE,
	VALID_PASSWORD,
	INVALID_PASSWORD,
	OLD_PASSWORD,
	USER_OBJECT,
} from "test-utils/dummy-responses";
import uiText from "test-app/ui-copy";

import {
	checkSessionCb,
	validateUsernameAndPasswordCb,
	validateForceChangePasswordCb,
	logoutCb,
	requestNewPasswordCb,
	submitNewPasswordCb,
} from "test-app/stages/callback-implementations";

import type { CheckSessionCb, LogoutCb } from "core/react";

jest.mock("test-app/stages/callback-implementations", () => ({
	checkSessionCb: jest.fn(),
}));

const machine = createMachine({
	id: "userenamePasswordNoPin",
	initial: "CheckingSession",
	states: {
		CheckingSession: {
			on: {
				THERE_IS_A_SESSION: "Authenticated",
				THERE_IS_NO_SESSION: "SubmittingUsernameAndPassword",
			},
			meta: {
				test: async () => {
					await currentStateIs(AuthStateId.CheckingForSession);
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
				PASSWORD_CHANGE_SUCCESS: "CheckingSession",
				PASSWORD_CHANGE_FAILURE: "SubmittingNewPasswordError",
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
				PASSWORD_CHANGE_SUCCESS: "CheckingSession",
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
		userEvent.click(await customScreen.findByText(controlLabels.checkForExistingSession));
		await waitFor(() => expect(checkSessionCb).toHaveBeenCalled());
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await stageLoadingStatusIs("false");
	},
	THERE_IS_NO_SESSION: async () => {
		const controlLabels = uiText.authStages.checkingForSession.controlLabels;
		(checkSessionCb as jest.MockedFunction<CheckSessionCb>).mockRejectedValueOnce(null);
		userEvent.click(await customScreen.findByText(controlLabels.checkForExistingSession));
		await waitFor(() => expect(checkSessionCb).toHaveBeenCalled());
		(checkSessionCb as jest.MockedFunction<CheckSessionCb>).mockReset();
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await stageLoadingStatusIs("false");
	},
	GOOD_USERNAME_AND_PASSWORD: async () => {
		const controlLabels = uiText.authStages.submittingUsernameAndPassword.controlLabels;
		const usernameinput = await customScreen.findByText(controlLabels.usernameInput);
		const passwordinput = await customScreen.findByText(controlLabels.passwordInput);
		userEvent.clear(usernameinput);
		userEvent.clear(passwordinput);
		userEvent.type(usernameinput, VALID_USERNAME);
		userEvent.type(passwordinput, VALID_PASSWORD);
		userEvent.click(await customScreen.findByText(controlLabels.logIn));
		await waitFor(() =>
			expect(validateUsernameAndPasswordCb).toHaveBeenCalledWith(VALID_USERNAME, VALID_PASSWORD)
		);
		await stageLoadingStatusIs("false");
	},
	BAD_USERNAME_AND_PASSWORD: async () => {
		const controlLabels = uiText.authStages.submittingUsernameAndPassword.controlLabels;
		const usernameinput = await customScreen.findByText(controlLabels.usernameInput);
		const passwordinput = await customScreen.findByText(controlLabels.passwordInput);
		userEvent.clear(usernameinput);
		userEvent.clear(passwordinput);
		userEvent.type(usernameinput, INVALID_USERNAME);
		userEvent.type(passwordinput, INVALID_PASSWORD);
		userEvent.click(await customScreen.findByText(controlLabels.logIn));
		await waitFor(() =>
			expect(validateUsernameAndPasswordCb).toHaveBeenCalledWith(INVALID_USERNAME, INVALID_PASSWORD)
		);
		await stageLoadingStatusIs("false");
	},
	FORCE_PASSWORD_RESET_REQUIRED: async () => {
		const controlLabels = uiText.authStages.submittingUsernameAndPassword.controlLabels;
		const usernameinput = await customScreen.findByText(controlLabels.usernameInput);
		const passwordinput = await customScreen.findByText(controlLabels.passwordInput);
		userEvent.clear(usernameinput);
		userEvent.clear(passwordinput);
		userEvent.type(usernameinput, VALID_USERNAME);
		userEvent.type(passwordinput, OLD_PASSWORD);
		userEvent.click(await customScreen.findByText(controlLabels.logIn));
		await waitFor(() =>
			expect(validateUsernameAndPasswordCb).toHaveBeenCalledWith(VALID_USERNAME, OLD_PASSWORD)
		);
		await stageLoadingStatusIs("false");
	},
	GOOD_FORCE_RESET_PASSWORD: async () => {
		const controlLabels = uiText.authStages.submittingForceChangePassword.controlLabels;
		const input = await customScreen.findByLabelText(controlLabels.newPasswordInput);
		userEvent.clear(input);
		userEvent.type(input, VALID_PASSWORD);
		userEvent.click(await customScreen.findByText(controlLabels.submitPassword));
		await waitFor(() =>
			expect(validateForceChangePasswordCb).toHaveBeenCalledWith(USER_OBJECT, VALID_PASSWORD)
		);
		await stageLoadingStatusIs("false");
	},
	BAD_FORCE_RESET_PASSWORD: async () => {
		const controlLabels = uiText.authStages.submittingForceChangePassword.controlLabels;
		const input = await customScreen.findByLabelText(controlLabels.newPasswordInput);
		userEvent.clear(input);
		userEvent.type(input, INVALID_PASSWORD);
		userEvent.click(await customScreen.findByText(controlLabels.submitPassword));
		await waitFor(() =>
			expect(validateForceChangePasswordCb).toHaveBeenCalledWith(USER_OBJECT, INVALID_PASSWORD)
		);
		await stageLoadingStatusIs("false");
	},
	FORGOT_PASSWORD: async () => {
		const controlLabels = uiText.authStages.submittingUsernameAndPassword.controlLabels;
		userEvent.click(await customScreen.findByText(controlLabels.forgotPassword));
	},
	PASSWORD_RESET_REQUEST_SUCCESS: async () => {
		const controlLabels = uiText.authStages.forgottenPasswordRequestingReset.controlLabels;
		const input = await customScreen.findByLabelText(controlLabels.enterEmailInput);
		userEvent.clear(input);
		userEvent.type(input, VALID_USERNAME);
		userEvent.click(await customScreen.findByText(controlLabels.requestResetCode));
		await waitFor(() => expect(requestNewPasswordCb).toHaveBeenCalledWith(VALID_USERNAME));
		await stageLoadingStatusIs("false");
	},
	PASSWORD_RESET_REQUEST_FAILURE: async () => {
		const controlLabels = uiText.authStages.forgottenPasswordRequestingReset.controlLabels;
		const input = await customScreen.findByLabelText(controlLabels.enterEmailInput);
		userEvent.clear(input);
		userEvent.type(input, INVALID_USERNAME);
		userEvent.click(await customScreen.findByText(controlLabels.requestResetCode));
		await waitFor(() => expect(requestNewPasswordCb).toHaveBeenCalledWith(INVALID_USERNAME));
		await stageLoadingStatusIs("false");
	},
	CANCEL_PASSWORD_RESET: async () => {
		const controlLabels = uiText.authStages.forgottenPasswordRequestingReset.controlLabels;
		userEvent.click(await customScreen.findByText(controlLabels.cancelPasswordReset));
	},
	PASSWORD_CHANGE_SUCCESS: async () => {
		const controlLabels = uiText.authStages.forgottenPasswordSubmittingReset.controlLabels;
		const codeinput = await customScreen.findByLabelText(controlLabels.resetCodeInput);
		const passwordinput = await customScreen.findByLabelText(controlLabels.newPasswordInput);
		userEvent.clear(codeinput);
		userEvent.clear(passwordinput);
		userEvent.type(codeinput, VALID_CODE);
		userEvent.type(passwordinput, VALID_PASSWORD);
		userEvent.click(await customScreen.findByText(controlLabels.submitReset));
		await waitFor(() =>
			expect(submitNewPasswordCb).toHaveBeenCalledWith(VALID_USERNAME, VALID_CODE, VALID_PASSWORD)
		);
		await stageLoadingStatusIs("false");
	},
	PASSWORD_CHANGE_FAILURE: async () => {
		const controlLabels = uiText.authStages.forgottenPasswordSubmittingReset.controlLabels;
		const codeinput = await customScreen.findByLabelText(controlLabels.resetCodeInput);
		const passwordinput = await customScreen.findByLabelText(controlLabels.newPasswordInput);
		userEvent.clear(codeinput);
		userEvent.clear(passwordinput);
		userEvent.type(codeinput, INVALID_CODE);
		userEvent.type(passwordinput, INVALID_PASSWORD);
		userEvent.click(await customScreen.findByText(controlLabels.submitReset));
		await waitFor(() =>
			expect(submitNewPasswordCb).toHaveBeenCalledWith(
				VALID_USERNAME,
				INVALID_CODE,
				INVALID_PASSWORD
			)
		);
		await stageLoadingStatusIs("false");
	},
	REENTER_USERNAME_TO_RESEND_CODE: async () => {
		const controlLabels = uiText.authStages.forgottenPasswordSubmittingReset.controlLabels;
		userEvent.click(await customScreen.findByText(controlLabels.resendCode));
	},
	REQUEST_LOG_OUT: async () => {
		const controlLabels = uiText.authStages.authenticated.controlLabels;
		userEvent.click(await customScreen.findByText(controlLabels.logOut));
	},
	CANCEL_LOG_OUT: async () => {
		const controlLabels = uiText.authStages.authenticatedLoggingOut.controlLabels;
		userEvent.click(await customScreen.findByText(controlLabels.cancelLogOut));
	},
	GOOD_LOG_OUT: async () => {
		const controlLabels = uiText.authStages.authenticatedLoggingOut.controlLabels;
		userEvent.click(await customScreen.findByText(controlLabels.logOut));
		await waitFor(() => expect(logoutCb).toHaveBeenCalled());
		await stageLoadingStatusIs("false");
	},
	BAD_LOG_OUT: async () => {
		const controlLabels = uiText.authStages.authenticatedLoggingOut.controlLabels;
		(logoutCb as jest.MockedFunction<LogoutCb>).mockRejectedValueOnce(null);
		userEvent.click(await customScreen.findByText(controlLabels.logOut));
		await waitFor(() => expect(logoutCb).toHaveBeenCalled());
		(logoutCb as jest.MockedFunction<LogoutCb>).mockReset();
		await stageLoadingStatusIs("false");
	},
	REQUEST_PASSWORD_CHANGE_WHEN_AUTHENTICATED: async () => {
		const controlLabels = uiText.authStages.authenticated.controlLabels;
		userEvent.click(await customScreen.findByText(controlLabels.changePassword));
	},
	SUCCESSFUL_PASSWORD_CHANGE: async () => {
		const controlLabels = uiText.authStages.authenticatedChangingPassword.controlLabels;
		const oldPasswordInput = await customScreen.findByLabelText(controlLabels.currentPasswordInput);
		const newPasswordinput = await customScreen.findByLabelText(controlLabels.newPasswordInput);
		userEvent.clear(oldPasswordInput);
		userEvent.clear(newPasswordinput);
		userEvent.type(oldPasswordInput, VALID_PASSWORD);
		userEvent.type(newPasswordinput, VALID_PASSWORD);
		userEvent.click(await customScreen.findByText(controlLabels.changePassword));
		await waitFor(() =>
			expect(submitNewPasswordCb).toHaveBeenCalledWith(VALID_PASSWORD, VALID_PASSWORD)
		);
		await stageLoadingStatusIs("false");
	},
	UNSUCCESSFUL_PASSWORD_CHANGE: async () => {
		const controlLabels = uiText.authStages.authenticatedChangingPassword.controlLabels;
		const oldPasswordInput = await customScreen.findByLabelText(controlLabels.currentPasswordInput);
		const newPasswordinput = await customScreen.findByLabelText(controlLabels.newPasswordInput);
		userEvent.clear(oldPasswordInput);
		userEvent.clear(newPasswordinput);
		userEvent.type(oldPasswordInput, INVALID_PASSWORD);
		userEvent.type(newPasswordinput, INVALID_PASSWORD);
		userEvent.click(await customScreen.findByText(controlLabels.changePassword));
		await waitFor(() =>
			expect(submitNewPasswordCb).toHaveBeenCalledWith(INVALID_PASSWORD, INVALID_PASSWORD)
		);
		await stageLoadingStatusIs("false");
	},
	CANCEL_PASSWORD_CHANGE: async () => {
		const controlLabels = uiText.authStages.authenticatedChangingPassword.controlLabels;
		userEvent.click(await customScreen.findByText(controlLabels.cancelChangePassword));
	},
});

export const usernamePasswordNoPin = { machine, model };
