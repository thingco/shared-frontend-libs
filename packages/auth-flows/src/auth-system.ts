/* eslint-disable @typescript-eslint/no-explicit-any */
import { send, spawn } from "xstate";
import { log } from "xstate/lib/actions";
import { createModel } from "xstate/lib/model";

import { createBiometricWorker } from "./biometric-worker";
import { AuthSystemError } from "./errors";
import { createOtpWorker } from "./otp-worker";
import { createPinWorker } from "./pin-worker";
import { createUsernamePasswordWorker } from "./username-password-worker";

import type { StateMachine, StateNode, ActorRef } from "xstate";
import type { ModelContextFrom, ModelEventsFrom } from "xstate/lib/model";

import type {
	SessionCheckBehaviour,
	DeviceSecurityService,
	DeviceSecurityType,
	LoginFlowType,
	OTPService,
	UsernamePasswordService,
} from "./types";

export const authSystemModel = createModel(
	{
		isLoading: false,
		deviceSecurityType: "NONE" as DeviceSecurityType,
		loginFlowType: "OTP" as LoginFlowType,
		biometricService: null as AuthSystemServiceRef | null,
		otpService: null as AuthSystemServiceRef | null,
		pinService: null as AuthSystemServiceRef | null,
		usernamePasswordService: null as AuthSystemServiceRef | null,
	},
	{
		events: {
			ATHORISE_AGAINST_BIOMETRIC_SECURITY: () => ({}),
			CHANGE_DEVICE_SECURITY_TYPE: (deviceSecurityType: DeviceSecurityType) => ({
				deviceSecurityType,
			}),
			CHANGE_CURRENT_PIN: () => ({}),
			CHECK_FOR_BIOMETRIC_SECURITY: () => ({}),
			CHECK_FOR_CURRENT_PIN: () => ({}),
			CHECK_FOR_SESSION: (sessionCheckBehaviour: SessionCheckBehaviour = "normal") => ({
				sessionCheckBehaviour,
			}),
			CLEAR_CURRENT_PIN: () => ({}),
			GO_BACK: () => ({}),
			LOG_OUT: () => ({}),
			RESEND_PASSWORD: () => ({}),
			SKIP_PIN_SETUP: () => ({}),
			SUBMIT_CURRENT_AND_NEW_PIN: (currentPin: string, newPin: string) => ({ currentPin, newPin }),
			SUBMIT_CURRENT_PIN: (currentPin: string) => ({ currentPin }),
			SUBMIT_NEW_PIN: (newPin: string) => ({ newPin }),
			SUBMIT_PASSWORD: (password: string) => ({ password }),
			SUBMIT_USERNAME_AND_PASSWORD: (username: string, password: string) => ({
				username,
				password,
			}),
			SUBMIT_USERNAME: (username: string) => ({ username }),
			// Messages **from** running worker services:
			WORKER_ASYNC_REQUEST_PENDING: () => ({}),
			WORKER_ASYNC_REQUEST_SETTLED: () => ({}),
			WORKER_AUTH_FLOW_COMPLETE: () => ({}),
			WORKER_BIOMETRIC_NOT_SUPPORTED: () => ({}),
			WORKER_LOGGED_OUT: () => ({}),
			WORKER_REQUIRES_CURRENT_PIN_AND_NEW_PIN: () => ({}),
			WORKER_REQUIRES_CURRENT_PIN: () => ({}),
			WORKER_REQUIRES_NEW_PIN: () => ({}),
			WORKER_REQUIRES_PASSWORD: () => ({}),
			WORKER_REQUIRES_USERNAME_AND_PASSWORD: () => ({}),
			WORKER_REQUIRES_USERNAME: () => ({}),
		},
	}
);

export const authEvents = authSystemModel.events;

export type AuthSystemContext = ModelContextFrom<typeof authSystemModel>;
export type AuthSystemEvents = ModelEventsFrom<typeof authSystemModel>;

export type AuthStateSchema = {
	states: {
		loginFlowCheck: StateNode;
		otpLoginFlowInit: StateNode;
		otpUsernameInput: StateNode;
		otpPasswordInput: StateNode;
		usernamePasswordLoginFlowInit: StateNode;
		usernamePasswordInput: StateNode;
		deviceSecurityCheck: StateNode;
		pinFlowInit: StateNode;
		currentPinInput: StateNode;
		newPinInput: StateNode;
		changingCurrentPinInput: StateNode;
		clearingCurrentPin: StateNode;
		biometricFlowInit: StateNode;
		biometricNotSupported: StateNode;
		authorised: StateNode;
	};
};

export type AuthSystemServiceRef = ActorRef<AuthSystemEvents>;

const authSysytemImplementations = {
	preserveActionOrder: true,
	actions: {
		spawnOtpService: authSystemModel.assign({
			otpService: null,
		}),
		spawnUsernamePasswordService: authSystemModel.assign({
			usernamePasswordService: null,
		}),
		spawnPinService: authSystemModel.assign({ pinService: null }),
		spawnBiometricService: authSystemModel.assign({ biometricService: null }),
		// Generic actions to set the loading status of the machine. `loadingStarted`
		// before every invocation of a network call and `loadingEnd` after that
		// network call is settled. Triggered when a message comes in from one of the services.
		loadingStarted: authSystemModel.assign({ isLoading: true }),
		loadingComplete: authSystemModel.assign({ isLoading: false }),
		assignNewDeviceSecurityTypeToContext: authSystemModel.assign((_, e) => {
			if (e.type !== "CHANGE_DEVICE_SECURITY_TYPE") return {};
			return { deviceSecurityType: e.deviceSecurityType };
		}),
		// some actions that occur on the system need to be followed by a log out, so
		// following broadcasts a request for that to the machine:
		broadcastLogOutRequest: send<AuthSystemContext, AuthSystemEvents>("LOG_OUT"),
		// forwarding functions. NOTE THAT AT THE POINT THESE ARE USED THE RELEVANT SERVICE
		// IS ASSUMED TO EXIST, hence the non-null assertions to keep TS happy.
		// TODO better handling all round of the actors, and what to do if the service
		// isn't live. Best is probably to handle lack of service in the workers: if they
		// aren't supposed to be running, then send info back to parent.
		forwardEventToOtpService: send<AuthSystemContext, AuthSystemEvents>((_, e) => e, {
			to: (ctx) => ctx.otpService!,
		}),
		forwardEventToUsernamePasswordService: send<AuthSystemContext, AuthSystemEvents>((_, e) => e, {
			to: (ctx) => ctx.usernamePasswordService!,
		}),
		forwardEventToPinService: send<AuthSystemContext, AuthSystemEvents>((_, e) => e, {
			to: (ctx) => ctx.pinService!,
		}),
		forwardEventToBiometricService: send<AuthSystemContext, AuthSystemEvents>((_, e) => e, {
			to: (ctx) => ctx.biometricService!,
		}),
	},
};

export const authSystem = authSystemModel.createMachine(
	{
		id: "authSystem",
		initial: "loginFlowCheck",
		context: authSystemModel.initialContext,
		on: {
			WORKER_ASYNC_REQUEST_PENDING: { actions: "loadingStarted", internal: true },
			WORKER_ASYNC_REQUEST_SETTLED: { actions: "loadingComplete", internal: true },
		},
		states: {
			loginFlowCheck: {
				always: [
					{
						cond: (ctx) => ctx.loginFlowType === "OTP",
						target: "otpLoginFlowInit",
						actions: "spawnOtpService",
					},
					{
						cond: (ctx) => ctx.loginFlowType === "USERNAME_PASSWORD",
						target: "usernamePasswordLoginFlowInit",
						actions: "spawnUsernamePasswordService",
					},
				],
			},
			otpLoginFlowInit: {
				on: {
					CHECK_FOR_SESSION: {
						actions: "forwardEventToOtpService",
						target: undefined,
					},
					WORKER_REQUIRES_USERNAME: "otpUsernameInput",
					WORKER_AUTH_FLOW_COMPLETE: "deviceSecurityCheck",
				},
			},
			otpUsernameInput: {
				on: {
					SUBMIT_USERNAME: {
						actions: "forwardEventToOtpService",
					},
					WORKER_REQUIRES_PASSWORD: "otpPasswordInput",
				},
			},
			otpPasswordInput: {
				on: {
					SUBMIT_PASSWORD: {
						actions: "forwardEventToOtpService",
					},
					GO_BACK: {
						actions: "forwardEventToOtpService",
						target: "otpUsernameInput",
					},
					RESEND_PASSWORD: {
						actions: "forwardEventToOtpService",
					},
					WORKER_AUTH_FLOW_COMPLETE: "deviceSecurityCheck",
				},
			},
			usernamePasswordLoginFlowInit: {
				on: {
					CHECK_FOR_SESSION: {
						actions: "forwardEventToUsernamePasswordService",
					},
					WORKER_REQUIRES_USERNAME_AND_PASSWORD: "usernamePasswordInput",
					WORKER_AUTH_FLOW_COMPLETE: "deviceSecurityCheck",
				},
			},
			usernamePasswordInput: {
				on: {
					SUBMIT_USERNAME_AND_PASSWORD: {
						actions: "forwardEventToUsernamePasswordService",
					},
					WORKER_AUTH_FLOW_COMPLETE: "deviceSecurityCheck",
				},
			},
			// ------------ Device-level security
			// Check what type of device-level security (if any) is turned on and configured.
			//
			// TODO add another state before this to check storage (if any) to grab user's
			// security preference: it should be persisted otherwise the device security will
			// be [re]set to the initial value evey time on reload.
			deviceSecurityCheck: {
				always: [
					{
						cond: (ctx) => ctx.deviceSecurityType === "NONE",
						target: "authorised",
					},
					{
						cond: (ctx) => ctx.deviceSecurityType === "PIN",
						actions: "spawnPinService",
						target: "pinFlowInit",
					},
					{
						cond: (ctx) => ctx.deviceSecurityType === "BIOMETRIC",
						actions: "spawnBiometricService",
						target: "biometricFlowInit",
					},
				],
			},
			pinFlowInit: {
				on: {
					CHECK_FOR_CURRENT_PIN: {
						actions: "forwardEventToPinService",
					},
					WORKER_REQUIRES_CURRENT_PIN: "currentPinInput",
					WORKER_REQUIRES_NEW_PIN: "newPinInput",
				},
			},
			currentPinInput: {
				on: {
					SUBMIT_CURRENT_PIN: {
						actions: "forwardEventToPinService",
					},
					WORKER_AUTH_FLOW_COMPLETE: "authorised",
				},
			},
			newPinInput: {
				on: {
					SUBMIT_NEW_PIN: {
						actions: "forwardEventToPinService",
					},
					WORKER_AUTH_FLOW_COMPLETE: "authorised",
					SKIP_PIN_SETUP: "authorised",
				},
			},
			changeCurrentPinInput: {
				on: {
					SUBMIT_CURRENT_AND_NEW_PIN: {
						actions: "forwardEventToPinService",
					},
					WORKER_AUTH_FLOW_COMPLETE: "authorised",
					SKIP_PIN_SETUP: "authorised",
				},
			},
			clearingCurrentPin: {
				on: {
					CLEAR_CURRENT_PIN: {
						actions: "forwardEventToPinService",
					},
					WORKER_AUTH_FLOW_COMPLETE: "authorised",
				},
			},
			biometricFlowInit: {
				on: {
					CHECK_FOR_BIOMETRIC_SECURITY: {
						actions: "forwardEventToBiometricService",
					},
					ATHORISE_AGAINST_BIOMETRIC_SECURITY: {
						actions: "forwardEventToBiometricService",
					},
					WORKER_BIOMETRIC_NOT_SUPPORTED: "biometricNotSupported",
					WORKER_AUTH_FLOW_COMPLETE: "authorised",
				},
			},
			biometricNotSupported: {
				on: {
					CHANGE_DEVICE_SECURITY_TYPE: "deviceSecurityCheck",
				},
			},
			authorised: {
				on: {
					LOG_OUT: [
						{
							cond: (ctx) => ctx.loginFlowType === "OTP",
							actions: "forwardEventToOtpService",
						},
						{
							cond: (ctx) => ctx.loginFlowType === "USERNAME_PASSWORD",
							actions: "forwardEventToUsernamePasswordService",
						},
					],
					WORKER_LOGGED_OUT: "loginFlowCheck",
					CHANGE_DEVICE_SECURITY_TYPE: [
						{
							cond: (ctx, e) => ctx.deviceSecurityType === e.deviceSecurityType,
							actions: log(
								(ctx) =>
									`Current device security type is already set as "${ctx.deviceSecurityType}", this is a no-op.`
							),
							target: undefined,
						},
						{
							cond: (ctx, e) => ctx.deviceSecurityType === "PIN" && e.deviceSecurityType === "NONE",
							actions: "assignNewDeviceSecurityTypeToContext",
							target: "clearingCurrentPin",
						},
						{
							actions: "assignNewDeviceSecurityTypeToContext",
							target: "deviceSecurityCheck",
						},
					],
					CHANGE_CURRENT_PIN: {
						actions: "forwardEventToPinService",
						target: "changeCurrentPinInput",
					},
				},
			},
		},
	},
	authSysytemImplementations
);

export type AuthSystemConfig<User> = {
	/**
	 * Used to initialise the machine's context: specifies whether the user
	 * is using PIN security, biometric security, or nothing. Will default to
	 * nothing ("NONE") unless specified.
	 */
	deviceSecurityType?: DeviceSecurityType;
	/**
	 * Used to initialise the machine's context: specifies whether the user
	 * will be using OTP auth or basic userame/password auth. Will default to
	 * OTP auth unless specified.
	 */
	loginFlowType?: LoginFlowType;
	/**
	 * The instance of the OTP auth class, an interface over the underlying implementation:
	 * in our case a set of AWS Cognito auth functions encapsulted by Amplify's Auth module.
	 */
	otpServiceApi?: OTPService<User>;
	/**
	 * The instance of the username/password auth class, an interface over the underlying implementation:
	 * in our case a set of AWS Cognito auth functions encapsulted by Amplify's Auth module.
	 */
	usernamePasswordServiceApi?: UsernamePasswordService<User>;
	/**
	 *
	 */
	deviceSecurityInterface?: DeviceSecurityService;
};

export function createAuthSystem<User>({
	deviceSecurityType = "NONE",
	loginFlowType = "OTP",
	otpServiceApi = undefined,
	usernamePasswordServiceApi = undefined,
	deviceSecurityInterface = undefined,
}: AuthSystemConfig<User> = {}): StateMachine<
	AuthSystemContext,
	AuthStateSchema,
	AuthSystemEvents
> {
	/**
	 * The authentication system **must use one or both of OTP and username/password auth**.
	 */
	if (loginFlowType === "OTP" && !otpServiceApi) {
		throw new AuthSystemError("login flow set as OTP, but no otp service API instance exists");
	}

	if (loginFlowType === "USERNAME_PASSWORD" && !usernamePasswordServiceApi) {
		throw new AuthSystemError(
			"login flow set as username/password, but no username/password service API instance exists"
		);
	}

	if (deviceSecurityType !== "NONE" && !deviceSecurityInterface) {
		throw new AuthSystemError(
			`device security type set as ${deviceSecurityType}, but no interface has been provided to interact with this.`
		);
	}

	return authSystem
		.withContext({
			...authSystemModel.initialContext,
			deviceSecurityType,
			loginFlowType,
		})
		.withConfig({
			actions: {
				spawnBiometricService: authSystemModel.assign({
					biometricService: () =>
						deviceSecurityInterface
							? (spawn(createBiometricWorker(deviceSecurityInterface), {
									name: "biometricService",
							  }) as any)
							: null,
				}) as any,
				spawnOtpService: authSystemModel.assign({
					otpService: () =>
						otpServiceApi
							? (spawn(createOtpWorker(otpServiceApi), {
									name: "otpService",
							  }) as any)
							: null,
				}) as any,
				spawnPinService: authSystemModel.assign({
					pinService: () =>
						deviceSecurityInterface
							? (spawn(createPinWorker(deviceSecurityInterface), {
									name: "pinService",
							  }) as any)
							: null,
				}) as any,
				spawnUsernamePasswordService: authSystemModel.assign({
					usernamePasswordService: () =>
						usernamePasswordServiceApi
							? (spawn(createUsernamePasswordWorker(usernamePasswordServiceApi), {
									name: "usernamePasswordService",
							  }) as any)
							: null,
				}) as any,
			},
		});
}
