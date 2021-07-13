export type SessionCheckBehaviour = "normal" | "forceFailure" | "forceSuccess";

export type DeviceSecurityType = "PIN" | "BIOMETRIC" | "NONE";

export type LoginFlowType = "OTP" | "USERNAME_PASSWORD";

export type DeviceSecurityPinStorageKey = "@auth_device_security_pin";
export type DeviceSecurityTypeKey = "@auth_device_security_type";

export interface DeviceSecurityService {
	getDeviceSecurityType: () => Promise<DeviceSecurityType>;
	setDeviceSecurityType: (deviceSecurityType: DeviceSecurityType) => Promise<unknown>;
	changeCurrentPin: (currentPin: string, newPin: string) => Promise<unknown>;
	checkForBiometricSupport: () => Promise<unknown>;
	checkBiometricAuthorisation: () => Promise<unknown>;
	checkPinIsSet: () => Promise<unknown>;
	checkPinIsValid: (currentPin: string) => Promise<unknown>;
	clearCurrentPin: () => Promise<unknown>;
	setNewPin: (newPin: string) => Promise<unknown>;
}
