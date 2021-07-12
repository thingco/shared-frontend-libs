import { ServiceError } from "./utilities";

import type { SessionCheckBehaviour } from "./types";

/**
 * A _service_ is a collection of functions whose execution is handled
 * by that service's state machine. These functions are always assumed
 * to be async, so do note that the type definitions will enforce this.
 *
 * The service is always a wrapper over a specific API -- so for example
 * AWS Amplify Auth, or Expo's SecureStore. The reason it is done this
 * way is to provide a consistent set of methods that the state machine
 * can use -- the underlying methods the service uses can easily be swapped
 * out for mock implementations if necessary.
 *
 * Because of this, the collection is defined as an object, the functions
 * being the methods, and the collection **may** be stateful. It can
 * also be assumed to trigger side effects outside of the control of the
 * authentication state machine.
 */
export interface UsernamePasswordService<User> {
	checkForExtantSession(sessionCheckBehaviour?: SessionCheckBehaviour): Promise<unknown>;

	validateUsernameAndPassword(username: string, password: string): Promise<User>;

	logOut(): Promise<unknown>;
}

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
