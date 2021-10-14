import {
	VALID_USERNAME,
	USER_OBJECT,
	VALID_CODE,
	VALID_PASSWORD,
	OLD_PASSWORD,
} from "test-utils/dummy-responses";

import type {
	ValidateOtpCb,
	ValidatePinCb,
	ValidateOtpUsernameCb,
	ValidateForceChangePasswordCb,
	ValidateUsernameAndPasswordCb,
	RequestNewPasswordCb,
	SubmitNewPasswordCb,
	ChangePasswordCb,
	CheckForExistingPinCb,
	SetNewPinCb,
} from "core/react/callback-types";

export const checkSessionCb = jest.fn();

export const validateOtpUsernameCb: jest.MockedFunction<ValidateOtpUsernameCb<any>> = jest.fn(
	async (username) => {
		if (username === VALID_USERNAME) {
			return Promise.resolve(USER_OBJECT);
		} else {
			return Promise.reject();
		}
	}
);

export const validateOtpCb: jest.MockedFunction<ValidateOtpCb<any>> = jest.fn(async (_, otp) => {
	if (otp === VALID_CODE) {
		return Promise.resolve(USER_OBJECT);
	} else {
		return Promise.reject();
	}
});

export const validateUsernameAndPasswordCb: jest.MockedFunction<
	ValidateUsernameAndPasswordCb<any>
> = jest.fn(async (username, password) => {
	if (username === VALID_USERNAME && password === VALID_PASSWORD) {
		return Promise.resolve(USER_OBJECT);
	} else if (username === VALID_USERNAME && password === OLD_PASSWORD) {
		return Promise.resolve(["NEW_PASSWORD_REQUIRED", USER_OBJECT]);
	} else {
		return Promise.reject();
	}
});

export const validateForceChangePasswordCb: jest.MockedFunction<
	ValidateForceChangePasswordCb<any>
> = jest.fn(async (_, password) => {
	if (password === VALID_PASSWORD) {
		return Promise.resolve();
	} else {
		return Promise.reject();
	}
});

export const requestNewPasswordCb: jest.MockedFunction<RequestNewPasswordCb> = jest.fn(
	async (username) => {
		if (username === VALID_USERNAME) {
			return Promise.resolve();
		} else {
			return Promise.reject();
		}
	}
);

export const submitNewPasswordCb: jest.MockedFunction<SubmitNewPasswordCb> = jest.fn(
	async (username, code, newPassword) => {
		if (username === VALID_USERNAME && code === VALID_CODE && newPassword === VALID_PASSWORD) {
			return Promise.resolve();
		} else {
			return Promise.reject();
		}
	}
);

export const changePasswordCb: jest.MockedFunction<ChangePasswordCb> = jest.fn(
	async (oldPassword, newPassword) => {
		if (oldPassword === VALID_PASSWORD && newPassword === VALID_PASSWORD) {
			return Promise.resolve();
		} else {
			return Promise.reject();
		}
	}
);

export const checkForExistingPinCb: jest.MockedFunction<CheckForExistingPinCb> = jest.fn();

export const validatePinCb: jest.MockedFunction<ValidatePinCb> = jest.fn((pin: string) =>
	pin === VALID_CODE ? Promise.resolve() : Promise.reject()
);

export const setNewPinCb: jest.MockedFunction<SetNewPinCb> = jest.fn((pin: string) =>
	pin === VALID_CODE ? Promise.resolve() : Promise.reject()
);

export const changePinCb = jest.fn((newPin: string) =>
	newPin === VALID_CODE ? Promise.resolve() : Promise.reject()
);

export const logOutCb = jest.fn();
