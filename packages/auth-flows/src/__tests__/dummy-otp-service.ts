import { ServiceError } from "../errors";

import type { OTPService, SessionCheckBehaviour } from "../types";

export function createDummyOTPService(
	testUsername: string,
	testPassword: string
): OTPService<string> {
	let sessionToken: "DUMMY_SESSION_TOKEN" | null = null;
	let user: "DUMMY_USER_DATA" | null = null;

	return {
		async checkForExtantSession(
			sessionCheckBehaviour: SessionCheckBehaviour = "normal"
		): Promise<string> {
			if (sessionCheckBehaviour === "forceSuccess") {
				sessionToken = "DUMMY_SESSION_TOKEN";
			}

			if (sessionToken === null || sessionCheckBehaviour === "forceFailure") {
				throw new ServiceError(`NO SESSION TOKEN PRESENT! User needs to log in.`);
			} else {
				return sessionToken;
			}
		},

		/**
		 * Given a username (which will be, in practice, an email or a phonenumber), send an OTP
		 * to the user. The request should return an object of some kind, the user data, which
		 * needs stored to be passed to the next function (`validateOtp`).
		 */
		async requestOtp(username: string): Promise<string> {
			if (username === testUsername) {
				user = "DUMMY_USER_DATA";
				return `VALID USER DATA! requires valid OTP to complete authorisation flow.`;
			} else {
				throw new ServiceError(`INVALID USERNAME! Username should be ${testUsername}`);
			}
		},

		async validateOtp(user: string, password: string, triesRemaining: number): Promise<string> {
			if (!user) {
				throw new ServiceError(`NO USER DATA PRESENT! Cannot run OTP validation function.`);
			} else if (password !== testPassword) {
				throw new ServiceError(`INVALID OTP! ${triesRemaining} tries remaining.`);
			} else {
				sessionToken = "DUMMY_SESSION_TOKEN";
				user = "DUMMY_USER_DATA";
				return `VALID USER DATA! Authorisation complete, session token set`;
			}
		},

		async logOut(): Promise<string> {
			sessionToken = null;
			if (user) user = null;
			return `LOGGED OUT! Session token and user had been set to null.`;
		},
	};
}
