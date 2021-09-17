import { createMachine, StateFrom } from "xstate";
import { createModel } from "xstate/lib/model";

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ContextFrom, EventFrom, InterpreterFrom } from "xstate";
import type { AuthConfig, AuthError, DeviceSecurityType, LoginFlowType } from "./types";

/* ------------------------------------------------------------------------------------------------------ *\
 * CORE TYPES
 * ------------------------------------------------------------------------------------------------------
 *
 * Currently, XState's type inference is slightly flakey. This is for very valid reasons -- it is extremely
 * difficult to do well, so look at the issues in the XState repo + the newer version they are working on
 * + some solutions people have come up with to fix them.
 * 
 * The main fix is to use the `createModel` function to build out the context and events, and that
 * in turn provides much better typings. HOWEVER, what is then lost is
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
 * 4. Type states (see https://xstate.js.org/docs/guides/typescript.html#typestates)
 * 
 * Only the state names/ids are exported for use by other modules in the library -- they are needed
 * everywhere. However, they should not ever be visible to the end-user, as the React hooks that form
 * the core part of the library handle the current state.
\* ------------------------------------------------------------------------------------------------------ */

/**
 * The available states of the auth system FSM
 */
export enum AuthStateId {
	CheckingForSession = "CheckingForSession",
	INTERNAL__loginFlowCheck = "INTERNAL__loginFlowCheck",
	SubmittingOtpUsername = "SubmittingOtpUsername",
	SubmittingOtp = "SubmittingOtp",
	SubmittingUsernameAndPassword = "SubmittingUsernameAndPassword",
	SubmittingForceChangePassword = "SubmittingForceChangePassword",
	ChangingPassword = "ChangingPassword",
	RequestingPasswordReset = "RequestingPasswordReset",
	SubmittingPasswordReset = "SubmittingPasswordReset",
	INTERNAL__deviceSecurityCheck = "INTERNAL__deviceSecurityCheck",
	CheckingForPin = "CheckingForPin",
	SubmittingCurrentPin = "SubmittingCurrentPin",
	ResettingPin = "ResettingPin",
	SubmittingNewPin = "SubmittingNewPin",
	ValidatingPin = "ValidatingPin",
	ChangingPin = "ChangingPin",
	LoggingOut = "LoggingOut",
	Authenticated = "Authenticated",
	PasswordChangedSuccess = "PasswordChangedSuccess",
}

/**
 * The context (internal state object) of the auth system FSM
 */
type InternalAuthContext = {
	error?: AuthError;
	loginFlowType: LoginFlowType;
	deviceSecurityType: DeviceSecurityType;
	username?: string;
	user?: any;
};

/**
 * The available events to trigger state changes in the auth system FSM
 */
type InternalAuthEvent =
	| { type: "SESSION_PRESENT" }
	| { type: "SESSION_NOT_PRESENT" }
	| { type: "USERNAME_VALID"; username: string; user: any }
	// REVIEW: WHY is it invalid?
	| { type: "USERNAME_INVALID"; error: "USERNAME_INVALID" }
	| { type: "OTP_VALID" }
	// REVIEW: WHY is it invalid?
	| { type: "OTP_INVALID"; error: `PASSWORD_INVALID_${number}_RETRIES_REMAINING` }
	| { type: "OTP_INVALID_RETRIES_EXCEEDED"; error: "PASSWORD_RETRIES_EXCEEDED" }
	// REVIEW: unecessary? We're authorised past this point, don't need the `user` but `username` might be useful:
	| { type: "USERNAME_AND_PASSWORD_VALID"; username: string; user: any }
	| {
			type: "USERNAME_AND_PASSWORD_VALID_PASSWORD_CHANGE_REQUIRED";
			user: any;
			username: string;
			error: "PASSWORD_CHANGE_REQUIRED";
	  }
	// REVIEW: WHICH ONE is invalid?
	| { type: "USERNAME_AND_PASSWORD_INVALID"; error: "USERNAME_AND_PASSWORD_INVALID" }
	| { type: "GO_BACK" }
	| { type: "FORGOTTEN_PASSWORD" }
	| { type: "PASSWORD_CHANGE_SUCCESS" }
	// REVIEW: WHY did it fail?
	| { type: "PASSWORD_CHANGE_FAILURE"; error: "PASSWORD_CHANGE_FAILURE" }
	| { type: "CANCEL_PASSWORD_CHANGE" }
	| { type: "PASSWORD_RESET_REQUEST_SUCCESS"; username: string }
	| { type: "CANCEL_PASSWORD_CHANGE" }
	| { type: "CONFIRM_PASSWORD_RESET" }
	| { type: "CONFIRM_PASSWORD_CHANGE" }
	// REVIEW: WHY did it fail?
	| { type: "PASSWORD_RESET_REQUEST_FAILURE"; error: "PASSWORD_RESET_REQUEST_FAILURE" }
	| { type: "PASSWORD_RESET_SUCCESS" }
	// REVIEW: WHY did it fail?
	| { type: "PASSWORD_RESET_FAILURE"; error: "PASSWORD_RESET_FAILURE" }
	| { type: "LOG_OUT_SUCCESS" }
	// REVIEW: WHY did it fail?
	| { type: "LOG_OUT_FAILURE"; error: "LOG_OUT_FAILURE" }
	| { type: "CANCEL_LOG_OUT" }
	| { type: "REQUEST_LOG_OUT" }
	| { type: "REQUEST_PASSWORD_CHANGE" }
	| { type: "PIN_IS_SET_UP" }
	| { type: "PIN_IS_NOT_SET_UP" }
	| { type: "PIN_VALID" }
	// REVIEW: WHY is it invalid?
	| { type: "PIN_INVALID"; error: "PIN_INVALID" }
	| { type: "NEW_PIN_VALID" }
	// REVIEW: WHY is it invalid?
	| { type: "NEW_PIN_INVALID"; error: "NEW_PIN_INVALID" }
	| { type: "PIN_CHANGE_SUCCESS" }
	// REVIEW: WHY did it fail?
	| { type: "PIN_CHANGE_FAILURE"; error: "PIN_CHANGE_FAILURE" }
	| { type: "CANCEL_PIN_CHANGE" }
	| { type: "REQUEST_PIN_RESET" }
	| { type: "PIN_RESET_SUCCESS" }
	| { type: "PIN_RESET_FAILURE"; error: "PIN_RESET_FAILURE" }
	| { type: "CANCEL_PIN_RESET" }
	| { type: "REQUEST_PIN_CHANGE" };

/**
 * The type states for the auth system FSM: these specify what the context should look like for each state
 */
// prettier-ignore
type InternalAuthTypeState =
	| { value: AuthStateId.CheckingForSession; context: InternalAuthContext }
	| { value: AuthStateId.SubmittingOtpUsername; context: InternalAuthContext }
	| { value: AuthStateId.SubmittingOtp; context: InternalAuthContext & { user: any; username: string } }
	| { value: AuthStateId.SubmittingUsernameAndPassword; context: InternalAuthContext }
	| {	value: AuthStateId.SubmittingForceChangePassword; context: InternalAuthContext & { user: any; username: string; error: AuthError } }
	| { value: AuthStateId.ChangingPassword; context: InternalAuthContext & { username: string } }
	| { value: AuthStateId.RequestingPasswordReset; context: InternalAuthContext }
	| { value: AuthStateId.SubmittingPasswordReset; context: InternalAuthContext & { username: string } }
  | { value: AuthStateId.PasswordChangedSuccess; context: InternalAuthContext }
	| { value: AuthStateId.CheckingForPin; context: InternalAuthContext & { username?: string } }
	| { value: AuthStateId.SubmittingCurrentPin; context: InternalAuthContext & { username?: string } }
	| { value: AuthStateId.ResettingPin; context: InternalAuthContext }
	| { value: AuthStateId.SubmittingNewPin; context: InternalAuthContext & { username?: string } }
  | { value: AuthStateId.ValidatingPin; context: InternalAuthContext & { username?: string } }
	| { value: AuthStateId.ChangingPin; context: InternalAuthContext & { username?: string } }
	| { value: AuthStateId.LoggingOut; context: InternalAuthContext & { username?: string; } }
	| { value: AuthStateId.Authenticated; context: InternalAuthContext & { username?: string; } };

/* ------------------------------------------------------------------------------------------------------ *\
 * SYSTEM MODEL/FSM
 * ------------------------------------------------------------------------------------------------------
 * Internal to the library (functionality is exposed via the React interface), but the actual core
 * of the entire system.
\* ------------------------------------------------------------------------------------------------------ */

/**
 * By using XState's `createModel` function, we get most of the type inference for free
 */
const model = createModel<InternalAuthContext, InternalAuthEvent>({
	loginFlowType: "OTP",
	deviceSecurityType: "NONE",
});

/**
 * XState uses a serialisable object for defining the FSM. To allow it to be serialisable, anything
 * that requires concrete functions to work (actions, guards *etc.*) is aliased under a string key
 * within that object. Then the `createMachine` function accepts a second object with the implementations
 * for those aliases.
 */
const implementations = {
	// prettier-ignore
	guards: {
		isOtpLoginFlow: (ctx: InternalAuthContext) => ctx.loginFlowType === "OTP",
		isUsernamePasswordLoginFlow: (ctx: InternalAuthContext) => ctx.loginFlowType === "USERNAME_PASSWORD",
		isDeviceSecurityTypeNone: (ctx: InternalAuthContext) => ctx.deviceSecurityType === "NONE",
		isDeviceSecurityTypePin: (ctx: InternalAuthContext) => ctx.deviceSecurityType === "PIN",
		isDeviceSecurityTypeBiometric: (ctx: InternalAuthContext) => ctx.deviceSecurityType === "BIOMETRIC",
	},
	// prettier-ignore
	actions: {
		assignError: model.assign((_, e) => {
			if ("error" in e) {
				return { error: e.error };
			}
			return {}
		}),
		assignUser: model.assign((_, e) => {
			if (e.type === "USERNAME_VALID" || e.type === "USERNAME_AND_PASSWORD_VALID" || e.type === "USERNAME_AND_PASSWORD_VALID_PASSWORD_CHANGE_REQUIRED") {
				return { user: e.user };
			}
			return {};
		}),
		assignUsername: model.assign((_, e) => {
			if (e.type === "USERNAME_VALID" || e.type === "USERNAME_AND_PASSWORD_VALID" || e.type === "USERNAME_AND_PASSWORD_VALID_PASSWORD_CHANGE_REQUIRED" || e.type === "PASSWORD_RESET_REQUEST_SUCCESS") {
				return { username: e.username };
			}
			return {};
		}),
		clearError: model.assign({ error: undefined }),
		clearUser: model.assign({ user: undefined }),
		clearUsername: model.assign({ username: undefined }),
	},
};

/**
 * The actual machine. Inference is still not perfect due to usage of string keys for all aliased
 * implementations, but by using the core types defined above we get most of the way there.
 *
 * NOTE that this is exported for internal test usage, but is not exposed to end-users of the library.
 */
export const machine = createMachine<
	typeof model,
	InternalAuthContext,
	InternalAuthEvent,
	InternalAuthTypeState
>(
	{
		id: "authSystem",
		initial: AuthStateId.CheckingForSession,
		context: model.initialContext,
		// prettier-ignore
		states: {
		[AuthStateId.CheckingForSession]: {
			on: {
				SESSION_PRESENT: AuthStateId.INTERNAL__deviceSecurityCheck,
				SESSION_NOT_PRESENT: AuthStateId.INTERNAL__loginFlowCheck,
			},
		},
		[AuthStateId.INTERNAL__loginFlowCheck]: {
			entry: ["clearError"],
			always: [
				{ cond: "isOtpLoginFlow", target: AuthStateId.SubmittingOtpUsername },
				{ cond: "isUsernamePasswordLoginFlow", target: AuthStateId.SubmittingUsernameAndPassword },
			],
		},
		[AuthStateId.SubmittingOtpUsername]: {
			on: {
				USERNAME_VALID: {
					target: AuthStateId.SubmittingOtp,
					actions: ["assignUser", "assignUsername", "clearError"],
				},
				USERNAME_INVALID: {
					target: undefined,
					actions: ["assignError"]
				}
			},
		},
		[AuthStateId.SubmittingOtp]: {
			on: {
				OTP_VALID: {
					target: AuthStateId.INTERNAL__deviceSecurityCheck,
					actions: ["clearError"],
				},
				OTP_INVALID: {
					target: AuthStateId.SubmittingOtp,
					actions: ["assignError"]
				},
				OTP_INVALID_RETRIES_EXCEEDED: {
					target: AuthStateId.SubmittingOtpUsername,
					actions: ["assignError"]
				},
				GO_BACK: {
					target: AuthStateId.SubmittingOtpUsername,
					// Going to start again, so don't want these hanging around:
					actions: ["clearError", "clearUser", "clearUsername"],
				}
			},
		},
		[AuthStateId.SubmittingUsernameAndPassword]: {
			on: {
				USERNAME_AND_PASSWORD_VALID: {
					target: AuthStateId.INTERNAL__deviceSecurityCheck,
					// REVEIW: unecessary? We're authorised past this point, don't need the `user` but `username` might be useful:
					// actions: ["assignUser", "assignUsername"]
					actions: ["clearError"],
				},
				USERNAME_AND_PASSWORD_VALID_PASSWORD_CHANGE_REQUIRED: {
					target: AuthStateId.SubmittingForceChangePassword,
					actions: ["assignError", "assignUser", "assignUsername"],
				},
				USERNAME_AND_PASSWORD_INVALID: {
					target: undefined,
					actions: ["assignError"]
				},
				FORGOTTEN_PASSWORD: {
					target: AuthStateId.RequestingPasswordReset,
					actions: ["clearError"],
				},
			}
		},
		[AuthStateId.SubmittingForceChangePassword]: {
			on: {
				PASSWORD_CHANGE_SUCCESS: {
					target: AuthStateId.INTERNAL__deviceSecurityCheck,
					actions: ["clearError"],
				},
				PASSWORD_CHANGE_FAILURE: {
					target: undefined,
					actions: ["assignError"]
				},
			}
		},
		[AuthStateId.RequestingPasswordReset]: {
			on: {
				PASSWORD_RESET_REQUEST_SUCCESS: {
					target: AuthStateId.SubmittingPasswordReset,
					actions: ["clearError", "assignUsername"],
				},
				PASSWORD_RESET_REQUEST_FAILURE: {
					target: AuthStateId.SubmittingUsernameAndPassword,
					actions: ["assignError"]
				},
				GO_BACK: {
					target: AuthStateId.SubmittingUsernameAndPassword,
					actions: ["clearError"],
				},
			}
		},
		[AuthStateId.SubmittingPasswordReset]: {
			on: {
				PASSWORD_RESET_SUCCESS: {
					target: AuthStateId.INTERNAL__deviceSecurityCheck,
					actions: ["clearError"],
				},
				// TODO will get stuck here, need to figure out how best to handle this:
				PASSWORD_RESET_FAILURE: {
					target: undefined,
					actions: ["assignError"]
				},
			}
		},
		[AuthStateId.ChangingPassword]: {
			on: {
				PASSWORD_CHANGE_SUCCESS: {
					target: AuthStateId.Authenticated,
					actions: ["clearError"],
				},
				// TODO will get stuck here, need to figure out how best to handle this:
				PASSWORD_CHANGE_FAILURE: {
					target: undefined,
					actions: ["assignError"]
				},
				CANCEL_PASSWORD_CHANGE: AuthStateId.Authenticated,
			}
		},
    [AuthStateId.PasswordChangedSuccess]: {
			on: {
				CONFIRM_PASSWORD_RESET: {
          target: AuthStateId.SubmittingUsernameAndPassword,
          actions: ["clearUsername"],
        },
				CONFIRM_PASSWORD_CHANGE: AuthStateId.Authenticated,
			}
		},
		[AuthStateId.INTERNAL__deviceSecurityCheck]: {
			entry: ["clearError"],
			always: [
				{ cond: "isDeviceSecurityTypeNone", target: AuthStateId.Authenticated },
				{ cond: "isDeviceSecurityTypePin", target: AuthStateId.CheckingForPin },
				// { cond: "isDeviceSecurityTypeBiometric", target: AuthStateId.Authenticated },
			],	
		},
		[AuthStateId.CheckingForPin]: {
			on: {
				PIN_IS_SET_UP: AuthStateId.SubmittingCurrentPin,
				PIN_IS_NOT_SET_UP: AuthStateId.SubmittingNewPin,
			}
		},
		[AuthStateId.SubmittingCurrentPin]: {
			on: {
				PIN_VALID: {
					target: AuthStateId.Authenticated,
					actions: ["clearError"],
				},
				PIN_INVALID: {
					target: undefined,
					actions: ["assignError"]
				},
				REQUEST_PIN_RESET: {
					target: AuthStateId.ResettingPin,
					actions: ["clearError"]
				}
			}
		},
		[AuthStateId.ResettingPin]: {
			on: {
				PIN_RESET_SUCCESS: {
					target: AuthStateId.CheckingForSession,
					actions: ["clearError"],
				},
				PIN_RESET_FAILURE: {
					target: undefined,
					actions: ["assignError"],
				},
				CANCEL_PIN_RESET: {
					target: AuthStateId.SubmittingCurrentPin,
					actions: ["clearError"],
				},
			}
		},
		[AuthStateId.SubmittingNewPin]: {
			on: {
				NEW_PIN_VALID: {
					target: AuthStateId.Authenticated,
					actions: ["clearError"],
				},
				NEW_PIN_INVALID: {
					target: undefined,
					actions: ["assignError"]
				},
			}	
		},
    [AuthStateId.ValidatingPin]: {
			on: {
				PIN_VALID: {
					target: AuthStateId.ChangingPin,
					actions: ["clearError"],
				},
				PIN_INVALID: {
					target: undefined,
					actions: ["assignError"]
				}
			}
		},
		[AuthStateId.ChangingPin]: {
			on: {
				PIN_CHANGE_SUCCESS: {
					target:AuthStateId.Authenticated,
					actions: ["clearError"],
				},
				PIN_CHANGE_FAILURE: {
					target: undefined,
					actions: ["assignError"]
				},
				CANCEL_PIN_CHANGE: {
					target: AuthStateId.Authenticated,
					actions: ["clearError"]
				}
			}
		},
		[AuthStateId.LoggingOut]: {
			on: {
				LOG_OUT_SUCCESS: AuthStateId.CheckingForSession,
				LOG_OUT_FAILURE: {
					target: undefined,
					actions: ["assignError"]
				},
				CANCEL_LOG_OUT: AuthStateId.Authenticated
			}
		},
		[AuthStateId.Authenticated]: {
			entry: ["clearError"],
			on: {
				REQUEST_LOG_OUT: AuthStateId.LoggingOut,
				REQUEST_PIN_CHANGE: AuthStateId.ValidatingPin,
				REQUEST_PASSWORD_CHANGE: AuthStateId.ChangingPassword,
			}
		},
	},
	},
	implementations
);

/* ------------------------------------------------------------------------------------------------------ *\
 * EXPORTS
 * ------------------------------------------------------------------------------------------------------
 * Once all the above has been set up, the exports can be built. The types, by being based on the model,
 * provide a fair level of inference. The actual FSM is created via a factory function to allow injection
 * of build-time config values.
\* ------------------------------------------------------------------------------------------------------ */

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

/**
 * Factory function for constructing a configured auth system FSM.
 *
 * @param config - the build-time config to be passed into the machine prior to instantiation.
 * @returns - the configured auth system
 */
export function createAuthenticationSystem({
	loginFlowType = "OTP",
	deviceSecurityType = "NONE",
}: AuthConfig = {}): AuthMachine {
	return machine.withContext({ loginFlowType, deviceSecurityType });
}
