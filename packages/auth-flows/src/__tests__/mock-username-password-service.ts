import { ServiceError } from "../errors";
import {
	DUMMY_SESSION_TOKEN,
	DUMMY_USER_OBJECT,
	VALID_PASSWORD,
	VALID_USERNAME,
} from "./mock-inputs";

import type { SessionCheckBehaviour, UsernamePasswordService } from "../types";

export function createMockUsernamePasswordService(): UsernamePasswordService<string> {
	let sessionToken: typeof DUMMY_SESSION_TOKEN | null = null;
	let user: typeof DUMMY_USER_OBJECT | null = null;

	return {
		async checkForExtantSession(
			sessionCheckBehaviour: SessionCheckBehaviour = "normal"
		): Promise<string> {
			if (sessionCheckBehaviour === "forceSuccess") {
				sessionToken = DUMMY_SESSION_TOKEN;
			}

			if (sessionToken === null || sessionCheckBehaviour === "forceFailure") {
				throw new ServiceError(`NO SESSION TOKEN PRESENT! User needs to log in.`);
			} else {
				return sessionToken;
			}
		},

		async validateUsernameAndPassword(username: string, password: string): Promise<string> {
			if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
				throw new ServiceError(`INVALID USERNAME OR PASSWORD!`);
			}

			sessionToken = DUMMY_SESSION_TOKEN;
			user = DUMMY_USER_OBJECT;
			return `VALID USERNAME AND PASSWORD! Authorisation complete, session token set`;
		},

		async validateNewPassword(password: string, newPassword: string): Promise<string> {
			if (password !== VALID_PASSWORD && newPassword !== VALID_PASSWORD) {
				throw new ServiceError(`INVALID PASSWORD!`);
			}

			sessionToken = DUMMY_SESSION_TOKEN;
			user = DUMMY_USER_OBJECT;
			return `VALIDPASSWORD! wohoo this mock function is bollox`;
		},

		async logOut(): Promise<string> {
			sessionToken = null;
			if (user) user = null;
			return `LOGGED OUT! Session token and user had been set to null.`;
		},
	};
}
