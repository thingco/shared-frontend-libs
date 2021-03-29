import { fireEvent, render, RenderResult, waitFor } from "@testing-library/react";
import { createModel } from "@xstate/test";
import React from "react";
import { act } from "react-dom/test-utils";
import { Machine } from "xstate";

import { cognitoOtpTestApi } from "./cognito-otp-test-api";
import { CognitoOTPTestApp } from "./CognitoOTPTestApp";

/**
 * @param stallTime
 */
async function stall(stallTime = 500) {
	await new Promise((resolve) => setTimeout(resolve, stallTime));
}

/**
 * Dummy user inputs
 */
const VALID_USER_IDENTIFIER = "validemail@test.com";
const INVALID_USER_IDENTIFIER = "invalidemail@test.com";
const VALID_OTP = "123456";
const INVALID_OTP = "invalidpassword";

const uiEvents = {
	SESSION_CHECK_SUCCESS: async () =>
		await jest.spyOn(cognitoOtpTestApi, "checkSession").mockImplementation(async () => {
			await stall();
			return await "session token";
		}),
	SESSION_CHECK_FAILURE: async () =>
		await jest.spyOn(cognitoOtpTestApi, "checkSession").mockImplementation(async () => {
			await stall();
			throw new Error();
		}),
	SUBMIT_USER_IDENTIFIER: {
		exec: async ({ getByTestId }: any, event: any) => {
			await fireEvent.change(getByTestId("email-input"), {
				target: { value: event.value },
			});
			await fireEvent.click(getByTestId("submit-button"));
		},
		cases: [{ value: VALID_USER_IDENTIFIER }, { value: INVALID_USER_IDENTIFIER }],
	},
	USER_IDENTIFIER_CHECK_SUCCESS: {},
	USER_IDENTIFIER_CHECK_FAILURE: {},
	SUBMIT_OTP: {
		exec: async ({ getByTestId }: any, event: any) => {
			await fireEvent.change(getByTestId("otp-input"), {
				target: { value: event.value },
			});
			await fireEvent.click(getByTestId("submit-button"));
		},
		cases: [{ value: VALID_OTP }, { value: INVALID_OTP }],
	},
	LOG_OUT: async ({ getByTestId }: any) => await fireEvent.click(getByTestId("logout-button")),
};

const testMachineConfig = {
	id: "authenticator-test",
	initial: "validatingSession",
	context: {},
	states: {
		validatingSession: {
			on: {
				SESSION_CHECK_SUCCESS: "authorised",
				SESSION_CHECK_FAILURE: "awaitingUserIdentifier",
			},
			meta: {
				test: async ({ getByTestId }: RenderResult) =>
					waitFor(() => expect(getByTestId("loader")).not.toBeNull()),
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
				test: async ({ getByTestId }: RenderResult) =>
					waitFor(() => expect(getByTestId("loader")).not.toBeNull()),
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
				OTP_CHECK_FAILURE: "awaitingUserIdentifier",
			},
			meta: {
				test: async ({ getByTestId }: RenderResult) =>
					waitFor(() => expect(getByTestId("loader")).not.toBeNull()),
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
						await path.test(render(<CognitoOTPTestApp authServiceFunctions={cognitoOtpTestApi} />));
					});
				});
			}
		});
	}
});
