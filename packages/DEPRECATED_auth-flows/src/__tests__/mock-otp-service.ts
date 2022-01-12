import { ServiceError } from "../errors";
import { VALID_PASSWORD, VALID_USERNAME } from "./mock-inputs";

import type { OTPService, SessionCheckBehaviour } from "../types";

export function createMockOTPService(): OTPService<string> {
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

		async requestOtp(username: string): Promise<string> {
			if (username === VALID_USERNAME) {
				user = "DUMMY_USER_DATA";
				return `VALID USER DATA! requires valid OTP to complete authorisation flow.`;
			} else {
				throw new ServiceError(`INVALID USERNAME! Username should be ${VALID_USERNAME}`);
			}
		},

		async validateOtp(user: string, password: string, triesRemaining?: number): Promise<string> {
			if (!user) {
				throw new ServiceError(`NO USER DATA PRESENT! Cannot run OTP validation function.`);
			} else if (password !== VALID_PASSWORD) {
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
