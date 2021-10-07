/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { createModel } from "@xstate/test";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMachine } from "xstate";

import { AuthStateId } from "core/auth-system";
import {
	customScreen,
	VALID_USERNAME,
	INVALID_USERNAME,
	VALID_CODE,
	INVALID_CODE,
	VALID_PASSWORD,
	INVALID_PASSWORD,
	OLD_PASSWORD,
	USER_OBJECT,
} from "../utilities";

import {
	checkSessionCb,
	validateUsernameAndPasswordCb,
	validateForceChangePasswordCb,
	logoutCb,
	requestNewPasswordCb,
	submitNewPasswordCb,
} from "test-app/stages/callback-implementations";

import type { AuthError, LoginFlowType, DeviceSecurityType } from "core/types";
import type { CheckSessionCb, LogoutCb } from "core/react";

jest.mock("test-app/stages/callback-implementations");

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
					// The overall reporter (prints machine context values to customScreen.:
					expect(
						await customScreen.findByText(`Current stage: ${AuthStateId.CheckingForSession}`)
					).toBeDefined();
					// NOTE: Only need to check these once, they should stay constant
					//       throughout the test as they're read-only values:
					expect(
						await customScreen.findByText(
							`Current login flow: ${"USERNAME_PASSWORD" as LoginFlowType}`
						)
					).toBeDefined();
					expect(
						await customScreen.findByText(
							`Current device security: ${"NONE" as DeviceSecurityType}`
						)
					).toBeDefined();

					// The reporter for this stage (prints hook state values):
					expect(await customScreen.findByText("Error: n/a")).toBeDefined();
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
					// The overall reporter (prints machine context values to customScreen.:
					expect(
						await customScreen.findByText(
							`Current stage: ${AuthStateId.SubmittingUsernameAndPassword}`
						)
					).toBeDefined();
					// The reporter for this stage (prints hook state values):
					expect(await customScreen.findByText("Error: n/a")).toBeDefined();
				},
			},
		},
		UsernameOrPasswordError: {
			on: {
				GOOD_USERNAME_AND_PASSWORD: "Authenticated",
			},
			meta: {
				test: async () => {
					// The overall reporter (prints machine context values to customScreen.:
					expect(
						await customScreen.findByText(
							`Current stage: ${AuthStateId.SubmittingUsernameAndPassword}`
						)
					).toBeDefined();
					// The reporter for this stage (prints hook state values):
					expect(
						await customScreen.findByText("Error: USERNAME_AND_PASSWORD_INVALID")
					).toBeDefined();
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
					// The overall reporter (prints machine context values to customScreen.:
					expect(
						await customScreen.findByText(
							`Current stage: ${AuthStateId.SubmittingForceChangePassword}`
						)
					).toBeDefined();
					// The reporter for this stage (prints hook state values):
					expect(
						await customScreen.findByText(`Error: ${"PASSWORD_CHANGE_REQUIRED" as AuthError}`)
					).toBeDefined();
				},
			},
		},
		SubmittingForceResetPasswordError: {
			on: {
				GOOD_FORCE_RESET_PASSWORD: "Authenticated",
			},
			meta: {
				test: async () => {
					// The overall reporter (prints machine context values to customScreen.:
					expect(
						await customScreen.findByText(
							`Current stage: ${AuthStateId.SubmittingForceChangePassword}`
						)
					).toBeDefined();
					// The reporter for this stage (prints hook state values):
					expect(
						await customScreen.findByText(`Error: ${"PASSWORD_CHANGE_FAILURE" as AuthError}`)
					).toBeDefined();
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
					// The overall reporter (prints machine context values to customScreen.:
					expect(
						await customScreen.findByText(
							`Current stage: ${AuthStateId.ForgottenPasswordRequestingReset}`
						)
					).toBeDefined();
					// The reporter for this stage (prints hook state values):
					expect(await customScreen.findByText("Error: n/a")).toBeDefined();
				},
			},
		},
		RequestingNewPasswordError: {
			on: {
				PASSWORD_RESET_REQUEST_SUCCESS: "SubmittingNewPassword",
			},
			meta: {
				test: async () => {
					// The overall reporter (prints machine context values to customScreen.:
					expect(
						await customScreen.findByText(
							`Current stage: ${AuthStateId.ForgottenPasswordRequestingReset}`
						)
					).toBeDefined();
					// The reporter for this stage (prints hook state values):
					expect(
						await customScreen.findByText("Error: PASSWORD_RESET_REQUEST_FAILURE")
					).toBeDefined();
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
					// The overall reporter (prints machine context values to customScreen.:
					expect(
						await customScreen.findByText(
							`Current stage: ${AuthStateId.ForgottenPasswordSubmittingReset}`
						)
					).toBeDefined();
					// The reporter for this stage (prints hook state values):
					expect(await customScreen.findByText("Error: n/a")).toBeDefined();
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
					// The overall reporter (prints machine context values to customScreen.:
					expect(
						await customScreen.findByText(
							`Current stage: ${AuthStateId.ForgottenPasswordSubmittingReset}`
						)
					).toBeDefined();
					// The reporter for this stage (prints hook state values):
					expect(await customScreen.findByText("Error: PASSWORD_RESET_FAILURE")).toBeDefined();
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
					// The overall reporter (prints machine context values to customScreen.:
					expect(
						await customScreen.findByText(`Current stage: ${AuthStateId.Authenticated}`)
					).toBeDefined();
					// The reporter for this stage (prints hook state values):
					expect(await customScreen.findByText("Error: n/a")).toBeDefined();
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
					// The overall reporter (prints machine context values to customScreen.:
					expect(
						await customScreen.findByText(`Current stage: ${AuthStateId.AuthenticatedLoggingOut}`)
					).toBeDefined();
					// The reporter for this stage (prints hook state values):
					expect(await customScreen.findByText("Error: n/a")).toBeDefined();
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
					// The overall reporter (prints machine context values to customScreen.:
					expect(
						await customScreen.findByText(
							`Current stage: ${AuthStateId.AuthenticatedChangingPassword}`
						)
					).toBeDefined();
					// The reporter for this stage (prints hook state values):
					expect(await customScreen.findByText("Error: n/a")).toBeDefined();
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
					// The overall reporter (prints machine context values to customScreen.:
					expect(
						await customScreen.findByText(
							`Current stage: ${AuthStateId.AuthenticatedChangingPassword}`
						)
					).toBeDefined();
					// The reporter for this stage (prints hook state values):
					expect(await customScreen.findByText("Error: PASSWORD_CHANGE_FAILURE")).toBeDefined();
				},
			},
		},
	},
});

const model = createModel(machine).withEvents({
	THERE_IS_A_SESSION: async () => {
		userEvent.click(await customScreen.findByText("Check for a session"));
		await waitFor(() => expect(checkSessionCb).toHaveBeenCalled());
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await customScreen.findByText("Loading: false");
	},
	THERE_IS_NO_SESSION: async () => {
		(checkSessionCb as jest.MockedFunction<CheckSessionCb>).mockRejectedValueOnce(null);
		userEvent.click(await customScreen.findByText("Check for a session"));
		await waitFor(() => expect(checkSessionCb).toHaveBeenCalled());
		(checkSessionCb as jest.MockedFunction<CheckSessionCb>).mockReset();
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await customScreen.findByText("Loading: false");
	},
	GOOD_USERNAME_AND_PASSWORD: async () => {
		const usernameinput = await customScreen.findByLabelText("Enter your username");
		const passwordinput = await customScreen.findByLabelText("Enter your password");
		userEvent.clear(usernameinput);
		userEvent.clear(passwordinput);
		userEvent.type(usernameinput, VALID_USERNAME);
		userEvent.type(passwordinput, VALID_PASSWORD);
		userEvent.click(await customScreen.findByText("Submit username and password"));
		await waitFor(() =>
			expect(validateUsernameAndPasswordCb).toHaveBeenCalledWith(VALID_USERNAME, VALID_PASSWORD)
		);
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await customScreen.findByText("Loading: false");
	},
	BAD_USERNAME_AND_PASSWORD: async () => {
		const usernameinput = await customScreen.findByLabelText("Enter your username");
		const passwordinput = await customScreen.findByLabelText("Enter your password");
		userEvent.clear(usernameinput);
		userEvent.clear(passwordinput);
		userEvent.type(usernameinput, INVALID_USERNAME);
		userEvent.type(passwordinput, INVALID_PASSWORD);
		userEvent.click(await customScreen.findByText("Submit username and password"));
		await waitFor(() =>
			expect(validateUsernameAndPasswordCb).toHaveBeenCalledWith(INVALID_USERNAME, INVALID_PASSWORD)
		);
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await customScreen.findByText("Loading: false");
	},
	FORCE_PASSWORD_RESET_REQUIRED: async () => {
		const usernameinput = await customScreen.findByLabelText("Enter your username");
		const passwordinput = await customScreen.findByLabelText("Enter your password");
		userEvent.clear(usernameinput);
		userEvent.clear(passwordinput);
		userEvent.type(usernameinput, VALID_USERNAME);
		userEvent.type(passwordinput, OLD_PASSWORD);
		userEvent.click(await customScreen.findByText("Submit username and password"));
		await waitFor(() =>
			expect(validateUsernameAndPasswordCb).toHaveBeenCalledWith(VALID_USERNAME, OLD_PASSWORD)
		);
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await customScreen.findByText("Loading: false");
	},
	GOOD_FORCE_RESET_PASSWORD: async () => {
		const input = await customScreen.findByLabelText("Enter your password");
		userEvent.clear(input);
		userEvent.type(input, VALID_PASSWORD);
		userEvent.click(await customScreen.findByText("Submit new password"));
		await waitFor(() =>
			expect(validateForceChangePasswordCb).toHaveBeenCalledWith(USER_OBJECT, VALID_PASSWORD)
		);
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await customScreen.findByText("Loading: false");
	},
	BAD_FORCE_RESET_PASSWORD: async () => {
		const input = await customScreen.findByLabelText("Enter your password");
		userEvent.clear(input);
		userEvent.type(input, INVALID_PASSWORD);
		userEvent.click(await customScreen.findByText("Submit new password"));
		await waitFor(() =>
			expect(validateForceChangePasswordCb).toHaveBeenCalledWith(USER_OBJECT, INVALID_PASSWORD)
		);
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await customScreen.findByText("Loading: false");
	},
	FORGOT_PASSWORD: async () => {
		userEvent.click(await customScreen.findByText("Forgotten password"));
	},
	PASSWORD_RESET_REQUEST_SUCCESS: async () => {
		const input = await customScreen.findByLabelText("Enter your username");
		userEvent.clear(input);
		userEvent.type(input, VALID_USERNAME);
		userEvent.click(await customScreen.findByText("Request a new password"));
		await waitFor(() => expect(requestNewPasswordCb).toHaveBeenCalledWith(VALID_USERNAME));
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await customScreen.findByText("Loading: false");
	},
	PASSWORD_RESET_REQUEST_FAILURE: async () => {
		const input = await customScreen.findByLabelText("Enter your username");
		userEvent.clear(input);
		userEvent.type(input, INVALID_USERNAME);
		userEvent.click(await customScreen.findByText("Request a new password"));
		await waitFor(() => expect(requestNewPasswordCb).toHaveBeenCalledWith(INVALID_USERNAME));
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await customScreen.findByText("Loading: false");
	},
	CANCEL_PASSWORD_RESET: async () => {
		userEvent.click(await customScreen.findByText("Cancel password reset"));
	},
	PASSWORD_CHANGE_SUCCESS: async () => {
		const codeinput = await customScreen.findByLabelText("Enter the reset code you have been sent");
		const passwordinput = await customScreen.findByLabelText("Enter your new password");
		userEvent.clear(codeinput);
		userEvent.clear(passwordinput);
		userEvent.type(codeinput, VALID_CODE);
		userEvent.type(passwordinput, VALID_PASSWORD);
		userEvent.click(await customScreen.findByText("Submit reset code and new password"));
		await waitFor(() =>
			expect(submitNewPasswordCb).toHaveBeenCalledWith(VALID_USERNAME, VALID_CODE, VALID_PASSWORD)
		);
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await customScreen.findByText("Loading: false");
	},
	PASSWORD_CHANGE_FAILURE: async () => {
		const codeinput = await customScreen.findByLabelText("Enter the reset code you have been sent");
		const passwordinput = await customScreen.findByLabelText("Enter your new password");
		userEvent.clear(codeinput);
		userEvent.clear(passwordinput);
		userEvent.type(codeinput, INVALID_CODE);
		userEvent.type(passwordinput, INVALID_PASSWORD);
		userEvent.click(await customScreen.findByText("Submit reset code and new password"));
		await waitFor(() =>
			expect(submitNewPasswordCb).toHaveBeenCalledWith(
				VALID_USERNAME,
				INVALID_CODE,
				INVALID_PASSWORD
			)
		);
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await customScreen.findByText("Loading: false");
	},
	REENTER_USERNAME_TO_RESEND_CODE: async () => {
		userEvent.click(await customScreen.findByText("Resend code"));
	},
	REQUEST_LOG_OUT: async () => {
		userEvent.click(await customScreen.findByText("Log out"));
	},
	CANCEL_LOG_OUT: async () => {
		userEvent.click(await customScreen.findByText("Cancel log out"));
	},
	GOOD_LOG_OUT: async () => {
		userEvent.click(await customScreen.findByText("Confirm log out"));
		await waitFor(() => expect(logoutCb).toHaveBeenCalled());
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await customScreen.findByText("Loading: false");
	},
	BAD_LOG_OUT: async () => {
		(logoutCb as jest.MockedFunction<LogoutCb>).mockRejectedValueOnce(null);
		userEvent.click(await customScreen.findByText("Confirm log out"));
		await waitFor(() => expect(logoutCb).toHaveBeenCalled());
		(logoutCb as jest.MockedFunction<LogoutCb>).mockReset();
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await customScreen.findByText("Loading: false");
	},
	REQUEST_PASSWORD_CHANGE_WHEN_AUTHENTICATED: async () => {
		userEvent.click(await customScreen.findByText("Change password"));
	},
	SUCCESSFUL_PASSWORD_CHANGE: async () => {
		const oldPasswordInput = await customScreen.findByLabelText("Enter your current password");
		const newPasswordinput = await customScreen.findByLabelText("Enter your new password");
		userEvent.clear(oldPasswordInput);
		userEvent.clear(newPasswordinput);
		userEvent.type(oldPasswordInput, VALID_PASSWORD);
		userEvent.type(newPasswordinput, VALID_PASSWORD);
		userEvent.click(await customScreen.findByText("Change your password"));
		await waitFor(() =>
			expect(submitNewPasswordCb).toHaveBeenCalledWith(VALID_PASSWORD, VALID_PASSWORD)
		);
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await customScreen.findByText("Loading: false");
	},
	UNSUCCESSFUL_PASSWORD_CHANGE: async () => {
		const oldPasswordInput = await customScreen.findByLabelText("Enter your current password");
		const newPasswordinput = await customScreen.findByLabelText("Enter your new password");
		userEvent.clear(oldPasswordInput);
		userEvent.clear(newPasswordinput);
		userEvent.type(oldPasswordInput, INVALID_PASSWORD);
		userEvent.type(newPasswordinput, INVALID_PASSWORD);
		userEvent.click(await customScreen.findByText("Change your password"));
		await waitFor(() =>
			expect(submitNewPasswordCb).toHaveBeenCalledWith(INVALID_PASSWORD, INVALID_PASSWORD)
		);
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await customScreen.findByText("Loading: false");
	},
	CANCEL_PASSWORD_CHANGE: async () => {
		userEvent.click(await customScreen.findByText("Cancel log out"));
	},
});

export const usernamePasswordNoPin = { machine, model };
