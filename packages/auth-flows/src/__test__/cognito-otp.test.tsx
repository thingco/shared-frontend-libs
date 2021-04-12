import { fireEvent, render, RenderResult, waitFor } from "@testing-library/react";
import { createModel } from "@xstate/test";
import React from "react";
import { act } from "react-dom/test-utils";
import { assign, Machine } from "xstate";

import { CognitoOTPTestApp } from "./CognitoOTPTestApp";

/**
 * Mock API functions
 */
const checkSession = jest.fn();
const validateUserIdentifier = jest.fn();
const validateOtp = jest.fn();
const signOut = jest.fn().mockRejectedValue(null);

const uiEvents = {
	SESSION_CHECK_SUCCESS: async () => {
		// sessionResolver.resolve("session token");
		checkSession.mockResolvedValue("session token");
	},
	SESSION_CHECK_FAILURE: async () => {
		// sessionResolver.reject(null);
		checkSession.mockRejectedValue(null);
	},
	SUBMIT_USER_IDENTIFIER: async ({ getByTestId }: any) => {
		await fireEvent.change(getByTestId("email-input"), {
			target: { value: "dummyemail@test.com" },
		});
		await fireEvent.click(getByTestId("submit-button"));
	},
	USER_IDENTIFIER_CHECK_SUCCESS: async () => {
		validateUserIdentifier.mockResolvedValue("user");
	},
	USER_IDENTIFIER_CHECK_FAILURE: async () => {
		validateUserIdentifier.mockRejectedValue(null);
	},
	SUBMIT_OTP: async ({ getByTestId }: any) => {
		await fireEvent.change(getByTestId("otp-input"), {
			target: { value: "dummy OTP" },
		});
		await fireEvent.click(getByTestId("submit-button"));
	},
	OTP_CHECK_SUCCESS: async () => {
		validateOtp.mockResolvedValue(null);
	},
	OTP_CHECK_FAILURE: async () => {
		validateOtp.mockRejectedValue(null);
	},
	LOG_OUT: async ({ getByTestId }: any) => await fireEvent.click(getByTestId("logout-button")),
};

const testMachineConfig = {
	id: "authenticator-test",
	initial: "init",
	context: {
		otpRetries: 3,
	},
	states: {
		init: {
			on: {
				SESSION_CHECK_SUCCESS: "authorised",
				SESSION_CHECK_FAILURE: "awaitingUserIdentifier",
			},
			meta: {
				test: async ({ getByText }: RenderResult) =>
					waitFor(() => expect(getByText("Loading...")).not.toBeNull()),
			},
		},
		validatingSession: {
			on: {
				SESSION_CHECK_SUCCESS: "authorised",
				SESSION_CHECK_FAILURE: "awaitingUserIdentifier",
			},
			meta: {
				test: async ({ getByText }: RenderResult) =>
					waitFor(() => expect(getByText("Loading...")).not.toBeNull()),
			},
		},
		awaitingUserIdentifier: {
			on: {
				SUBMIT_USER_IDENTIFIER: "validatingUserIdentifier",
			},
			meta: {
				test: async ({ getByTestId }: RenderResult) =>
					waitFor(() => expect(getByTestId("email-input")).not.toBeNull()),
			},
		},
		validatingUserIdentifier: {
			on: {
				USER_IDENTIFIER_CHECK_SUCCESS: "awaitingOtp",
				USER_IDENTIFIER_CHECK_FAILURE: "awaitingUserIdentifier",
			},
			meta: {
				test: async ({ getByText }: RenderResult) =>
					waitFor(() => expect(getByText("Loading...")).not.toBeNull()),
			},
		},
		awaitingOtp: {
			on: {
				SUBMIT_OTP: "validatingOtp",
			},
			meta: {
				test: async ({ getByTestId }: RenderResult) =>
					waitFor(() => expect(getByTestId("otp-input")).not.toBeNull()),
			},
		},
		validatingOtp: {
			on: {
				OTP_CHECK_SUCCESS: "validatingSession",
				OTP_CHECK_FAILURE: [
					{
						target: "awaitingUserIdentifier",
						actions: assign({ otpRetries: 3 }),
						cond: (ctx: any) => ctx.otpRetries === 0,
					},
					{
						target: "awaitingOtp",
						actions: assign({ otpRetries: (ctx: any) => ctx.otpRetries - 1 }),
						cond: (ctx: any) => ctx.otpRetries > 0,
					},
				],
			},
			meta: {
				test: async ({ getByText }: RenderResult) =>
					waitFor(() => expect(getByText("Loading...")).not.toBeNull()),
			},
		},
		authorised: {
			on: {
				LOG_OUT: "awaitingUserIdentifier",
			},
			meta: {
				test: async ({ getByTestId }: RenderResult) =>
					waitFor(() => expect(getByTestId("authorised-screen")).not.toBeNull()),
			},
		},
	},
};

describe("Cognito OTP Flow", () => {
	// Construct the machine itself
	const testMachine = Machine(testMachineConfig);
	// Create model & attach UI events
	const model = createModel(testMachine).withEvents(uiEvents);

	const testPlans = model.getShortestPathPlans();

	for (const plan of testPlans) {
		describe(plan.description, () => {
			for (const path of plan.paths) {
				it(path.description, async () => {
					await act(async () => {
						const renderContext = await render(
							<CognitoOTPTestApp
								authServiceFunctions={{
									checkSession,
									validateUserIdentifier,
									validateOtp,
									signOut,
								}}
							/>
						);
						await path.test(renderContext);
					});
				});
			}
		});
	}
});
