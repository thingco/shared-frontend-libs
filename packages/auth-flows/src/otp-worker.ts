import { createMachine, sendParent } from "xstate";
import { createModel } from "xstate/lib/model";

import { OTPService } from "./otp-service";

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ModelContextFrom } from "xstate/lib/model";
import type { SessionCheckBehaviour } from "./types";

const model = createModel(
	{
		userdata: {} as any,
		username: "",
		password: "",
		sessionCheckBehaviour: "normal" as SessionCheckBehaviour,
		triesRemaining: 3,
	},
	{
		events: {
			LOG_OUT: () => ({}),
			RESEND_PASSWORD: () => ({}),
			CHECK_FOR_SESSION: (sessionCheckBehaviour: SessionCheckBehaviour) => ({
				sessionCheckBehaviour,
			}),
			SUBMIT_USERNAME: (username: string) => ({ username }),
			SUBMIT_PASSWORD: (password: string) => ({ password }),
			"done.invoke.requestOtp": (data: any) => ({ data }),
			GO_BACK: () => ({}),
		},
	}
);

/**
 * Why is this separated from the `createModel` function? Because TS goes crazy if it's passed in
 * directly as the second argument.
 *
 * See this comment on an XState issue thread: https://github.com/davidkpiano/xstate/issues/2338#issuecomment-867993878
 *
 * Assorted typing issues:
 * - context is not inferred for the functions in the `services`
 * - _in theory_, type hints can be provided directly to the `actions` block's `assign` functions
 *   as their second argument. This doesn't work, so need to narrow the type via checks on the `event`
 *   argument.
 */
const implementations = {
	services: {
		requestOtp: (ctx: ModelContextFrom<typeof model>) => {
			throw new Error("No implementation for requestOtp method");
		},
		checkForExtantSession: (ctx: ModelContextFrom<typeof model>) => {
			throw new Error("No implementation for checkForExtantSession method");
		},
		validateOtp: (ctx: ModelContextFrom<typeof model>) => {
			throw new Error("No implementation for validateOtp method");
		},
		logOut: () => {
			throw new Error("No implementation for logOut method");
		},
	},
	actions: {
		assignUsernameToContext: model.assign((_, e) => {
			if (e.type !== "SUBMIT_USERNAME") return {};
			return { username: e.username };
		}),
		assignPasswordToContext: model.assign((_, e) => {
			if (e.type !== "SUBMIT_PASSWORD") return {};
			return { password: e.password };
		}),
		assignSessionCheckBehaviourToContext: model.assign((_, e) => {
			if (e.type !== "CHECK_FOR_SESSION") return {};
			return { sessionCheckBehaviour: e.sessionCheckBehaviour };
		}),
		// The userdata object is whatever comes back from the service provider on sign-in.
		// It has to be stored to allow it to be passed into the OTP submission (OTP is
		// a two-step process requiring two requests)
		assignUserdataToContext: model.assign((_, e) => {
			if (e.type !== "done.invoke.requestOtp") return {};
			return { userdata: e.data };
		}),
		clearPasswordFromContext: model.assign({ password: "" }),
		clearUserdataFromContext: model.assign({ userdata: "" }),
		clearUsernameFromContext: model.assign({ username: "" }),
		// Keep in touch with yr parents
		notifyRequestStarted: sendParent("ASYNC_REQUEST_PENDING"),
		notifyRequestComplete: sendParent("ASYNC_REQUEST_SETTLED"),
		requestPassword: sendParent("REQUEST_PASSWORD"),
		requestUsername: sendParent("REQUEST_USERNAME"),
		notifyAuthFlowComplete: sendParent("AUTH_FLOW_COMPLETE"),
		notifyLoggedOut: sendParent("LOGGED_OUT"),
	},
};

const machine = createMachine<typeof model>(
	{
		id: "otpService",
		context: model.initialContext,
		initial: "checkingSession",
		states: {
			// Check the session. Is it present? Can we jump straight past the login?
			checkingSession: {
				on: {
					CHECK_FOR_SESSION: {
						target: "validatingSession",
						actions: "assignSessionCheckBehaviourToContext",
					},
				},
			},
			validatingSession: {
				entry: "notifyRequestStarted",
				invoke: {
					id: "checkForExtantSession",
					src: "checkForExtantSession",
					// If the session check resolves, then there is an active session;
					// go straight to checking device-level security.
					onDone: {
						target: "authComplete",
					},
					// If the session check errors/rejects, there is no active session:
					// go to the initial input screen for whichever login flow is being used.
					onError: {
						target: "awaitingRequestForOtp",
					},
				},
				exit: "notifyRequestComplete",
			},
			// OTP is split into two stages -- the user must first request an OTP by
			// submitting their email/phonenumber...
			awaitingRequestForOtp: {
				entry: "requestUsername",
				on: {
					SUBMIT_USERNAME: {
						actions: "assignUsernameToContext",
						target: "requestingOtp",
					},
				},
			},
			requestingOtp: {
				entry: "notifyRequestStarted",
				invoke: {
					id: "requestOtp",
					src: "requestOtp",
					onDone: {
						actions: "assignUserdataToContext",
						target: "awaitingOtpInput",
					},
					onError: "awaitingRequestForOtp",
				},
				exit: "notifyRequestComplete",
			},
			// ...then once they've received that, they need to submit the OTP.
			awaitingOtpInput: {
				entry: "requestPassword",
				on: {
					RESEND_PASSWORD: {
						target: "requestingOtp",
					},
					SUBMIT_PASSWORD: {
						actions: "assignPasswordToContext",
						target: "validatingOtp",
					},
					GO_BACK: {
						target: "awaitingRequestForOtp",
					},
				},
			},
			validatingOtp: {
				entry: "notifyRequestStarted",
				invoke: {
					id: "validateOtp",
					src: "validateOtp",
					onDone: {
						target: "authComplete",
					},
					onError: "awaitingOtpInput",
				},
				exit: ["notifyRequestComplete", "clearPasswordFromContext"],
			},
			loggingOut: {
				entry: "notifyRequestStarted",
				invoke: {
					id: "logOut",
					src: "logOut",
					onDone: {
						target: "validatingSession",
					},
				},
				exit: ["notifyRequestComplete", "notifyLoggedOut"],
			},
			authComplete: {
				entry: ["clearUserdataFromContext", "clearUsernameFromContext", "notifyAuthFlowComplete"],
				on: {
					LOG_OUT: "loggingOut",
				},
			},
		},
	},
	implementations
);

export function createOtpWorker<User>(serviceApi: OTPService<User>) {
	return machine.withConfig({
		services: {
			requestOtp: (ctx: ModelContextFrom<typeof model>) => serviceApi.requestOtp(ctx.username),
			checkForExtantSession: (ctx: ModelContextFrom<typeof model>) =>
				serviceApi.checkForExtantSession(ctx.sessionCheckBehaviour),
			validateOtp: (ctx: ModelContextFrom<typeof model>) =>
				serviceApi.validateOtp(ctx.userdata, ctx.password, ctx.triesRemaining),
			logOut: () => serviceApi.logOut(),
		},
	});
}
