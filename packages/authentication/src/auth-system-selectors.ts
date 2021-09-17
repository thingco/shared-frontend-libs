/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AuthStateId } from "./auth-system";
import type { AuthContext, AuthState } from "./auth-system";

/* ========================================================================= *\
 * To access values (states and context) from the auth system FSM in React,
 * selectors are used. This is more verbose and requires boilerplate, but the
 * advantage is that it tightly controls what will trigger a rerender of a
 * component that relies on a given value.
 *
 * 1. UTILITY TYPES
 * 2. TYPED SELECTORS
\* ========================================================================= */

/* ========================================================================= *\
 * 1. UTILITY TYPES
 *
 * These are used to tighten the typings for states and state
 * selectors
\* ========================================================================= */

/** Filter on the state ID enum to remove states internal to the FSM */
type ExposedStateId = Exclude<
	AuthStateId,
	AuthStateId.INTERNAL__deviceSecurityCheck | AuthStateId.INTERNAL__loginFlowCheck
>;

/** Filter on the state ID enum to extract states only useful when a user is Authenticated. */
type AuthenticatedStateId = Extract<
	AuthStateId,
	| AuthStateId.Authenticated
	| AuthStateId.LoggingOut
	| AuthStateId.ChangingPassword
	| AuthStateId.ValidatingPin
	| AuthStateId.ChangingPin
>;

/* ========================================================================= *\
 * 2. TYPED SELECTORS
 *
 * To acess the state of the authentication FSM, selectors are being used
 * instead of just exposing all the state all the time via the provider.
 * This gives performance benefits -- it means components using the hooks
 * will only rerender when a selector value changes, which is important
 * for React Native in particular.
 * 
 * See https://xstate.js.org/docs/recipes/react.html#global-state-react-context
\* ========================================================================= */

/**
 * Mapped type to build out the object containing state selector functions.
 * It should ensure TS will error if any state exposed to users has been omitted.
 */
type ExposedStateSelectorMap = {
	[K in `is${Capitalize<ExposedStateId>}`]: (state: AuthState) => boolean;
};

/** Map of every state exposed to users -> match function for that state (_ie_ `true` if in state) */
// prettier-ignore
export const stateSelectors: ExposedStateSelectorMap = {
	isCheckingForSession: (state) => state.matches(AuthStateId.CheckingForSession),
	isSubmittingOtpUsername: (state) => state.matches(AuthStateId.SubmittingOtpUsername),
	isSubmittingOtp: (state) => state.matches(AuthStateId.SubmittingOtp),
	isSubmittingUsernameAndPassword: (state) => state.matches(AuthStateId.SubmittingUsernameAndPassword),
	isSubmittingForceChangePassword: (state) => state.matches(AuthStateId.SubmittingForceChangePassword),
	isChangingPassword: (state) => state.matches(AuthStateId.ChangingPassword),
	isRequestingPasswordReset: (state) => state.matches(AuthStateId.RequestingPasswordReset),
	isSubmittingPasswordReset: (state) => state.matches(AuthStateId.SubmittingPasswordReset),
  isPasswordChangedSuccess: (state) =>  state.matches(AuthStateId.PasswordChangedSuccess),
	isCheckingForPin: (state) => state.matches(AuthStateId.CheckingForPin),
	isSubmittingCurrentPin: (state) => state.matches(AuthStateId.SubmittingCurrentPin),
	isSubmittingNewPin: (state) => state.matches(AuthStateId.SubmittingNewPin),
  isValidatingPin: (state) => state.matches(AuthStateId.ValidatingPin),
	isChangingPin: (state) => state.matches(AuthStateId.ChangingPin),
	isResettingPin: (state) => state.matches(AuthStateId.ResettingPin),
	isLoggingOut: (state) => state.matches(AuthStateId.LoggingOut),
	isAuthenticated: (state) => state.matches(AuthStateId.Authenticated),
};

/** Selector specifically for states only useful when a user is Authenticated. */
export const isInStateAccessibleWhileAuthenticated = (state: AuthState): boolean => {
	return (
		state.matches<AuthenticatedStateId>(AuthStateId.Authenticated) ||
		state.matches<AuthenticatedStateId>(AuthStateId.ValidatingPin) ||
		state.matches<AuthenticatedStateId>(AuthStateId.ChangingPin) ||
		state.matches<AuthenticatedStateId>(AuthStateId.ChangingPassword) ||
		state.matches<AuthenticatedStateId>(AuthStateId.LoggingOut)
	);
};

/**
 * Selector that returns the current state. NOTE do not overuse this: it will
 * change reqularly whilst a user is interacting with the authentication system,
 * triggering a rerender each time.
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

/** Map of every context value as a selector function. */
export const contextSelectors: ContextSelectorMap = {
	error: (state) => state.context.error,
	loginFlowType: (state) => state.context.loginFlowType,
	deviceSecurityType: (state) => state.context.loginFlowType,
	user: (state) => state.context.user,
	username: (state) => state.context.username,
};
