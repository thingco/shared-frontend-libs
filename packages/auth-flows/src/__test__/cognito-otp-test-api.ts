export const cognitoOtpTestApi = {
	checkSession: () => Promise.resolve("session token"),
	validateUserIdentifier: (identifier: string) =>
		identifier === "validemail@test.com" ? Promise.resolve("user data") : Promise.reject(),
	validateOtp: (user: string, otp: string) =>
		user && otp === "123456" ? Promise.resolve(null) : Promise.reject(),
	signOut: () => Promise.resolve(null),
};
