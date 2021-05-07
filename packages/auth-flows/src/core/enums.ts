export const enum AuthenticatorServiceId {
	sessionCheckService = "sessionCheckService",
	otpUsernameInputService = "otpUsernameInputService",
	otpInputService = "otpInputService",
	usernamePasswordInputService = "usernamePasswordInputService",
	pinInputService = "pinInputService",
	signOutService = "signOutService",
}

export const enum PinServiceId {
	hasPinSet = "hasPinSet",
	validatePin = "validatePin",
	setNewPin = "setNewPin",
	clearPin = "clearPin",
}
