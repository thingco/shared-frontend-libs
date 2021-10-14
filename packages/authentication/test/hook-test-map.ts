/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthStateId } from "core/enums";
import type { AuthEvent } from "core/types";
import {
	VALID_USERNAME,
	INVALID_USERNAME,
	VALID_CODE,
	INVALID_CODE,
	VALID_PASSWORD,
	ANOTHER_VALID_PASSWORD,
	INVALID_PASSWORD,
	TEMPORARY_PASSWORD,
	USER_OBJECT,
} from "test-utils/dummy-responses";

/**
 * To test the hooks, cycle through a table of hook descriptions, the TestHookMap
 */
export type HookTestMap = {
	stateId: AuthStateId;
	hookSpec: {
		primaryMethod?: string;
		callbacks?: {
			runs?: number;
			args: any[];
			callback: jest.MockedFunction<(...args: any[]) => Promise<any>>;
			expectedEvent: AuthEvent;
		}[];
		additionalMethods?: { method: string; expectedEvent: AuthEvent }[];
	};
}[];

export const hookTestMap: HookTestMap = [
	{
		stateId: AuthStateId.CheckingForSession,
		hookSpec: {
			primaryMethod: "checkSession",
			callbacks: [
				{
					args: [],
					callback: jest.fn(() => Promise.resolve()),
					expectedEvent: { type: "SESSION_PRESENT" },
				},
				{
					args: [],
					callback: jest.fn(() => Promise.reject()),
					expectedEvent: { type: "SESSION_NOT_PRESENT" },
				},
			],
		},
	},
	{
		stateId: AuthStateId.SubmittingOtpUsername,
		hookSpec: {
			primaryMethod: "validateUsername",
			callbacks: [
				{
					args: [VALID_USERNAME],
					callback: jest.fn(() => Promise.resolve(USER_OBJECT)),
					expectedEvent: {
						type: "USERNAME_VALID",
						username: VALID_USERNAME,
						user: USER_OBJECT,
					},
				},
				{
					args: [INVALID_USERNAME],
					callback: jest.fn(() => Promise.reject()),
					expectedEvent: { type: "USERNAME_INVALID", error: "USERNAME_INVALID" },
				},
			],
		},
	},
	{
		stateId: AuthStateId.SubmittingOtp,
		hookSpec: {
			primaryMethod: "validateOtp",
			callbacks: [
				{
					args: [VALID_CODE],
					callback: jest.fn(() => Promise.resolve(USER_OBJECT)),
					expectedEvent: { type: "OTP_VALID" },
				},
				{
					args: [INVALID_CODE],
					callback: jest.fn(() => Promise.reject()),
					expectedEvent: { type: "OTP_INVALID", error: "PASSWORD_INVALID_2_RETRIES_REMAINING" },
				},
				{
					runs: 3,
					args: [INVALID_CODE],
					callback: jest.fn(() => Promise.reject()),
					expectedEvent: {
						type: "OTP_INVALID_RETRIES_EXCEEDED",
						error: "PASSWORD_RETRIES_EXCEEDED",
					},
				},
			],
			additionalMethods: [{ method: "goBack", expectedEvent: { type: "GO_BACK" } }],
		},
	},
	{
		stateId: AuthStateId.SubmittingUsernameAndPassword,
		hookSpec: {
			primaryMethod: "validateUsernameAndPassword",
			callbacks: [
				{
					args: [VALID_USERNAME, VALID_PASSWORD],
					callback: jest.fn(() => Promise.resolve(USER_OBJECT)),
					expectedEvent: {
						type: "USERNAME_AND_PASSWORD_VALID",
						username: VALID_USERNAME,
						user: USER_OBJECT,
					},
				},
				{
					args: [VALID_USERNAME, TEMPORARY_PASSWORD],
					callback: jest.fn(() => Promise.resolve(["NEW_PASSWORD_REQUIRED", USER_OBJECT])),
					expectedEvent: {
						type: "USERNAME_AND_PASSWORD_VALID_PASSWORD_CHANGE_REQUIRED",
						user: USER_OBJECT,
						username: VALID_USERNAME,
						error: "PASSWORD_CHANGE_REQUIRED",
					},
				},
				{
					args: [INVALID_USERNAME, INVALID_PASSWORD],
					callback: jest.fn(() => Promise.reject()),
					expectedEvent: {
						type: "USERNAME_AND_PASSWORD_INVALID",
						error: "USERNAME_AND_PASSWORD_INVALID",
					},
				},
			],
			additionalMethods: [
				{ method: "forgottenPassword", expectedEvent: { type: "FORGOTTEN_PASSWORD" } },
			],
		},
	},
	{
		stateId: AuthStateId.SubmittingForceChangePassword,
		hookSpec: {
			primaryMethod: "validateNewPassword",
			callbacks: [
				{
					args: [VALID_PASSWORD],
					callback: jest.fn(() => Promise.resolve(USER_OBJECT)),
					expectedEvent: { type: "PASSWORD_CHANGE_SUCCESS" },
				},
				{
					args: [INVALID_PASSWORD],
					callback: jest.fn(() => Promise.reject()),
					expectedEvent: { type: "PASSWORD_CHANGE_FAILURE", error: "PASSWORD_CHANGE_FAILURE" },
				},
			],
		},
	},
	{
		stateId: AuthStateId.ForgottenPasswordRequestingReset,
		hookSpec: {
			primaryMethod: "requestNewPassword",
			callbacks: [
				{
					args: [VALID_USERNAME],
					callback: jest.fn(() => Promise.resolve()),
					expectedEvent: { type: "PASSWORD_RESET_REQUEST_SUCCESS", username: VALID_USERNAME },
				},
				{
					args: [INVALID_USERNAME],
					callback: jest.fn(() => Promise.reject()),
					expectedEvent: {
						type: "PASSWORD_RESET_REQUEST_FAILURE",
						error: "PASSWORD_RESET_REQUEST_FAILURE",
					},
				},
			],
			additionalMethods: [
				{ method: "cancelResetPasswordRequest", expectedEvent: { type: "GO_BACK" } },
			],
		},
	},
	{
		stateId: AuthStateId.ForgottenPasswordSubmittingReset,
		hookSpec: {
			primaryMethod: "submitNewPassword",
			callbacks: [
				{
					args: [VALID_CODE, VALID_PASSWORD],
					callback: jest.fn(() => Promise.resolve()),
					expectedEvent: { type: "PASSWORD_RESET_SUCCESS" },
				},
				{
					args: [INVALID_CODE, INVALID_PASSWORD],
					callback: jest.fn(() => Promise.reject()),
					expectedEvent: { type: "PASSWORD_RESET_FAILURE", error: "PASSWORD_RESET_FAILURE" },
				},
			],
			additionalMethods: [{ method: "cancelPasswordReset", expectedEvent: { type: "GO_BACK" } }],
		},
	},
	{
		stateId: AuthStateId.AuthenticatedChangingPassword,
		hookSpec: {
			primaryMethod: "submitNewPassword",
			callbacks: [
				{
					args: [VALID_PASSWORD, ANOTHER_VALID_PASSWORD],
					callback: jest.fn(() => Promise.resolve()),
					expectedEvent: { type: "PASSWORD_CHANGE_SUCCESS" },
				},
				{
					args: [INVALID_PASSWORD, INVALID_PASSWORD],
					callback: jest.fn(() => Promise.reject()),
					expectedEvent: { type: "PASSWORD_CHANGE_FAILURE", error: "PASSWORD_CHANGE_FAILURE" },
				},
			],
			additionalMethods: [
				{ method: "cancelChangePassword", expectedEvent: { type: "CANCEL_PASSWORD_CHANGE" } },
			],
		},
	},
	{
		stateId: AuthStateId.CheckingForPin,
		hookSpec: {
			primaryMethod: "checkForExistingPin",
			callbacks: [
				{
					args: [],
					callback: jest.fn(() => Promise.resolve()),
					expectedEvent: { type: "PIN_IS_SET_UP" },
				},
				{
					args: [],
					callback: jest.fn(() => Promise.reject()),
					expectedEvent: { type: "PIN_IS_NOT_SET_UP" },
				},
			],
		},
	},
	{
		stateId: AuthStateId.SubmittingCurrentPin,
		hookSpec: {
			primaryMethod: "validatePin",
			callbacks: [
				{
					args: [VALID_CODE],
					callback: jest.fn(() => Promise.resolve()),
					expectedEvent: { type: "PIN_VALID" },
				},
				{
					args: [INVALID_CODE],
					callback: jest.fn(() => Promise.reject()),
					expectedEvent: { type: "PIN_INVALID", error: "PIN_INVALID" },
				},
			],
			additionalMethods: [
				{ method: "requestPinReset", expectedEvent: { type: "REQUEST_PIN_RESET" } },
			],
		},
	},
	{
		stateId: AuthStateId.ForgottenPinRequestingReset,
		hookSpec: {
			primaryMethod: "resetPin",
			callbacks: [
				{
					args: [],
					callback: jest.fn(() => Promise.resolve()),
					expectedEvent: { type: "PIN_RESET_SUCCESS" },
				},
				{
					args: [],
					callback: jest.fn(() => Promise.reject()),
					expectedEvent: { type: "PIN_RESET_FAILURE", error: "PIN_RESET_FAILURE" },
				},
			],
			additionalMethods: [
				{ method: "cancelResetPin", expectedEvent: { type: "CANCEL_PIN_RESET" } },
			],
		},
	},
	{
		stateId: AuthStateId.SubmittingNewPin,
		hookSpec: {
			primaryMethod: "setNewPin",
			callbacks: [
				{
					args: [VALID_CODE],
					callback: jest.fn(() => Promise.resolve()),
					expectedEvent: { type: "NEW_PIN_VALID" },
				},
				{
					args: [INVALID_CODE],
					callback: jest.fn(() => Promise.reject()),
					expectedEvent: { type: "NEW_PIN_INVALID", error: "NEW_PIN_INVALID" },
				},
			],
		},
	},
	{
		stateId: AuthStateId.AuthenticatedValidatingPin,
		hookSpec: {
			primaryMethod: "validatePin",
			callbacks: [
				{
					args: [VALID_CODE],
					callback: jest.fn(() => Promise.resolve()),
					expectedEvent: { type: "PIN_VALID" },
				},
				{
					args: [INVALID_CODE],
					callback: jest.fn(() => Promise.reject()),
					expectedEvent: { type: "PIN_INVALID", error: "PIN_INVALID" },
				},
			],
			additionalMethods: [
				{ method: "cancelChangePin", expectedEvent: { type: "CANCEL_PIN_CHANGE" } },
			],
		},
	},
	{
		stateId: AuthStateId.AuthenticatedChangingPin,
		hookSpec: {
			primaryMethod: "changePin",
			callbacks: [
				{
					args: [VALID_CODE],
					callback: jest.fn(() => Promise.resolve()),
					expectedEvent: { type: "PIN_CHANGE_SUCCESS" },
				},
				{
					args: [INVALID_CODE],
					callback: jest.fn(() => Promise.reject()),
					expectedEvent: { type: "PIN_CHANGE_FAILURE", error: "PIN_CHANGE_FAILURE" },
				},
			],
			additionalMethods: [
				{ method: "cancelChangePin", expectedEvent: { type: "CANCEL_PIN_CHANGE" } },
			],
		},
	},
	{
		stateId: AuthStateId.AuthenticatedLoggingOut,
		hookSpec: {
			primaryMethod: "logOut",
			callbacks: [
				{
					args: [],
					callback: jest.fn(() => Promise.resolve()),
					expectedEvent: { type: "LOG_OUT_SUCCESS" },
				},
				{
					args: [],
					callback: jest.fn(() => Promise.reject()),
					expectedEvent: { type: "LOG_OUT_FAILURE", error: "LOG_OUT_FAILURE" },
				},
			],
			additionalMethods: [{ method: "cancelLogOut", expectedEvent: { type: "CANCEL_LOG_OUT" } }],
		},
	},
	{
		stateId: AuthStateId.Authenticated,
		hookSpec: {
			additionalMethods: [
				{ method: "requestLogOut", expectedEvent: { type: "REQUEST_LOG_OUT" } },
				{ method: "requestPinChange", expectedEvent: { type: "REQUEST_PIN_CHANGE" } },
				{ method: "requestPasswordChange", expectedEvent: { type: "REQUEST_PASSWORD_CHANGE" } },
			],
		},
	},
];
