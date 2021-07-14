import { ServiceError } from "../errors";

import type { SessionCheckBehaviour, UsernamePasswordService } from "../types";

export function createDummyUsernamePasswordService(
	testUsername: string,
	testPassword: string
): UsernamePasswordService<string> {
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

		async validateUsernameAndPassword(username: string, password: string): Promise<string> {
			if (password !== testPassword && username !== testUsername) {
				throw new ServiceError(`INVALID USERNAME AND PASSWORD!`);
			}

			sessionToken = "DUMMY_SESSION_TOKEN";
			user = "DUMMY_USER_DATA";
			return `VALID USERNAME AND PASSWORD! Authorisation complete, session token set`;
		},

		async logOut(): Promise<string> {
			sessionToken = null;
			if (user) user = null;
			return `LOGGED OUT! Session token and user had been set to null.`;
		},
	};
}
