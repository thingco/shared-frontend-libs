export type DeviceSecurityType = "PIN" | "BIOMETRIC" | "NONE";

export type LoginFlowType = "OTP" | "USERNAME_PASSWORD";

export type AuthenticationSystemError =
	| "USERNAME_INVALID"
	| "PASSWORD_FORGOTTEN_CODE_INVALID"
	| "PASSWORD_INVALID"
	| `PASSWORD_INVALID_${number}_RETRIES_REMAINING`
	| "PASSWORD_RETRIES_EXCEEDED"
	| "PIN_INVALID"
	| "NEW_PIN_INVALID"
	| null;
