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
		newPassword: "",
		sessionCheckBehaviour: "normal" as SessionCheckBehaviour,
	},
	{
		events: {
			LOG_OUT: () => ({}),
			CHECK_FOR_SESSION: (sessionCheckBehaviour: SessionCheckBehaviour = "normal") => ({
				sessionCheckBehaviour,
			}),
			SUBMIT_NEW_PASSWORD: (password: string, newPassword: string) => ({
				password,
				newPassword,
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
			WORKER_REQUIRES_PASSWORD_CHANGE: () => ({}),
			WORKER_REQUIRES_TEMPORARY_PASSWORD_CHANGE: () => ({}),
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
		validateNewPassword: (_c: ModelCtx, _e: ModelEvt) => {
			throw new ServiceError("No implementation for validateNewPassword method");
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
		assignPasswordsToContext: model.assign((_, e) => {
			if (e.type !== "SUBMIT_NEW_PASSWORD") return {};
			return { password: e.password, newPassword: e.newPassword };
		}),
		assignSessionCheckBehaviourToContext: model.assign((_, e) => {
			if (e.type !== "CHECK_FOR_SESSION") return {};
			return { sessionCheckBehaviour: e.sessionCheckBehaviour };
		}),
		clearPasswordsFromContext: model.assign({ password: "", newPassword: "" }),
		clearUsernameAndPasswordFromContext: model.assign({
			password: "",
			newPassword: "",
			username: "",
		}),
		// Keep in touch with yr parents
		notifyAuthFlowComplete: sendParent(model.events.WORKER_AUTH_FLOW_COMPLETE),
		notifyLoggedOut: sendParent(model.events.WORKER_LOGGED_OUT),
		notifyRequestComplete: sendParent(model.events.WORKER_ASYNC_REQUEST_SETTLED),
		notifyRequestStarted: sendParent(model.events.WORKER_ASYNC_REQUEST_PENDING),
		requestChangePassword: sendParent(model.events.WORKER_REQUIRES_PASSWORD_CHANGE),
		requestChangeTemporaryPassword: sendParent(
			model.events.WORKER_REQUIRES_TEMPORARY_PASSWORD_CHANGE
		),
		requestUsernameAndPassword: sendParent(model.events.WORKER_REQUIRES_USERNAME_AND_PASSWORD),
	},
};

const machine = model.createMachine(
	{
		id: "usernamePasswordService",
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
						target: "awaitingUsernameAndPasswordInput",
					},
				},
				exit: "notifyRequestComplete",
			},
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
					id: "validateUsernameAndPassword",
					src: "validateUsernameAndPassword",
					onDone: "authComplete",
					onError: [
						{
							cond: (_, e) => e.data.message === "NEW_PASSWORD_REQUIRED",
							actions: "requestChangeTemporaryPassword",
							target: "awaitingChangePasswordInput",
						},
						{
							target: "awaitingUsernameAndPasswordInput",
						},
					],
				},
				exit: "notifyRequestComplete",
			},
			awaitingChangePasswordInput: {
				on: {
					SUBMIT_NEW_PASSWORD: "validatingNewPassword",
				},
			},
			validatingNewPassword: {
				entry: "notifyRequestStarted",
				invoke: {
					id: "validateNewPassword",
					src: "validateNewPassword",
					onDone: {
						target: "authComplete",
					},
					onError: {
						target: "awaitingChangePasswordInput",
						actions: "clearPasswordsFromContext",
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
				entry: ["notifyAuthFlowComplete", "clearPasswordsFromContext"],
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
			validateUsernameAndPassword: (ctx: ModelCtx) =>
				serviceApi.validateUsernameAndPassword(ctx.username, ctx.password),
			validateNewPassword: (ctx: ModelCtx) =>
				serviceApi.validateNewPassword(ctx.password, ctx.newPassword),
			logOut: () => serviceApi.logOut(),
		},
	});
}
