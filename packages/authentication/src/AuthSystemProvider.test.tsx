/* eslint-disable @typescript-eslint/no-explicit-any */
import { createModel } from "@xstate/test";
import { createMachine, interpret } from "xstate";

import { AuthStateId, createAuthenticationSystem, machine } from "./auth-system";
import { AuthError } from "./types";

import type * as AuthCb from "./auth-system-hook-callbacks";
import type { AuthEvent, AuthInterpreter } from "./auth-system";

/* ========================================================================= *\
 * 1. UTILITIES
 * 2. SETUP
 * 3. SYSTEM UNDER TEST
 * 4. SANITY CHECKS
 * 5. TESTS
\* ========================================================================= */

/* ------------------------------------------------------------------------- *\
 * 1. UTILITIES
\* ------------------------------------------------------------------------- */

/**
 * XState's `test` package requires defining a test model (System Under Test), then providing
 * a mapping of events in the SUT to events in the actual model. Make this less onerous, this
 * usitlity function just requires the actual event to be sent passed in:
 */
function doSend(e: AuthEvent) {
	return {
		exec: ({ send }: AuthInterpreter) => send(e),
	} as any;
}

/* ------------------------------------------------------------------------- *\
 * 2. SETUP
\* ------------------------------------------------------------------------- */

const VALID_USERNAME = "validuser@example.com";
const INVALID_USERNAME = "invaliduser@example.com";

const VALID_CODE = "123456";
const INVALID_CODE = "654321";
const ANOTHER_VALID_CODE = "123456";
const ANOTHER_INVALID_CODE = "654321";

const VALID_PASSWORD = "validpassword";
const ANOTHER_VALID_PASSWORD = "anothervalidpassword";
const INVALID_PASSWORD = "invalidpassword";
const TEMPORARY_PASSWORD = "temporarypassword";

const USER_OBJECT = { description: "I represent the user object returned by the OAuth system" };

// prettier-ignore
const MockCb = {
	checkSessionCb: jest.fn(),
	validateOtpUsernameCb: jest.fn((username) => username === VALID_USERNAME ? Promise.resolve(USER_OBJECT) : Promise.reject()),
	validateOtpCb: jest.fn((_, otp) => otp === VALID_CODE ? Promise.resolve(USER_OBJECT) : Promise.reject() ),
	validateUsernameAndPasswordCb: jest.fn((username, password) => {
		if (username === VALID_USERNAME && password === VALID_PASSWORD) {
			return Promise.resolve(USER_OBJECT);
		} else if (username === VALID_USERNAME && password === VALID_CODE) {
			return Promise.resolve({ ...USER_OBJECT, NEW_PASSWORD_REQUIRED: true });
		} else {
			return Promise.reject();
		}
	}),
	validateForceChangePasswordCb: jest.fn((_, password) => password === VALID_PASSWORD ? Promise.resolve() : Promise.reject()),
	requestNewPasswordCb: jest.fn((username) => username === VALID_USERNAME ? Promise.resolve() : Promise.reject()),
	submitNewPasswordCb: jest.fn((_, code, password) => code === VALID_CODE && password === VALID_PASSWORD ? Promise.resolve() : Promise.reject()),
	changePasswordCb: jest.fn((oldPassword, newPassword) => oldPassword === VALID_PASSWORD && newPassword === ANOTHER_VALID_PASSWORD ? Promise.resolve() : Promise.reject()),
	checkForExistingPinCb: jest.fn(),
	validatePinCb: jest.fn((pin: string) => pin === VALID_CODE ? Promise.resolve() : Promise.reject()),
	setNewPinCb: jest.fn((pin: string) => pin === VALID_CODE ? Promise.resolve() : Promise.reject()),
	changePinCb: jest.fn((newPin: string) => newPin === VALID_CODE ? Promise.resolve() : Promise.reject()),
	logOutCb: jest.fn(),
}

/* ------------------------------------------------------------------------- *\
 * 3. SYSTEM UNDER TEST
\* ------------------------------------------------------------------------- */

/* ------------------------------------------------------------------------- *\
 * 4. SANITY CHECKS
\* ------------------------------------------------------------------------- */

/* ------------------------------------------------------------------------- *\
 * 5. TESTS
\* ------------------------------------------------------------------------- */

describe("authentication test system using OTP and no device security", () => {
	test.todo("Add OTP flow model test");
});

describe("authentication test system using username and password and no device security", () => {
	test.todo("Add username password flow model test");
});

describe("authentication test system using PIN device security", () => {
	test.todo("Add PIN security model test");
});
