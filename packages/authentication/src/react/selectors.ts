/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AuthStateId } from "core/enums";

import type { AuthContext, AuthState } from "core/types";

/**
 * To access values (states and context) from the auth system FSM in React,
 * selectors are used. This is more verbose and requires boilerplate, but the
 * advantage is that it tightly controls what will trigger a rerender of a
 * component that relies on a given value.
 *
 * 1. UTILITY TYPES
 *
 * These are used to tighten the typings for states and state
 * selectors
 *
 * 2. TYPED SELECTORS
 *
 * To acess the state of the authentication FSM, selectors are being used
 * instead of just exposing all the state all the time via the provider.
 * This gives performance benefits -- it means components using the hooks
 * will only rerender when a selector value changes, which is important
 * for React Native in particular.
 *
 * {@link https://xstate.js.org/docs/recipes/react.html#global-state-react-context }
 *
 */

/**
 * Filter on the state ID enum to remove states internal to the FSM
 *
 * @category React
 * @internal
 */
type ExposedStateId = Exclude<
	AuthStateId,
	AuthStateId.INTERNAL__deviceSecurityCheck | AuthStateId.INTERNAL__loginFlowCheck
>;

/**
 * Filter on the state ID enum to extract states only useful when a user is Authenticated.
 *
 * @category React
 * @internal
 */
type AuthenticatedStateId = Extract<
	AuthStateId,
	| AuthStateId.Authenticated
	| AuthStateId.AuthenticatedLoggingOut
	| AuthStateId.AuthenticatedChangingPassword
	| AuthStateId.AuthenticatedPasswordChangeSuccess
	| AuthStateId.AuthenticatedValidatingPin
	| AuthStateId.AuthenticatedChangingPin
	| AuthStateId.AuthenticatedPinChangeSuccess
>;

/**
 * Mapped type to build out the object containing state selector functions.
 * It should ensure TS will error if any state exposed to users has been omitted.
 *
 * @category React
 * @internal
 */
type ExposedStateSelectorMap = {
	[K in `is${Capitalize<ExposedStateId>}`]: (state: AuthState) => boolean;
};

/**
 * Map of every state exposed to users to a match function for that state (_ie_ `true` if in state)
 *
 * @category React
 * @internal
 */
export const stateSelectors: ExposedStateSelectorMap = {
	isCheckingForSession: (state) => state.matches(AuthStateId.CheckingForSession),
	isSubmittingOtpUsername: (state) => state.matches(AuthStateId.SubmittingOtpUsername),
	isSubmittingOtp: (state) => state.matches(AuthStateId.SubmittingOtp),
	isSubmittingUsernameAndPassword: (state) =>
		state.matches(AuthStateId.SubmittingUsernameAndPassword),
	isSubmittingForceChangePassword: (state) =>
		state.matches(AuthStateId.SubmittingForceChangePassword),
	isForgottenPasswordRequestingReset: (state) =>
		state.matches(AuthStateId.ForgottenPasswordRequestingReset),
	isForgottenPasswordSubmittingReset: (state) =>
		state.matches(AuthStateId.ForgottenPasswordSubmittingReset),
	isForgottenPasswordResetSuccess: (state) =>
		state.matches(AuthStateId.ForgottenPasswordResetSuccess),
	isCheckingForPin: (state) => state.matches(AuthStateId.CheckingForPin),
	isSubmittingCurrentPin: (state) => state.matches(AuthStateId.SubmittingCurrentPin),
	isSubmittingNewPin: (state) => state.matches(AuthStateId.SubmittingNewPin),
	isForgottenPinRequestingReset: (state) => state.matches(AuthStateId.ForgottenPinRequestingReset),
	isAuthenticated: (state) => state.matches(AuthStateId.Authenticated),
	isAuthenticatedValidatingPin: (state) => state.matches(AuthStateId.AuthenticatedValidatingPin),
	isAuthenticatedChangingPin: (state) => state.matches(AuthStateId.AuthenticatedChangingPin),
	isAuthenticatedChangingPassword: (state) =>
		state.matches(AuthStateId.AuthenticatedChangingPassword),
	isAuthenticatedPasswordChangeSuccess: (state) =>
		state.matches(AuthStateId.AuthenticatedPasswordChangeSuccess),
	isAuthenticatedPinChangeSuccess: (state) =>
		state.matches(AuthStateId.AuthenticatedPinChangeSuccess),
	isAuthenticatedLoggingOut: (state) => state.matches(AuthStateId.AuthenticatedLoggingOut),
};

/**
 * Selector specifically for states only useful when a user is Authenticated.
 *
 * @category React
 * @internal
 */
export const isInStateAccessibleWhileAuthenticated = (state: AuthState): boolean => {
	return (
		state.matches<AuthenticatedStateId>(AuthStateId.Authenticated) ||
		state.matches<AuthenticatedStateId>(AuthStateId.AuthenticatedValidatingPin) ||
		state.matches<AuthenticatedStateId>(AuthStateId.AuthenticatedChangingPin) ||
		state.matches<AuthenticatedStateId>(AuthStateId.AuthenticatedPinChangeSuccess) ||
		state.matches<AuthenticatedStateId>(AuthStateId.AuthenticatedChangingPassword) ||
		state.matches<AuthenticatedStateId>(AuthStateId.AuthenticatedPasswordChangeSuccess) ||
		state.matches<AuthenticatedStateId>(AuthStateId.AuthenticatedLoggingOut)
	);
};

/**
 * Selector that returns the current state. NOTE do not overuse this: it will
 * change reqularly whilst a user is interacting with the authentication system,
 * triggering a rerender each time.
 *
 * @category React
 * @internal
 */
export const currentStateSelector = (state: AuthState): AuthState["value"] => {
	return state.value;
};

/**
 * Mapped type to build out the object containing context value access functions.
 * It should ensure that TS will error if a context value has been omitted or a
 * nonexistant key has been used.
 */
type ContextSelectorMap<S = AuthState, C = AuthContext> = Record<keyof C, (state: S) => C[keyof C]>;

/**
 * Map of every context value as a selector function.
 */
export const contextSelectors: ContextSelectorMap = {
	error: (state) => state.context.error,
	loginFlowType: (state) => state.context.loginFlowType,
	allowedOtpRetries: (state) => state.context.allowedOtpRetries,
	pinLength: (state) => state.context.pinLength,
	deviceSecurityType: (state) => state.context.deviceSecurityType,
	user: (state) => state.context.user,
	username: (state) => state.context.username,
};
