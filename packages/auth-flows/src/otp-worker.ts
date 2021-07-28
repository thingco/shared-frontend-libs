/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendParent } from "xstate";
import { createModel } from "xstate/lib/model";

import { ServiceError } from "./errors";

import type { StateMachine } from "xstate";
import type { ModelContextFrom, ModelEventsFrom } from "xstate/lib/model";
import type { OTPService, SessionCheckBehaviour } from "./types";
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
			WORKER_AUTH_FLOW_COMPLETE: () => ({}),
			WORKER_LOGGED_OUT: () => ({}),
			WORKER_ASYNC_REQUEST_SETTLED: () => ({}),
			WORKER_ASYNC_REQUEST_PENDING: () => ({}),
			WORKER_REQUIRES_PASSWORD: () => ({}),
			WORKER_REQUIRES_USERNAME: () => ({}),
			SUBMIT_USERNAME: (username: string) => ({ username }),
			SUBMIT_PASSWORD: (password: string) => ({ password }),
			"done.invoke.requestOtp": (data: any) => ({ data }),
			GO_BACK: () => ({}),
		},
	}
);

type ModelCtx = ModelContextFrom<typeof model>;
type ModelEvt = ModelEventsFrom<typeof model>;

const implementations = {
	preserveActionOrder: true,
	services: {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		requestOtp: (_c: ModelCtx, _e: ModelEvt) => {
			throw new ServiceError("No implementation for requestOtp method");
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		checkForExtantSession: (_c: ModelCtx, _e: ModelEvt) => {
			throw new ServiceError("No implementation for checkForExtantSession method");
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		validateOtp: (_c: ModelCtx, _e: ModelEvt) => {
			throw new ServiceError("No implementation for validateOtp method");
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		logOut: (_c: ModelCtx, _e: ModelEvt) => {
			throw new ServiceError("No implementation for logOut method");
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
		notifyAuthFlowComplete: sendParent(model.events.WORKER_AUTH_FLOW_COMPLETE),
		notifyLoggedOut: sendParent(model.events.WORKER_LOGGED_OUT),
		notifyRequestComplete: sendParent(model.events.WORKER_ASYNC_REQUEST_SETTLED),
		notifyRequestStarted: sendParent(model.events.WORKER_ASYNC_REQUEST_PENDING),
		requestPassword: sendParent(model.events.WORKER_REQUIRES_PASSWORD),
		requestUsername: sendParent(model.events.WORKER_REQUIRES_USERNAME),
	},
};

const machine = model.createMachine(
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

export function createOtpWorker<User>(
	serviceApi: OTPService<User>
): StateMachine<ModelCtx, any, ModelEvt> {
	console.log("Initialising OTP service worker machine...");
	return machine.withConfig({
		services: {
			requestOtp: (ctx: ModelCtx) => serviceApi.requestOtp(ctx.username),
			checkForExtantSession: (ctx: ModelCtx) =>
				serviceApi.checkForExtantSession(ctx.sessionCheckBehaviour),
			validateOtp: (ctx: ModelCtx) =>
				serviceApi.validateOtp(ctx.userdata, ctx.password, ctx.triesRemaining),
			logOut: () => serviceApi.logOut(),
		},
	});
}
