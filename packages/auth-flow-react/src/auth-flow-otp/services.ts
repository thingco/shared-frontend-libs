import { ServiceConfig } from "xstate";

import { OTPAuthenticatorContext } from "./types";

export interface OTPAuth<Session, User> {
	checkSession(): Promise<Session>;

	validateUserIdentifier(userIdentifier: string): Promise<User>;

	validateOtp(user: User, code: string): Promise<null>;

	signOut(): Promise<null>;
}

export type OTPAuthServices<Context, Session, User> = {
	[Meth in keyof OTPAuth<Session, User>]: ServiceConfig<Context>;
};

/**
 * @param services
 */
export function createOTPAuthServices<Session, User>(
	services: OTPAuth<Session, User>
): OTPAuthServices<OTPAuthenticatorContext, Session, User> {
	return {
		checkSession: (_ctx) => services.checkSession(),
		validateUserIdentifier: (ctx) =>
			services.validateUserIdentifier(ctx.userIdentifier),
		validateOtp: (ctx) =>
			services.validateOtp(ctx.userToken, ctx.userIdentifier),
		signOut: (_ctx) => services.signOut(),
	};
}

export const defaultOTPAuthServices: OTPAuthServices<
	OTPAuthenticatorContext,
	string,
	string
> = createOTPAuthServices({
	async checkSession() {
		console.error(
			"ERROR: This is only a dummy session check function, please provide a concrete implementation to the machine."
		);
		return await "I'm a dummy session token, I ain't going to do much!";
	},

	async validateUserIdentifier(userIdentifier: string) {
		console.error(
			"ERROR: This is only a dummy userIdentifier validation function, please provide a concrete implementation to the machine."
		);
		return await "Yeah sure, that user identifier is fine, have a this string instead of a token";
	},

	async validateOtp(user: string, code: string) {
		console.error(
			"ERROR: This is only a dummy OTP validation function, please provide a concrete implementation to the machine."
		);
		return await null;
	},

	async signOut() {
		console.error(
			"ERROR: This is only a dummy sign out function, please provide a concrete implementation to the machine."
		);
		return await null;
	},
});
