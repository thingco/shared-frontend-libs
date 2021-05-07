import { useMachine } from "@xstate/react";
import React from "react";
import { State, StateValue } from "xstate";

import {
	AuthenticatorContext,
	AuthenticatorEvent,
	AuthenticatorFactoryConfig,
	AuthenticatorSchema,
	AuthenticatorServiceFunctions,
	createAuthenticator,
	PinServiceFunctions,
	User,
} from "./core";

interface AuthStoreValue {
	state: State<AuthenticatorContext, AuthenticatorEvent, AuthenticatorSchema>;
	send: (e: AuthenticatorEvent) => void;
}

const AuthStore = React.createContext<AuthStoreValue | null>(null);

export interface AuthProviderProps extends Partial<AuthenticatorFactoryConfig> {
	children: React.ReactNode;
	useOtpAuth?: boolean;
	usePinSecurity?: boolean;
	allowedOtpRetries?: number;
	authServiceFunctions: AuthenticatorServiceFunctions;
	pinServiceFunctions?: PinServiceFunctions;
}

export const AuthProvider = ({
	useOtpAuth = true,
	usePinSecurity = false,
	allowedOtpRetries = 0,
	authServiceFunctions,
	pinServiceFunctions = undefined,
	children,
}: AuthProviderProps): JSX.Element => {
	const machine = createAuthenticator({
		useOtpAuth,
		usePinSecurity,
		allowedOtpRetries,
		authServiceFunctions,
		pinServiceFunctions,
	});
	const [state, send] = useMachine(machine, { devTools: true });

	return <AuthStore.Provider value={{ state, send }}>{children}</AuthStore.Provider>;
};

function createSendAliases(send: (e: AuthenticatorEvent) => void) {
	return {
		submitOtpUsername: (username: string) => send({ type: "OTP_FLOW.SUBMIT_USERNAME", username }),
		submitOtp: (password: string) => send({ type: "OTP_FLOW.SUBMIT_OTP", password }),
		submitUsernamePassword: (username: string, password: string) =>
			send({ type: "USERNAME_PASSWORD_FLOW.INPUT", username, password }),
		submitPin: (pin: string) => send({ type: "PIN_FLOW.SUBMIT_PIN", pin }),
		changeCurrentPin: () => send({ type: "PIN_FLOW.CHANGE_CURRENT_PIN" }),
		skipSettingPin: () => send({ type: "PIN_FLOW.SKIP_SETTING_PIN" }),
		turnOnPinSecurity: () => send({ type: "PIN_FLOW.TURN_ON_PIN_SECURITY" }),
		turnOffPinSecurity: () => send({ type: "PIN_FLOW.TURN_OFF_PIN_SECURITY" }),
		goBack: () => send({ type: "GLOBAL_AUTH.GO_BACK" }),
		signOut: () => send({ type: "SIGN_OUT.INITIALISE" }),
	};
}

export interface AuthTools {
	_machineState: State<AuthenticatorContext, AuthenticatorEvent, AuthenticatorSchema>;
	currentState: StateValue;
	isAuthorised: boolean;
	isLoading: boolean;
	isUsingOtpAuth: boolean;
	isUsingPinSecurity: boolean;
	userData: null | User;
	userHasPinSet: boolean;
	submitOtpUsername: (username: string) => void;
	submitOtp: (password: string) => void;
	submitUsernamePassword: (username: string, password: string) => void;
	submitPin: (pin: string) => void;
	changeCurrentPin: () => void;
	skipSettingPin: () => void;
	turnOnPinSecurity: () => void;
	turnOffPinSecurity: () => void;
	goBack: () => void;
	signOut: () => void;
}

export function useAuth(): AuthTools {
	const machine = React.useContext(AuthStore);

	if (!machine)
		throw new Error(
			"Authentication machine is null. This generally indicates that you are attempting to access the context value stored in the auth provider outside of the component tree it has been defined in."
		);

	// prettier-ignore

	const sendAliases = createSendAliases(machine.send);
	const currentState = machine.state.value;
	const isAuthorised = machine.state.matches("authorised");
	const {
		isLoading,
		isUsingOtpAuth,
		isUsingPinSecurity,
		userData,
		userHasPinSet,
	} = machine.state.context;

	return {
		_machineState: machine.state,
		...sendAliases,
		currentState,
		isAuthorised,
		isLoading,
		isUsingOtpAuth,
		isUsingPinSecurity,
		userData,
		userHasPinSet,
	};
}
