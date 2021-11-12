import { machine, model } from "./auth-system";

import type { ContextFrom, EventFrom, InterpreterFrom, StateFrom } from "xstate";
/**
 * @module
 * Currently, XState's type inference is slightly flakey. This is for very valid reasons -- it is extremely
 * difficult to do well, so look at the issues in the XState repo + the newer version they are working on
 * + some solutions people have come up with to fix them.
 *
 * The main fix is to use the {@link https://xstate.js.org/docs/guides/models.html | `createModel`} function
 * to build out the context and events, and that in turn provides much better typings. HOWEVER, what is then lost is
 *
 * a. a typed version of the schema, _ie_ the defined states -- current advice is to type these as `any`,
 *    which is useless for inference.
 * b. events as objects -- instead the model forces you to define event creatorf functions, which are OK but now
 *    inferring the events sometimes comes back with a big nested set of generic functions instead of
 *    a plain object, which is, again, often useless and a pain to deal with (and the errors are horrible).
 *
 * To deal with this and provide a *relatively* constrained set of types that provide inference for the
 * system, I've defined:
 *
 * 1. The state names/ids as an enum. This doesn't really provide type safety, but does ensure that they
 *    can't be mis-typed in the IDE by a developer.
 * 2. The context as an interface, rather than inferring it directly from the model, and
 * 3. The events as a union type rather than using the event creator functions, and
 * 4. Type states (see {@link https://xstate.js.org/docs/guides/typescript.html#typestates })
 *
 * Of the four, only the state names/ids are exported for use by modules other than the core FSM --
 * they are needed everywhere. However, they should not ever be visible to the end-user, as the
 * React hooks that form most of the library handle the current state.
 */

/**
 * The context (internal state object) of the auth system FSM
 *
 * @internal
 */
export type InternalAuthContext = {
	/**
	 * If an OTP login flow is being used, defines how many retries are allowed before
	 * a user is bumped back to the start of the login process.
	 *
	 * @defaultValue `3`
	 */
	allowedOtpRetries: number;
	/**
	 * An error message sent to the machine in response to an API call rejection.
	 */
	error?: AuthError;
	/**
	 * @defaultValue `"NONE"`
	 */
	deviceSecurityType: DeviceSecurityType;
	/**
	 * @defaultValue `"OTP"`
	 */
	loginFlowType: LoginFlowType;
	/**
	 * If PIN device security is active, defines the length of the PIN.
	 *
	 * @defaultValue `4`
	 */
	pinLength: number;
	/**
	 * The username used to access the application.
	 *
	 * @remarks
	 * The username may be a one defined by the user, or it may be an email address,
	 * or it may be a phonenumber. It's stored in the context between some stages
	 * to allow it to be passed implicitly into states that require it rather than
	 * making the user reenter it every time (see the `sessionExpired` flag).
	 */
	username?: string;
	/**
	 * The user object returned from the external login API.
	 *
	 * @remarks
	 * This is sometimes stored in the context because several API calls that will
	 * occur *after* this object has been acquired by the system require it. In
	 * these situations, having the user object stored in context allows stages to
	 * be split out, rather than needing all logic in a single stage.
	 */
	user?: any;
	/**
	 * Whether the user is going through the login flow.
	 *
	 * @remarks
	 * This is important when get to device security: if the user has gone through
	 * the login flow, but already has a PIN set on the device, there should be no
	 * reason to ask them to enter the PIN, they are already validated. On
	 * subsequent run-throughs,  they will have a session, so will go straight to
	 * the PIN screen.
	 */
	loginCompleted: boolean;
};


/**
 * NEW lets try to reduce the events down to just basics, there are far too many
 */
export type NewInternalAuthEvent =
	| { type: "API_SUCCESS_RESPONSE"; payload?: Partial<AuthContext>; }
	| { type: "API_SUCCESS_RESPONSE_WITH_WARNING"; payload?: Partial<AuthContext>; error: AuthError; }
	| { type: "API_FAILURE_RESPONSE"; error: AuthError; }
	| { type: "CANCEL_AND_GO_BACK" }
	| { type: "CONFIRM_AND_CONTINUE" }
	| { type: "REQUEST_LOG_OUT" }
	| { type: "REQUEST_PASSWORD_CHANGE" }
	| { type: "REQUEST_PIN_CHANGE" }

/**
 * The available events to trigger state changes in the auth system FSM
 *
 * @internal
 */
export type InternalAuthEvent =
	| { type: "SESSION_PRESENT" }
	| { type: "SESSION_NOT_PRESENT" }
	| { type: "USERNAME_VALID"; username: string; user: any }
	| { type: "USERNAME_INVALID"; error: "USERNAME_INVALID" }
	| { type: "OTP_VALID" }
	| { type: "OTP_INVALID"; error: `PASSWORD_INVALID_${number}_RETRIES_REMAINING` }
	| { type: "OTP_INVALID_RETRIES_EXCEEDED"; error: "PASSWORD_RETRIES_EXCEEDED" }
	| { type: "USERNAME_AND_PASSWORD_VALID"; username: string; user: any }
	| {
			type: "USERNAME_AND_PASSWORD_VALID_PASSWORD_CHANGE_REQUIRED";
			user: any;
			username: string;
			error: "PASSWORD_CHANGE_REQUIRED";
	  }
	| { type: "USERNAME_AND_PASSWORD_INVALID"; error: "USERNAME_AND_PASSWORD_INVALID" }
	| { type: "GO_BACK" }
	| { type: "FORGOTTEN_PASSWORD" }
	| { type: "PASSWORD_CHANGE_SUCCESS" }
	| { type: "PASSWORD_CHANGE_FAILURE"; error: "PASSWORD_CHANGE_FAILURE" }
	| { type: "CANCEL_PASSWORD_CHANGE" }
	| { type: "PASSWORD_RESET_REQUEST_SUCCESS"; username: string }
	| { type: "CANCEL_PASSWORD_CHANGE" }
	| { type: "CONFIRM_PASSWORD_RESET" }
	| { type: "CONFIRM_PASSWORD_CHANGE" }
	| { type: "PASSWORD_RESET_REQUEST_FAILURE"; error: "PASSWORD_RESET_REQUEST_FAILURE" }
	| { type: "PASSWORD_RESET_SUCCESS" }
	| { type: "PASSWORD_RESET_FAILURE"; error: "PASSWORD_RESET_FAILURE" }
	| { type: "LOG_OUT_SUCCESS" }
	| { type: "LOG_OUT_FAILURE"; error: "LOG_OUT_FAILURE" }
	| { type: "CANCEL_LOG_OUT" }
	| { type: "REQUEST_LOG_OUT" }
	| { type: "REQUEST_PASSWORD_CHANGE" }
	| { type: "PIN_IS_SET_UP" }
	| { type: "PIN_IS_NOT_SET_UP" }
	| { type: "PIN_VALID" }
	| { type: "PIN_INVALID"; error: "PIN_INVALID" }
	| { type: "NEW_PIN_VALID" }
	| { type: "NEW_PIN_INVALID"; error: "NEW_PIN_INVALID" }
	| { type: "PIN_CHANGE_SUCCESS" }
	| { type: "CONFIRM_PIN_CHANGE" }
	| { type: "PIN_CHANGE_FAILURE"; error: "PIN_CHANGE_FAILURE" }
	| { type: "CANCEL_PIN_CHANGE" }
	| { type: "REQUEST_PIN_RESET" }
	| { type: "PIN_RESET_SUCCESS" }
	| { type: "PIN_RESET_FAILURE"; error: "PIN_RESET_FAILURE" }
	| { type: "CANCEL_PIN_RESET" }
	| { type: "REQUEST_PIN_CHANGE" };

/**
 * The core strategy used for authentication against the external
 * authentication APIs. The first layer of the authentication system.
 */
export type LoginFlowType = "OTP" | "USERNAME_PASSWORD";

/**
 * The device-specific security type used as the second
 * layer of the authentication system.
 */
export type DeviceSecurityType = "PIN" | "BIOMETRIC" | "NONE";

/**
 * The available API-level errors returned on request failure.
 * These are different from the UI-level validation errors. They
 * should be mapped to translation strings when implemented in-app.
 * Only one of these can appear at any one time, and they indicate
 * a terminal error of some kind for the given state the user is in.
 *
 * @remarks
 * These would be better as enums if it weren't for the "${number}_RETRIES"
 * dynamic error. They need reveiw, and the naming needs to be clearer:
 * the names are far too similar, and it is too easy to apply the wrong one.
 */
export type AuthError =
	| "USERNAME_INVALID"
	| "PASSWORD_CHANGE_FAILURE"
	| "PASSWORD_CHANGE_REQUIRED"
	| "PASSWORD_FORGOTTEN_CODE_INVALID"
	| "PASSWORD_INVALID"
	| `PASSWORD_INVALID_${number}_RETRIES_REMAINING`
	| "PASSWORD_RESET_FAILURE"
	| "PASSWORD_RESET_REQUEST_FAILURE"
	| "PASSWORD_RETRIES_EXCEEDED"
	| "PIN_INVALID"
	| "NEW_PIN_INVALID"
	| "PIN_CHANGE_FAILURE"
	| "PIN_RESET_FAILURE"
	| "NEW_PIN_INVALID"
	| "USERNAME_AND_PASSWORD_INVALID"
	| "LOG_OUT_FAILURE";

/**
 * The configuration for the factory function used to construct
 * the auth system. This is also used in the React provider component
 * (and any similar components) to define the shape of the props to
 * pass into it.
 */
export type AuthConfig = {
	allowedOtpRetries?: number;
	deviceSecurityType?: DeviceSecurityType;
	loginFlowType?: LoginFlowType;
	pinLength?: number;
};

/**
 * The fully fleshed-out type of the FSM itself, an XState `StateMachine` type with the
 * generic arguments populated.
 */
export type AuthMachine = typeof machine;

/**
 * The machine is *interpreted* when a running instance of it is created -- this is done for
 * the model tests, but more importantly it is what is stored in the React Provider component's
 * `value` prop, and accessed by all the hooks. This is the fully fleshed-out version of
 * XState's `Interpreter` type with the generic arguments populated.
 */
export type AuthInterpreter = InterpreterFrom<AuthMachine>;

/**
 * When interpreted, XState constructs all possible states (each one keyed by one of the AuthStateId
 * defined at the top of this file). This way, it never changes -- when using the state machine,
 * an end user is just following paths to different properties defined on a static object.
 *
 * `AuthState` is a union type of all the constructed state nodes.
 */
export type AuthState = StateFrom<AuthMachine>;

/**
 * The model for the machine. This is then used to infer types and provides much better inference than
 * using the AuthMachine-based types directly for Context and for Events.
 */
type AuthModel = typeof model;

/**
 * NOTE: Using the model to infer the context rather than just using the `InternalAuthContext` defined
 * at the top of this file seems to drastically improve type inference.
 */
export type AuthContext = ContextFrom<AuthModel>;

/**
 * NOTE: Using the model to infer the [union type of] events rather than just using the
 * `InternalAuthEvent` defined at the top of this file seems to drastically improve type inference.
 */
export type AuthEvent = EventFrom<AuthModel>;
