/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { createModel } from "@xstate/test";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMachine } from "xstate";

import { AuthStateId } from "core/auth-system";
import {
	customScreen,
	INVALID_CODE,
	INVALID_USERNAME,
	VALID_CODE,
	VALID_USERNAME,
	USER_OBJECT,
} from "../utilities";

import {
	checkSessionCb,
	validateOtpUsernameCb,
	validateOtpCb,
	logoutCb,
} from "test-app/stages/callback-implementations";

import type { LoginFlowType, DeviceSecurityType } from "core/types";
import type { CheckSessionCb, LogoutCb } from "core/react/callback-types";

jest.mock("test-app/stages/callback-implementations");

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
					// The overall reporter (prints machine context values to screen):
					expect(
						await customScreen.findByText(`Current stage: ${AuthStateId.CheckingForSession}`)
					).toBeDefined();
					// NOTE: Only need to check these once, they should stay constant
					//       throughout the test as they're read-only values:
					expect(
						await customScreen.findByText(`Current login flow: ${"OTP" as LoginFlowType}`)
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
		SubmittingUsername: {
			on: {
				GOOD_USERNAME: "SubmittingOtp1",
				BAD_USERNAME: "UsernameError",
			},
			meta: {
				test: async () => {
					// The overall reporter (prints machine context values to screen):
					expect(
						await customScreen.findByText(`Current stage: ${AuthStateId.SubmittingOtpUsername}`)
					).toBeDefined();
					// The reporter for this stage (prints hook state values):
					expect(await customScreen.findByText("Error: n/a")).toBeDefined();
				},
			},
		},
		SubmittingUsernameAfterTooManyRetries: {
			on: {
				GOOD_USERNAME: "SubmittingOtp1",
			},
			meta: {
				test: async () => {
					// The overall reporter (prints machine context values to screen):
					expect(
						await customScreen.findByText(`Current stage: ${AuthStateId.SubmittingOtpUsername}`)
					).toBeDefined();
					// The reporter for this stage (prints hook state values):
					expect(await customScreen.findByText("Error: PASSWORD_RETRIES_EXCEEDED")).toBeDefined();
				},
			},
		},
		UsernameError: {
			on: {
				GOOD_USERNAME: "SubmittingOtp1",
			},
			meta: {
				test: async () => {
					// The overall reporter (prints machine context values to screen):
					expect(
						await customScreen.findByText(`Current stage: ${AuthStateId.SubmittingOtpUsername}`)
					).toBeDefined();
					// The reporter for this stage (prints hook state values):
					expect(await customScreen.findByText("Error: USERNAME_INVALID")).toBeDefined();
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
					// The overall reporter (prints machine context values to screen):
					expect(
						await customScreen.findByText(`Current stage: ${AuthStateId.SubmittingOtp}`)
					).toBeDefined();
					// The reporter for this stage (prints hook state values):
					expect(await customScreen.findByText("Error: n/a")).toBeDefined();
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
					// The overall reporter (prints machine context values to screen):
					expect(
						await customScreen.findByText(`Current stage: ${AuthStateId.SubmittingOtp}`)
					).toBeDefined();
					// The reporter for this stage (prints hook state values):
					expect(
						await customScreen.findByText("Error: PASSWORD_INVALID_2_RETRIES_REMAINING")
					).toBeDefined();
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
					// The overall reporter (prints machine context values to screen):
					expect(
						await customScreen.findByText(`Current stage: ${AuthStateId.SubmittingOtp}`)
					).toBeDefined();
					// The reporter for this stage (prints hook state values):
					expect(
						await customScreen.findByText("Error: PASSWORD_INVALID_1_RETRIES_REMAINING")
					).toBeDefined();
				},
			},
		},
		Authenticated: {
			on: {
				REQUEST_LOG_OUT: "AuthenticatedLoggingOut",
			},
			meta: {
				test: async () => {
					// The overall reporter (prints machine context values to screen):
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
					// The overall reporter (prints machine context values to screen):
					expect(
						await customScreen.findByText(`Current stage: ${AuthStateId.AuthenticatedLoggingOut}`)
					).toBeDefined();
					// The reporter for this stage (prints hook state values):
					expect(await customScreen.findByText("Error: n/a")).toBeDefined();
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
	GOOD_USERNAME: async () => {
		const input = await customScreen.findByLabelText("Enter your email");
		userEvent.clear(input);
		userEvent.type(input, VALID_USERNAME);
		userEvent.click(await customScreen.findByText("Submit username"));
		await waitFor(() => expect(validateOtpUsernameCb).toHaveBeenCalledWith(VALID_USERNAME));
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await customScreen.findByText("Loading: false");
	},
	BAD_USERNAME: async () => {
		const input = await customScreen.findByLabelText("Enter your email");
		userEvent.clear(input);
		userEvent.type(input, INVALID_USERNAME);
		userEvent.click(await customScreen.findByText("Submit username"));
		await waitFor(() => expect(validateOtpUsernameCb).toHaveBeenCalledWith(INVALID_USERNAME));
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await customScreen.findByText("Loading: false");
	},
	GOOD_OTP: async () => {
		const input = await customScreen.findByLabelText("Enter the OTP");
		userEvent.clear(input);
		userEvent.type(input, VALID_CODE);
		userEvent.click(await customScreen.findByText("Submit OTP"));
		await waitFor(() => expect(validateOtpCb).toHaveBeenCalledWith(USER_OBJECT, VALID_CODE));
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await customScreen.findByText("Loading: false");
	},
	BAD_OTP: async () => {
		const input = await customScreen.findByLabelText("Enter the OTP");
		userEvent.clear(input);
		userEvent.type(input, INVALID_CODE);
		userEvent.click(await customScreen.findByText("Submit OTP"));
		await waitFor(() => expect(validateOtpCb).toHaveBeenCalledWith(USER_OBJECT, INVALID_CODE));
	},
	REENTER_USERNAME: async () => {
		userEvent.click(await customScreen.findByText("Re-enter email"));
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
});

export const otpNoPin = { machine, model };
