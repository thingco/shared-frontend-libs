/* eslint-disable @typescript-eslint/no-explicit-any */
import { Auth } from "@aws-amplify/auth";

import type { CognitoUser } from "@aws-amplify/auth";

import type {
	CheckSessionCb,
	CheckForExistingPinCb,
	ValidatePinCb,
	ValidateOtpCb,
	ValidateOtpUsernameCb,
	ValidateUsernameAndPasswordCb,
	ValidateForceChangePasswordCb,
	RequestNewPasswordCb,
	ResetPinCb,
	SetNewPinCb,
	SubmitNewPasswordCb,
	ChangePasswordCb,
	LogoutCb,
} from "../../react/callback-types";

/**
 * Check for an active session. Failure of request === no session.
 */
export const checkSessionCb: CheckSessionCb = () => Auth.currentSession();

/**
 * Validate a username when using OTP flow. Success will return a user object, failure
 * means no username found.
 */
export const validateOtpUsernameCb: ValidateOtpUsernameCb<CognitoUser> = (username: string) =>
	Auth.signIn(username);

/**
 * Validate an OTP. Success will return a user object. The user may attempt to enter the
 * OTP a configured number of times (default is three) times; on final failure, they will
 * be bumped back to username input.
 */
export const validateOtpCb: ValidateOtpCb<CognitoUser> = (user: CognitoUser, password: string) =>
	Auth.sendCustomChallengeAnswer(user, password);

/**
 * Validate a username and password together. Success will return a user object, failure
 * means one or both is wrong. The call may also succeed with a return value specifying
 * that the user must change their password: success of this is important, as the user
 * object can be passed to the next stage of authentication.
 *
 * FIXME: this is a bad API, find a better way to indicate whether a new password is
 * required or not.
 */
export const validateUsernameAndPasswordCb: ValidateUsernameAndPasswordCb<CognitoUser> = async (
	username: string,
	password: string
) => {
	const user = await Auth.signIn(username, password);
	if (user.challengeName === "NEW_PASSWORD_REQUIRED") {
		return ["NEW_PASSWORD_REQUIRED", user];
	} else {
		return user;
	}
};

/**
 * Validate a new password. The user has already submitted a valid password, but the backend systems
 * require that this be changed: the standard reason would be that a temporary password has been
 * sent out.
 */
export const validateForceChangePasswordCb: ValidateForceChangePasswordCb<CognitoUser> = (
	user: CognitoUser,
	password: string
) => Auth.completeNewPassword(user, password);

/**
 * Given a username, request a new password for that user. Failure means the call failed,
 * success will trigger the system to send out a reset code to the user's email address.
 */
export const requestNewPasswordCb: RequestNewPasswordCb = (username: string) =>
	Auth.forgotPassword(username);

/**
 * Submit a new password following a request to reset the current one. The user will
 * have been sent a code after making the reset request, so need to enter that + the new password.
 */
export const submitNewPasswordCb: SubmitNewPasswordCb = (
	username: string,
	code: string,
	newPassword: string
) => Auth.forgotPasswordSubmit(username, code, newPassword);

/**
 * Submit a change password request. For an implemetation, see the Amplify docs here:
 * https://docs.amplify.aws/lib/auth/manageusers/q/platform/js/#change-password
 *
 * The actual `changePassword` function requires the CognitoUser object as the first
 * argument, but because changing password can only occur when a user is logged in, then
 * the CognitoUser object is available by use `Auth.currentAuthenticatedUser`
 */
export const changePasswordCb: ChangePasswordCb = async (
	oldPassword: string,
	newPassword: string
) => {
	const user = await Auth.currentAuthenticatedUser();
	return await Auth.changePassword(user, oldPassword, newPassword);
};

const PIN_KEY = "auth_test_app_pin";

/**
 * Check that, in the secure async storage being used, there is a value stored under
 * whatever is being used for the PIN key.
 */
export const checkForExistingPinCb: CheckForExistingPinCb = () => {
	const pin = window.localStorage.getItem(PIN_KEY);
	return pin === null ? Promise.resolve() : Promise.reject();
};

/**
 * Validate an exiting PIN. Resolved Promise === validation.
 */
export const validatePinCb: ValidatePinCb = (pin: string) => {
	const existingPin = window.localStorage.getItem(PIN_KEY);
	return pin === existingPin ? Promise.resolve() : Promise.reject();
};

/**
 * Set a brand-new PIN. If it fails, the function will error, which fulfils the
 * resolve/reject contract for the callback.
 */
export const setNewPinCb: SetNewPinCb = (pin: string) => {
	window.localStorage.setItem(PIN_KEY, pin);
	return Promise.resolve();
};

/**
 * Reset the PIN. This is acheived by wiping the current PIN and logging out;
 * The user must re-authenticate.
 */
export const resetPinCb: ResetPinCb = async () => {
	window.localStorage.removeItem(PIN_KEY);
	return await Auth.signOut();
};

/**
 * Submit a log out request. This shouldn't fail, but we handle the errors just in case.
 *
 * NOTE **VERY IMPORTANTLY, THIS MUST ALSO CLEAR THE PIN IF PIN SECURITY IS BEING USED**
 * On logOut, the PIN is also assumed to have been blitzed: ensure this is carried out in
 * the callback.
 */
export const logoutCb: LogoutCb = async () => {
	// await PINService.clearPin();
	return await Auth.signOut();
};
