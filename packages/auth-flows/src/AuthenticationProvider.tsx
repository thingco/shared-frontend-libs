import { inspect } from "@xstate/inspect";
import { useMachine } from "@xstate/react";
import * as React from "react";
import { State } from "xstate";

import { createAuthSystem } from "./auth-system";
import { DeviceSecurityType, LoginFlowType, SessionCheckBehaviour } from "./types";

import type { AuthSystemConfig, AuthSystemContext, AuthSystemEvents } from "./auth-system";

inspect({
	url: "https://statecharts.io/inspect",
	iframe: false,
});

const AuthStateContext = React.createContext<{
	state: State<AuthSystemContext, AuthSystemEvents>;
} | null>(null);

const AuthUpdateContext = React.createContext<{
	send: (e: AuthSystemEvents) => void;
} | null>(null);

export type AuthProviderProps<User> = {
	children: React.ReactNode;
	inWebDebugMode?: boolean;
} & AuthSystemConfig<User>;

export function AuthProvider<User>({
	children,
	inWebDebugMode = false,
	...authSystemConfig
}: AuthProviderProps<User>): JSX.Element {
	const authSystem = createAuthSystem(authSystemConfig);
	const [state, send] = useMachine(authSystem, { devTools: inWebDebugMode });

	return (
		<AuthUpdateContext.Provider value={{ send }}>
			<AuthStateContext.Provider value={{ state }}>{children}</AuthStateContext.Provider>
		</AuthUpdateContext.Provider>
	);
}

export function useAuthState() {
	const ctx = React.useContext(AuthStateContext);

	if (!ctx) {
		throw new Error(
			"useAuthState cannot be called outside of the component tree containing the AuthProvider"
		);
	}

	// prettier-ignore
	return {
		loginFlowType: ctx.state.context.loginFlowType as LoginFlowType,
		deviceSecurityType: ctx.state.context.deviceSecurityType as DeviceSecurityType,
		isLoading: ctx.state.context.isLoading,
		inAuthorisedState: ctx.state.matches("authorised"),
		inOtpLoginFlowInitState: ctx.state.matches("otpLoginFlowInit"),
		inOtpUsernameInputState: ctx.state.matches("otpUsernameInput"),
		inOtpPasswordInputState: ctx.state.matches("otpPasswordInput"),
		inUsernamePasswordLoginFlowInitState: ctx.state.matches("usernamePasswordLoginFlowInit"),
		inUsernamePasswordInputState: ctx.state.matches("usernamePasswordInput"),
		inPinFlowInitState: ctx.state.matches("pinFlowInit"),
		inCurrentPinInputState: ctx.state.matches("currentPinInput"),
		inNewPinInputState: ctx.state.matches("newPinInput"),
		inChangeCurrentPinInputState: ctx.state.matches("changeCurrentPinInput"),
	};
}

export function useAuthUpdate() {
	const ctx = React.useContext(AuthUpdateContext);

	if (!ctx) {
		throw new Error(
			"useAuthUpdate cannot be called outside of the component tree containing the AuthProvider"
		);
	}

	// prettier-ignore
	return {
		runSessionCheck: (sessionCheckBehaviour: SessionCheckBehaviour = "normal") => ctx.send({ type: "CHECK_FOR_SESSION", sessionCheckBehaviour }),
		submitUsername: (username: string) => ctx.send({ type: "SUBMIT_USERNAME", username }),
		submitPassword: (password: string) => ctx.send({ type: "SUBMIT_PASSWORD", password }),
		submitUsernameAndPassword: (username: string, password: string) => ctx.send({ type: "SUBMIT_USERNAME_AND_PASSWORD", username, password }),
		logOut: () => ctx.send({ type: "LOG_OUT" }),
		goBack: () => ctx.send({ type: "GO_BACK" }),
		changeLoginFlowType: (loginFlowType: LoginFlowType) => ctx.send({ type: "CHANGE_LOGIN_FLOW_TYPE", loginFlowType }),
		changeDeviceSecurityType: (deviceSecurityType: DeviceSecurityType) => ctx.send({ type: "CHANGE_DEVICE_SECURITY_TYPE", deviceSecurityType }),
		checkForExistingPin: () => ctx.send({ type: "CHECK_FOR_EXISTING_PIN" }),
		changeExistingPin: () => ctx.send({ type: "CHANGE_EXISTING_PIN" }),
		skipPinSetup: () => ctx.send({ type: "SKIP_PIN_SETUP" }),
		submitCurrentPin: (currentPin: string) => ctx.send({ type: "SUBMIT_CURRENT_PIN", currentPin }),
		submitCurrentAndNewPin: (currentPin: string, newPin: string) => ctx.send({ type: "SUBMIT_CURRENT_AND_NEW_PIN", currentPin, newPin }),
		submitNewPin: (newPin: string) => ctx.send({ type: "SUBMIT_NEW_PIN", newPin }),
	}
}
