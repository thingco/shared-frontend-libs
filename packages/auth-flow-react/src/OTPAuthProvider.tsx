import { useMachine } from "@xstate/react";
import React from "react";

import {
	createOTPAuthServices,
	defaultOTPContext,
	OTPAuthenticator,
} from "./auth-flow-otp";

import type { State } from "xstate";
import type {
	OTPAuthenticatorContext,
	OTPAuthenticatorEvent,
	OTPAuthenticatorSchema,
	OTPAuth,
} from "./auth-flow-otp";

export interface OTPAuthContextValue {
	state: State<
		OTPAuthenticatorContext,
		OTPAuthenticatorEvent,
		OTPAuthenticatorSchema
	>;
	send: (e: OTPAuthenticatorEvent) => void;
}

const OTPAuthContext = React.createContext<OTPAuthContextValue | null>(null);

export interface OTPAuthProviderProps<SessionType, UserType> {
	children: React.ReactNode;
	allowedRetries: number;
	authServiceFunctions: OTPAuth<SessionType, UserType>;
}

/**
 * @param props
 * @param {React.ReactNode} props.children
 * @param {number} props.allowedRetries
 * @param {OTPAuth<SessionType, UserType>} props.authServiceFunctions
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
		devTools: true,
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
export function useOTPAuth(): OTPAuthContextValue & {
	isLoading: boolean;
	isAuthorised: boolean;
} {
	const ctx = React.useContext(OTPAuthContext);

	if (ctx === null) {
		throw new Error(
			"OTP auth context has not been initialised properly: value is null. Please pass in correct init values -- the provider expects a set of authorisation methods and these seem to be missing."
		);
	} else if (ctx === undefined) {
		throw new Error(
			"OTP auth values may only be consumed from below an OTPAuthProvider in the component tree. Have you added the provider at the top level of the app?"
		);
	}

	const { state, send } = ctx;

	const isAuthorised = state.value === "authorised";
	const isLoading = /^validating/.test(state.value as string);

	return {
		state,
		isLoading,
		isAuthorised,
		send,
	};
}
