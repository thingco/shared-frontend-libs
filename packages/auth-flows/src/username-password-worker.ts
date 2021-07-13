/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendParent } from "xstate";
import { createModel } from "xstate/lib/model";

import { ServiceError } from "./errors";
import { UsernamePasswordService } from "./username-password-service";

import type { StateMachine } from "xstate";
import type { ModelContextFrom, ModelEventsFrom } from "xstate/lib/model";
import type { SessionCheckBehaviour } from "./types";

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
			SERVICE_NOTIFICATION__AUTH_FLOW_COMPLETE: () => ({}),
			SERVICE_NOTIFICATION__LOGGED_OUT: () => ({}),
			SERVICE_NOTIFICATION__ASYNC_REQUEST_SETTLED: () => ({}),
			SERVICE_NOTIFICATION__ASYNC_REQUEST_PENDING: () => ({}),
			SERVICE_REQUEST__USERNAME_AND_PASSWORD: () => ({}),
		},
	}
);

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
	{
		services: {
			checkForExtantSession: () => {
				throw new ServiceError("No implementation for checkExtantSession method");
			},
			logOut: () => {
				throw new ServiceError("No implementation for logOut method");
			},
			validateUsernameAndPassword: () => {
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
			notifyAuthFlowComplete: sendParent(model.events.SERVICE_NOTIFICATION__AUTH_FLOW_COMPLETE),
			notifyLoggedOut: sendParent(model.events.SERVICE_NOTIFICATION__LOGGED_OUT),
			notifyRequestComplete: sendParent(model.events.SERVICE_NOTIFICATION__ASYNC_REQUEST_SETTLED),
			notifyRequestStarted: sendParent(model.events.SERVICE_NOTIFICATION__ASYNC_REQUEST_PENDING),
			requestUsernameAndPassword: sendParent(model.events.SERVICE_REQUEST__USERNAME_AND_PASSWORD),
		},
	}
);

export function createUsernamePasswordWorker<User>(
	serviceApi: UsernamePasswordService<User>
): StateMachine<ModelContextFrom<typeof model>, any, ModelEventsFrom<typeof model>> {
	return machine.withConfig({
		services: {
			checkForExtantSession: (ctx: ModelContextFrom<typeof model>) =>
				serviceApi.checkForExtantSession(ctx.sessionCheckBehaviour),
			validateOtp: (ctx: ModelContextFrom<typeof model>) =>
				serviceApi.validateUsernameAndPassword(ctx.username, ctx.password),
			logOut: () => serviceApi.logOut(),
		},
	});
}
