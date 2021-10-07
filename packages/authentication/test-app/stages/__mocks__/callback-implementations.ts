import {
	VALID_USERNAME,
	USER_OBJECT,
	VALID_CODE,
	VALID_PASSWORD,
	OLD_PASSWORD,
} from "../../../test-utilities";

export const checkSessionCb = jest.fn();

export const validateOtpUsernameCb = jest.fn(async (username) => {
	if (username === VALID_USERNAME) {
		return Promise.resolve(USER_OBJECT);
	} else {
		return Promise.reject();
	}
});

export const validateOtpCb = jest.fn(async (_, otp) => {
	if (otp === VALID_CODE) {
		return Promise.resolve(USER_OBJECT);
	} else {
		return Promise.reject();
	}
});

export const validateUsernameAndPasswordCb = jest.fn(async (username, password) => {
	if (username === VALID_USERNAME && password === VALID_PASSWORD) {
		return Promise.resolve(USER_OBJECT);
	} else if (username === VALID_USERNAME && password === OLD_PASSWORD) {
		return Promise.resolve(["NEW_PASSWORD_REQUIRED", USER_OBJECT]);
	} else {
		return Promise.reject();
	}
});

export const validateForceChangePasswordCb = jest.fn(async (_, password) => {
	if (password === VALID_PASSWORD) {
		return Promise.resolve();
	} else {
		return Promise.reject();
	}
});

export const requestNewPasswordCb = jest.fn(async (username) => {
	if (username === VALID_USERNAME) {
		return Promise.resolve();
	} else {
		return Promise.reject();
	}
});

export const submitNewPasswordCb = jest.fn(async (username, code, newPassword) => {
	if (username === VALID_USERNAME && code === VALID_CODE && newPassword === VALID_PASSWORD) {
		return Promise.resolve();
	} else {
		return Promise.reject();
	}
});

export const changePasswordCb = jest.fn(async (oldPassword, newPassword) => {
	if (oldPassword === VALID_PASSWORD && newPassword === VALID_PASSWORD) {
		return Promise.resolve();
	} else {
		return Promise.reject();
	}
});

export const checkForExistingPinCb = jest.fn();

export const validatePinCb = jest.fn((pin: string) =>
	pin === VALID_CODE ? Promise.resolve() : Promise.reject()
);

export const setNewPinCb = jest.fn((pin: string) =>
	pin === VALID_CODE ? Promise.resolve() : Promise.reject()
);

export const changePinCb = jest.fn((newPin: string) =>
	newPin === VALID_CODE ? Promise.resolve() : Promise.reject()
);

export const logOutCb = jest.fn();
