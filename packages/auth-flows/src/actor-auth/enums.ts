export const enum AuthServiceId {
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
	setPin = "setPin",
	clearPin = "clearPin",
}
