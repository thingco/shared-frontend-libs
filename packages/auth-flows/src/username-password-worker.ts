import { createMachine, sendParent } from "xstate";
import { createModel } from "xstate/lib/model";

import { UsernamePasswordService } from "./username-password-service";

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ModelContextFrom } from "xstate/lib/model";
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
			SUBMIT_USERNAME: (username: string) => ({ username }),
			SUBMIT_PASSWORD: (password: string) => ({ password }),
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
		checkForExtantSession: (_ctx: ModelContextFrom<typeof model>) => {
			throw new Error("No implementation for checkExtantSession method");
		},
		logOut: () => {
			throw new Error("No implementation for logOut method");
		},
		validateUsernameAndPassword: (_ctx: ModelContextFrom<typeof model>) => {
			throw new Error("No implementation for validateUsernameAndPassword method");
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
		requestUsernameAndPassword: sendParent("REQUEST_USERNAME_AND_PASSWORD"),
		notifyRequestStarted: sendParent("ASYNC_REQUEST_PENDING"),
		notifyRequestComplete: sendParent("ASYNC_REQUEST_SETTLED"),
		notifyAuthFlowComplete: sendParent("AUTH_FLOW_COMPLETE"),
		notifyLoggedOut: sendParent("LOGGED_OUT"),
	},
};

const machine = createMachine<typeof model>(
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

export function createUsernamePasswordWorker<User>(serviceApi: UsernamePasswordService<User>) {
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
