/* eslint-disable @typescript-eslint/no-explicit-any */
import { inspect } from "@xstate/inspect";
import { useMachine } from "@xstate/react";
import { createContext, useContext, useEffect } from "react";

import type { DeviceSecurityType, LoginFlowType, SessionCheckBehaviour } from "./types";
import type { AuthSystemConfig, AuthSystemContext, AuthSystemEvents } from "./auth-system";
import type { State, StateMachine } from "xstate";

const AuthStateContext = createContext<{
	state: State<AuthSystemContext, AuthSystemEvents>;
} | null>(null);

const AuthUpdateContext = createContext<{
	send: (e: AuthSystemEvents) => void;
} | null>(null);

export type AuthProviderProps<User> = {
	children: React.ReactNode;
	inWebDebugMode?: boolean;
	authSystem: StateMachine<AuthSystemContext, any, AuthSystemEvents>;
} & AuthSystemConfig<User>;

export function AuthProvider<User>({
	children,
	inWebDebugMode = false,
	authSystem,
}: AuthProviderProps<User>): JSX.Element {
	const [state, send] = useMachine(authSystem, { devTools: inWebDebugMode });

	useEffect(() => {
		if (window && inWebDebugMode) {
			inspect({
				url: "https://statecharts.io/inspect",
				iframe: false,
			});
		}
	}, [inWebDebugMode]);

	return (
		<AuthUpdateContext.Provider value={{ send }}>
			<AuthStateContext.Provider value={{ state }}>{children}</AuthStateContext.Provider>
		</AuthUpdateContext.Provider>
	);
}

export function useAuthState() {
	const ctx = useContext(AuthStateContext);

	if (!ctx) {
		throw new Error(
			"useAuthState cannot be called outside of the component tree containing the AuthProvider"
		);
	}

	// prettier-ignore
	return {
		currentState: ctx.state,
		deviceSecurityType: ctx.state.context.deviceSecurityType as DeviceSecurityType,
		inAuthorisedState: ctx.state.matches("authorised"),
		inBiometricFlowInitStage: ctx.state.matches("biometricFlowInit"),
		inBiometricNotSupportedStage: ctx.state.matches("biometricNotSupported"),
		inChangeCurrentPinInputState: ctx.state.matches("changeCurrentPinInput"),
		inCurrentPinInputState: ctx.state.matches("currentPinInput"),
		inNewPinInputState: ctx.state.matches("newPinInput"),
		inOtpLoginFlowInitState: ctx.state.matches("otpLoginFlowInit"),
		inOtpPasswordInputState: ctx.state.matches("otpPasswordInput"),
		inOtpUsernameInputState: ctx.state.matches("otpUsernameInput"),
		inPinFlowInitState: ctx.state.matches("pinFlowInit"),
		inUsernamePasswordInputState: ctx.state.matches("usernamePasswordInput"),
		inUsernamePasswordLoginFlowInitState: ctx.state.matches("usernamePasswordLoginFlowInit"),
		isLoading: ctx.state.context.isLoading,
		loginFlowType: ctx.state.context.loginFlowType as LoginFlowType,
	};
}

export function useAuthUpdate() {
	const ctx = useContext(AuthUpdateContext);

	if (!ctx) {
		throw new Error(
			"useAuthUpdate cannot be called outside of the component tree containing the AuthProvider"
		);
	}

	// prettier-ignore
	return {
		authoriseAgainstBiometricSecurity: () => ctx.send({ type: "ATHORISE_AGAINST_BIOMETRIC_SECURITY"}),
		changeCurrentPin: () => ctx.send({ type: "CHANGE_CURRENT_PIN" }),
		changeDeviceSecurityType: (deviceSecurityType: DeviceSecurityType) => ctx.send({ type: "CHANGE_DEVICE_SECURITY_TYPE", deviceSecurityType }),
		checkForBiometricSupport: () => ctx.send({ type: "CHECK_FOR_BIOMETRIC_SECURITY"}),
		checkForCurrentPin: () => ctx.send({ type: "CHECK_FOR_CURRENT_PIN" }),
		goBack: () => ctx.send({ type: "GO_BACK" }),
		logOut: () => ctx.send({ type: "LOG_OUT" }),
		runSessionCheck: (sessionCheckBehaviour: SessionCheckBehaviour = "normal") => ctx.send({ type: "CHECK_FOR_SESSION", sessionCheckBehaviour }),
		skipPinSetup: () => ctx.send({ type: "SKIP_PIN_SETUP" }),
		submitCurrentAndNewPin: (currentPin: string, newPin: string) => ctx.send({ type: "SUBMIT_CURRENT_AND_NEW_PIN", currentPin, newPin }),
		submitCurrentPin: (currentPin: string) => ctx.send({ type: "SUBMIT_CURRENT_PIN", currentPin }),
		submitNewPin: (newPin: string) => ctx.send({ type: "SUBMIT_NEW_PIN", newPin }),
		submitPassword: (password: string) => ctx.send({ type: "SUBMIT_PASSWORD", password }),
		submitUsername: (username: string) => ctx.send({ type: "SUBMIT_USERNAME", username }),
		submitUsernameAndPassword: (username: string, password: string) => ctx.send({ type: "SUBMIT_USERNAME_AND_PASSWORD", username, password }),
	}
}
