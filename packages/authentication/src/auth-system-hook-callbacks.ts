/**
 * Check for an active session. Failure of request === no session.
 */
export type CheckSessionCb = () => Promise<any>;

/**
 * Validate a username when using OTP flow. Success will return a user object, failure
 * means no username found.
 */
export type ValidateOtpUsernameCb<User> = (username: string) => Promise<User>;

/**
 * Validate an OTP. Success will return a user object. The user may attempt to enter the
 * OTP a configured number of times (default is three) times; on final failure, they will
 * be bumped back to username input.
 */
export type ValidateOtpCb<User> = (user: User, password: string) => Promise<User>;

/**
 * Validate a username and password together. Success will return a user object, failure
 * means one or both is wrong. The call may also succeed with a return value specifying
 * that the user must change their password: success of this is important, as the user
 * object can be passed to the next stage of authentication.
 */
export type ValidateUsernameAndPasswordCb<User> = (
	username: string,
	password: string
) => Promise<User>;

/**
 * Validate a new password. The user has already submitted a valid password, but the backend systems
 * require that this be changed: the standard reason would be that a temporary password has been
 * sent out.
 */
export type ValidateForceChangePasswordCb<User> = (user: User, password: string) => Promise<User>;

/**
 * Given a username, request a new password for that user. Failure means the call failed,
 * success will trigger the system to send out a reset code to the user's email address.
 */
export type RequestNewPasswordCb = (username: string) => Promise<any>;

/**
 * Submit a new password following a request to reset the current one. The user will
 * have been sent a code after making the reset request, so need to enter that + the new password.
 */
export type SubmitNewPasswordCb = (
	username: string,
	code: string,
	newPassword: string
) => Promise<any>;

/**
 * Submit a change password request. For an implemetation, see the Amplify docs here:
 * https://docs.amplify.aws/lib/auth/manageusers/q/platform/js/#change-password
 *
 * The actual `changePassword` function requires the CognitoUser object as the first
 * argument, but because changing password can only occur when a user is logged in, then
 * the CognitoUser object is available by use `Auth.currentAuthenticatedUser`
 */
export type ChangePasswordCb = (oldPassword: string, newPassword: string) => Promise<any>;

/**
 * Check that, in the secure async storage being used, there is a value stored under
 * whatever is being used for the PIN key.
 */
export type CheckForExistingPinCb = () => Promise<any>;

/**
 * Validate an exiting PIN. Resolved Promise === validation.
 */
export type ValidatePinCb = (pin: string) => Promise<any>;

/**
 * Set a brand-new PIN. This to be used when there is not already a PIN set; the `ChangePinCb` is
 * used if an existing PIN needs changing.
 */
export type SetNewPinCb = (pin: string) => Promise<any>;

/**
 * Change an existing PIN. This to be used when there is already a PIN set; the `SetNewPinCb` is
 * for adding a brand-new PIN.
 */
export type ChangePinCb = (oldPin: string, newPin: string) => Promise<any>;

/**
 * Submit a log out request. This shouldn't fail, but we handle the errors just in case.
 *
 * NOTE **VERY IMPORTANTLY, THIS MUST ALSO CLEAR THE PIN IF PIN SECURITY IS BEING USED**
 * On logOut, the PIN is also assumed to have been blitzed: ensure this is carried out in
 * the callback.
 */
export type LogoutCb = () => Promise<any>;
