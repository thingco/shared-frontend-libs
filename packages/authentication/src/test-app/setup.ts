import { Auth } from "@aws-amplify/auth";

import { createAuthSystem } from "../authentication-system";

export const testAuthSystem = createAuthSystem({
	loginServices: {
		checkSession: async () => null,
		validateUsername: async (username: string) => "userdata",
		validateOtp: async (user: unknown, password: string) => "usedata",
		logOut: async () => null,
	},
});

export const cognitoAuthSystem = createAuthSystem({
	loginServices: {
		checkSession: async () => Auth.currentSession(),
		validateUsername: async (username: string) => Auth.signIn(username),
		validateOtp: async (user: unknown, password: string) =>
			Auth.sendCustomChallengeAnswer(user, password),
		logOut: async () => Auth.signOut(),
	},
});
