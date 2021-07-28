/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendParent } from "xstate";
import { createModel } from "xstate/lib/model";

import { ServiceError } from "./errors";

import type { StateMachine } from "xstate";
import type { ModelContextFrom, ModelEventsFrom } from "xstate/lib/model";
import type { SessionCheckBehaviour, UsernamePasswordService } from "./types";

const model = createModel(
	{
		username: "",
		password: "",
		sessionCheckBehaviour: "normal" as SessionCheckBehaviour,
	},
	{
		events: {
			LOG_OUT: () => ({}),
			CHECK_FOR_SESSION: (sessionCheckBehaviour: SessionCheckBehaviour = "normal") => ({
				sessionCheckBehaviour,
			}),
			SUBMIT_USERNAME_AND_PASSWORD: (username: string, password: string) => ({
				username,
				password,
			}),
			WORKER_AUTH_FLOW_COMPLETE: () => ({}),
			WORKER_LOGGED_OUT: () => ({}),
			WORKER_ASYNC_REQUEST_SETTLED: () => ({}),
			WORKER_ASYNC_REQUEST_PENDING: () => ({}),
			WORKER_REQUIRES_USERNAME_AND_PASSWORD: () => ({}),
		},
	}
);

type ModelCtx = ModelContextFrom<typeof model>;
type ModelEvt = ModelEventsFrom<typeof model>;

const implementations = {
	preserveActionOrder: true,
	services: {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		checkForExtantSession: (_c: ModelCtx, _e: ModelEvt) => {
			throw new ServiceError("No implementation for checkExtantSession method");
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		logOut: (_c: ModelCtx, _e: ModelEvt) => {
			throw new ServiceError("No implementation for logOut method");
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		validateUsernameAndPassword: (_c: ModelCtx, _e: ModelEvt) => {
			throw new ServiceError("No implementation for validateUsernameAndPassword method");
		},
	},
	actions: {
		assignUsernameAndPasswordToContext: model.assign((_, e) => {
			if (e.type !== "SUBMIT_USERNAME_AND_PASSWORD") return {};
			return { username: e.username, password: e.password };
		}),
		assignSessionCheckBehaviourToContext: model.assign((_, e) => {
			if (e.type !== "CHECK_FOR_SESSION") return {};
			return { sessionCheckBehaviour: e.sessionCheckBehaviour };
		}),
		clearUsernameAndPasswordFromContext: model.assign({ password: "", username: "" }),
		// Keep in touch with yr parents
		notifyAuthFlowComplete: sendParent(model.events.WORKER_AUTH_FLOW_COMPLETE),
		notifyLoggedOut: sendParent(model.events.WORKER_LOGGED_OUT),
		notifyRequestComplete: sendParent(model.events.WORKER_ASYNC_REQUEST_SETTLED),
		notifyRequestStarted: sendParent(model.events.WORKER_ASYNC_REQUEST_PENDING),
		requestUsernameAndPassword: sendParent(model.events.WORKER_REQUIRES_USERNAME_AND_PASSWORD),
	},
};

const machine = model.createMachine(
	{
		id: "usernamePasswordService",
		context: model.initialContext,
		initial: "awaitingUsernameAndPasswordInput",
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
						target: "awaitingUsernameAndPasswordInput",
					},
				},
				exit: "notifyRequestComplete",
			},
			// Alternatively, username/password flow may be used: this is currently
			// a config-level option (choice is static and stored in the meta)
			awaitingUsernameAndPasswordInput: {
				entry: "requestUsernameAndPassword",
				on: {
					SUBMIT_USERNAME_AND_PASSWORD: {
						actions: "assignUsernameAndPasswordToContext",
						target: "validatingUsernameAndPassword",
					},
				},
			},
			validatingUsernameAndPassword: {
				entry: "notifyRequestStarted",
				invoke: {
					src: "validateUsernameAndPassword",
					onDone: {
						target: "authComplete",
					},
				},
				exit: "notifyRequestComplete",
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
				entry: ["notifyAuthFlowComplete", "clearUsernameAndPasswordFromContext"],
				on: {
					LOG_OUT: "loggingOut",
				},
			},
		},
	},
	implementations
);

export function createUsernamePasswordWorker<User>(
	serviceApi: UsernamePasswordService<User>
): StateMachine<ModelCtx, any, ModelEvt> {
	return machine.withConfig({
		services: {
			checkForExtantSession: (ctx: ModelCtx) =>
				serviceApi.checkForExtantSession(ctx.sessionCheckBehaviour),
			validateOtp: (ctx: ModelCtx) =>
				serviceApi.validateUsernameAndPassword(ctx.username, ctx.password),
			logOut: () => serviceApi.logOut(),
		},
	});
}
