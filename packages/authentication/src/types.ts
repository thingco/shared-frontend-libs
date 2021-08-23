export type DeviceSecurityType = "PIN" | "BIOMETRIC" | "NONE";

export type LoginFlowType = "OTP" | "USERNAME_PASSWORD";

export type AuthenticationSystemError =
	| "USERNAME_INVALID"
	| "PASSWORD_CHANGE_FAILURE"
	| "PASSWORD_CHANGE_REQUIRED"
	| "PASSWORD_FORGOTTEN_CODE_INVALID"
	| "PASSWORD_INVALID"
	| `PASSWORD_INVALID_${number}_RETRIES_REMAINING`
	| "PASSWORD_RESET_FAILURE"
	| "PASSWORD_RESET_REQUEST_FAILURE"
	| "PASSWORD_RETRIES_EXCEEDED"
	| "PIN_INVALID"
	| "NEW_PIN_INVALID"
	| "PIN_CHANGE_FAILURE"
	| "NEW_PIN_INVALID"
	| "USERNAME_AND_PASSWORD_INVALID"
	| "LOG_OUT_FAILURE"
	| null;

export type AuthenticationSystemConfig = {
	loginFlowType?: LoginFlowType;
	deviceSecurityType?: DeviceSecurityType;
};
