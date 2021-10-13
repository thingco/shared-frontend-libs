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
	INVALID_CODE,
	INVALID_USERNAME,
	VALID_CODE,
	VALID_USERNAME,
	USER_OBJECT,
} from "test-utils/dummy-responses";
import uiText from "test-app/ui-copy";

import {
	checkSessionCb,
	validateOtpUsernameCb,
	validateOtpCb,
	logoutCb,
} from "test-app/stages/callback-implementations";

import type { CheckSessionCb, LogoutCb } from "core/react/callback-types";

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
		userEvent.click(
			await customScreen.findByText(
				uiText.authStages.checkingForSession.controlLabels.checkForExistingSession
			)
		);
		await waitFor(() => expect(checkSessionCb).toHaveBeenCalled());
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await stageLoadingStatusIs("false");
	},
	THERE_IS_NO_SESSION: async () => {
		(checkSessionCb as jest.MockedFunction<CheckSessionCb>).mockRejectedValueOnce(null);
		userEvent.click(
			await customScreen.findByText(
				uiText.authStages.checkingForSession.controlLabels.checkForExistingSession
			)
		);
		await waitFor(() => expect(checkSessionCb).toHaveBeenCalled());
		(checkSessionCb as jest.MockedFunction<CheckSessionCb>).mockReset();
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await stageLoadingStatusIs("false");
	},
	GOOD_USERNAME: async () => {
		const input = await customScreen.findByLabelText(
			uiText.authStages.submittingOtpUsername.controlLabels.otpUsernameInput
		);
		userEvent.clear(input);
		userEvent.type(input, VALID_USERNAME);
		userEvent.click(
			await customScreen.findByText(
				uiText.authStages.submittingOtpUsername.controlLabels.submitOtpUsername
			)
		);
		await waitFor(() => expect(validateOtpUsernameCb).toHaveBeenCalledWith(VALID_USERNAME));
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await stageLoadingStatusIs("false");
	},
	BAD_USERNAME: async () => {
		const input = await customScreen.findByLabelText(
			uiText.authStages.submittingOtpUsername.controlLabels.otpUsernameInput
		);
		userEvent.clear(input);
		userEvent.type(input, INVALID_USERNAME);
		userEvent.click(
			await customScreen.findByText(
				uiText.authStages.submittingOtpUsername.controlLabels.submitOtpUsername
			)
		);
		await waitFor(() => expect(validateOtpUsernameCb).toHaveBeenCalledWith(INVALID_USERNAME));
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await stageLoadingStatusIs("false");
	},
	GOOD_OTP: async () => {
		const input = await customScreen.findByLabelText(
			uiText.authStages.submittingOtp.controlLabels.otpInput
		);
		userEvent.clear(input);
		userEvent.type(input, VALID_CODE);
		userEvent.click(
			await customScreen.findByText(uiText.authStages.submittingOtp.controlLabels.submitOtp)
		);
		await waitFor(() => expect(validateOtpCb).toHaveBeenCalledWith(USER_OBJECT, VALID_CODE));
		// expect(await customScreen.findByText("Loading: true")).toBeDefined();
		await stageLoadingStatusIs("false");
	},
	BAD_OTP: async () => {
		const input = await customScreen.findByLabelText(
			uiText.authStages.submittingOtp.controlLabels.otpInput
		);
		userEvent.clear(input);
		userEvent.type(input, INVALID_CODE);
		userEvent.click(
			await customScreen.findByText(uiText.authStages.submittingOtp.controlLabels.submitOtp)
		);
		await waitFor(() => expect(validateOtpCb).toHaveBeenCalledWith(USER_OBJECT, INVALID_CODE));
		await stageLoadingStatusIs("false");
	},
	REENTER_USERNAME: async () => {
		userEvent.click(
			await customScreen.findByLabelText(
				uiText.authStages.submittingOtp.controlLabels.reenterUsername
			)
		);
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
});

export const otpNoPin = { machine, model };
