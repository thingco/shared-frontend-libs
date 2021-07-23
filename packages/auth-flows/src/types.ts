export type SessionCheckBehaviour = "normal" | "forceFailure" | "forceSuccess";

export type DeviceSecurityType = "PIN" | "BIOMETRIC" | "NONE";

export type LoginFlowType = "OTP" | "USERNAME_PASSWORD";

/*
 * A service is always a wrapper over a specific API or APIs -- so for example
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

export interface OTPService<User> {
	checkForExtantSession(sessionCheckBehaviour?: SessionCheckBehaviour): Promise<unknown>;

	requestOtp(username: string): Promise<User>;

	validateOtp(user: User, password: string, triesRemaining: number): Promise<User>;

	logOut(): Promise<unknown>;
}

export interface UsernamePasswordService<User> {
	checkForExtantSession(sessionCheckBehaviour?: SessionCheckBehaviour): Promise<unknown>;

	validateUsernameAndPassword(username: string, password: string): Promise<User>;

	logOut(): Promise<unknown>;
}

export type DeviceSecurityPinStorageKey = "auth_device_security_pin";
export type DeviceSecurityTypeKey = "auth_device_security_type";

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
