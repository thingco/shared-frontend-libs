export type SessionCheckBehaviour = "normal" | "forceFailure" | "forceSuccess";

export type DeviceSecurityType = "PIN" | "BIOMETRIC" | "NONE";

export type LoginFlowType = "OTP" | "USERNAME_PASSWORD";

export type DeviceSecurityPinStorageKey = "@auth_device_security_pin";
export type DeviceSecurityTypeKey = "@auth_device_security_type";

export interface DeviceSecurityService {
	getDeviceSecurityType: () => Promise<DeviceSecurityType>;
	setDeviceSecurityType: (deviceSecurityType: DeviceSecurityType) => Promise<any>;
	changeExistingPin: (currentPin: string, newPin: string) => Promise<any>;
	checkPinIsSet: () => Promise<any>;
	checkPinIsValid: (currentPin: string) => Promise<any>;
	clearExistingPin: () => Promise<any>;
	setNewPin: (newPin: string) => Promise<any>;
}
