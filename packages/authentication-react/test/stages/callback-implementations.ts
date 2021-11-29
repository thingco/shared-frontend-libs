import * as td from "testdouble";
import { MOCK_USER_OBJECT } from "test-utils/dummy-responses"

import type {
	CheckSessionCb,
	CheckForExistingPinCb,
	ValidatePinCb,
	ValidateOtpCb,
	ValidateOtpUsernameCb,
	ValidateUsernameAndPasswordCb,
	ValidateForceChangePasswordCb,
	RequestNewPasswordCb,
	SetNewPinCb,
	SubmitNewPasswordCb,
	ChangePasswordCb,
	LogoutCb,
} from "@thingco/authentication-react";

export const checkSessionCb = td.func<CheckSessionCb>()
export const validateOtpUsernameCb = td.func<ValidateOtpUsernameCb<typeof MOCK_USER_OBJECT>>();
export const validateOtpCb = td.func<ValidateOtpCb<typeof MOCK_USER_OBJECT>>();
export const validateUsernameAndPasswordCb = td.func<ValidateUsernameAndPasswordCb<typeof MOCK_USER_OBJECT>>();
export const validateForceChangePasswordCb = td.func<ValidateForceChangePasswordCb<typeof MOCK_USER_OBJECT>>();
export const requestNewPasswordCb = td.func<RequestNewPasswordCb>();
export const submitNewPasswordCb = td.func<SubmitNewPasswordCb>();
export const changePasswordCb = td.func<ChangePasswordCb>();
export const checkForExistingPinCb = td.func<CheckForExistingPinCb>();
export const validatePinCb = td.func<ValidatePinCb>();
export const setNewPinCb = td.func<SetNewPinCb>();
export const logoutCb = td.func<LogoutCb>();
export const resetPinCb = td.func<LogoutCb>();
