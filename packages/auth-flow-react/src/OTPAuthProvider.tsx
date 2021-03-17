import {
	createOTPAuthServices,
	defaultOTPContext,
	OTPAuthenticator,
} from "@thingco/auth-flow";
import { useMachine } from "@xstate/react";
import React from "react";

import type { State } from "xstate";
import type {
	OTPAuthenticatorContext,
	OTPAuthenticatorEvent,
	OTPAuth,
} from "@thingco/auth-flow";

export interface OTPAuthContextValue {
	state: State<OTPAuthenticatorContext, OTPAuthenticatorEvent>;
	send: (e: OTPAuthenticatorEvent) => void;
}

const OTPAuthContext = React.createContext<OTPAuthContextValue | null>(null);

export interface OTPAuthProviderProps<SessionType, UserType> {
	children: React.ReactNode;
	allowedRetries: number;
	authServiceFunctions: OTPAuth<SessionType, UserType>;
}

/**
 * @param root0
 * @param root0.children
 * @param root0.allowedRetries
 * @param root0.authServiceFunctions
 */
export function OTPAuthProvider<SessionType, UserType>({
	children,
	allowedRetries,
	authServiceFunctions,
}: OTPAuthProviderProps<SessionType, UserType>): JSX.Element {
	const services = createOTPAuthServices<SessionType, UserType>(
		authServiceFunctions
	);
	const [state, send] = useMachine(OTPAuthenticator, {
		services,
		context: { ...defaultOTPContext, otpEntryRetries: allowedRetries },
	});

	return (
		<OTPAuthContext.Provider value={{ send, state }}>
			{children}
		</OTPAuthContext.Provider>
	);
}

/**
 *
 */
export function useOTPAuth(): OTPAuthContextValue {
	const ctx = React.useContext(OTPAuthContext);
	if (ctx === null) {
		throw new Error(
			"OTP auth context has not been initialised properly: value is null. Please pass in correct init values."
		);
	} else if (ctx === undefined) {
		throw new Error(
			"OTP auth values may only be consumed from below an OTPAuthProvider in the component tree. Have you added the provider at the top level of the app?"
		);
	}
	return ctx;
}
