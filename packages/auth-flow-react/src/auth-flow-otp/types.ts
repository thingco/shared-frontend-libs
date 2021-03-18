/**
 * The data stored in and manipulated by the state machine.
 */
export type OTPAuthenticatorContext = {
	/**
	 * The OTP input, stored in the context prior to submission to the auth service.
	 */
	otp: string;
	/**
	 * State-specific error message, an empty string if there is no error.
	 */
	errorMsg: string;
	/**
	 * How many retries of the OTP are allowed. If a user mistypes the OTP, which is a common
	 * mistake, they are not immediately booted back to the user identifier input stage: that
	 * should only occur if the number of retries hits the limit specified here.
	 */
	otpEntryRetries: number;
	/**
	 * Whatever the auth service returns to identify a user: this comes back from the initial
	 * request to the auth service, when a user has entered their identifier. It can then be
	 * passed into the method used to validate the OTP they have been sent.
	 */
	userToken: null | any;
	/**
	 * Either an email address or a mobile phone number. Used to both identify a user,
	 * and as the location to which the OTP is sent.
	 */
	userIdentifier: string;
	/**
	 * Whatever the auth service generates/reqiures as a session token.
	 */
	sessionToken: null | any;
};

/**
 * The state schema for the machine.
 */
export type OTPAuthenticatorSchema = {
	states: {
		init: Record<string, any>;
		awaitingUserIdentifier: Record<string, any>;
		validatingUserIdentifier: Record<string, any>;
		awaitingOtp: Record<string, any>;
		validatingOtp: Record<string, any>;
		awaitingSession: Record<string, any>;
		authorised: Record<string, any>;
		logOut: Record<string, any>;
	};
};

export type OTPAuthenticatorEvent =
	| { type: "SUBMIT_USER_IDENTIFIER"; payload: string }
	| { type: "SUBMIT_OTP"; payload: string }
	| { type: "REQUEST_LOG_OUT"; payload: null };
