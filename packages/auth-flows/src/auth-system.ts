/* eslint-disable @typescript-eslint/no-explicit-any */
import { send, spawn } from "xstate";
import { log } from "xstate/lib/actions";
import { createModel } from "xstate/lib/model";

import { createBiometricWorker } from "./biometric-worker";
import { AuthSystemError } from "./errors";
import { createOtpWorker } from "./otp-worker";
import { createPinWorker } from "./pin-worker";
import { createUsernamePasswordWorker } from "./username-password-worker";

import type { StateMachine, ActorRef } from "xstate";
import type { ModelContextFrom, ModelEventsFrom } from "xstate/lib/model";

import type { UsernamePasswordService } from "./username-password-service";
import type { OTPService } from "./otp-service";
import type {
	SessionCheckBehaviour,
	DeviceSecurityService,
	DeviceSecurityType,
	LoginFlowType,
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
			SERVICE_NOTIFICATION__ASYNC_REQUEST_PENDING: () => ({}),
			SERVICE_NOTIFICATION__ASYNC_REQUEST_SETTLED: () => ({}),
			SERVICE_NOTIFICATION__AUTH_FLOW_COMPLETE: () => ({}),
			SERVICE_NOTIFICATION__BIOMETRIC_NOT_SUPPORTED: () => ({}),
			SERVICE_NOTIFICATION__LOGGED_OUT: () => ({}),
			SERVICE_REQUEST__CURRENT_PIN_AND_NEW_PIN: () => ({}),
			SERVICE_REQUEST__CURRENT_PIN: () => ({}),
			SERVICE_REQUEST__NEW_PIN: () => ({}),
			SERVICE_REQUEST__PASSWORD: () => ({}),
			SERVICE_REQUEST__USERNAME_AND_PASSWORD: () => ({}),
			SERVICE_REQUEST__USERNAME: () => ({}),
		},
	}
);

export const authEvents = authSystemModel.events;

export type AuthSystemContext = ModelContextFrom<typeof authSystemModel>;
export type AuthSystemEvents = ModelEventsFrom<typeof authSystemModel>;

export type AuthSystemServiceRef = ActorRef<AuthSystemEvents>;

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
const authSysytemImplementations = {
	actions: {
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
	},
};

export const authSystem = authSystemModel.createMachine(
	{
		id: "authSystem",
		initial: "loginFlowCheck",
		context: authSystemModel.initialContext,
		on: {
			SERVICE_NOTIFICATION__ASYNC_REQUEST_PENDING: { actions: "loadingStarted", internal: true },
			SERVICE_NOTIFICATION__ASYNC_REQUEST_SETTLED: { actions: "loadingComplete", internal: true },
		},
		states: {
			loginFlowCheck: {
				always: [
					{
						cond: (ctx) => ctx.loginFlowType === "OTP",
						target: "otpLoginFlowInit",
					},
					{
						cond: (ctx) => ctx.loginFlowType === "USERNAME_PASSWORD",
						target: "usernamePasswordLoginFlowInit",
					},
				],
			},
			otpLoginFlowInit: {
				on: {
					SERVICE_REQUEST__USERNAME: "otpUsernameInput",
					SERVICE_NOTIFICATION__AUTH_FLOW_COMPLETE: "deviceSecurityCheck",
				},
			},
			otpUsernameInput: {
				on: {
					SERVICE_REQUEST__PASSWORD: "otpPasswordInput",
				},
			},
			otpPasswordInput: {
				on: {
					RESEND_PASSWORD: undefined,
					SERVICE_NOTIFICATION__AUTH_FLOW_COMPLETE: "deviceSecurityCheck",
					GO_BACK: "otpUsernameInput",
				},
			},
			usernamePasswordLoginFlowInit: {
				on: {
					SERVICE_REQUEST__USERNAME_AND_PASSWORD: "usernamePasswordInput",
					SERVICE_NOTIFICATION__AUTH_FLOW_COMPLETE: "deviceSecurityCheck",
				},
			},
			usernamePasswordInput: {
				on: {
					SERVICE_NOTIFICATION__AUTH_FLOW_COMPLETE: "deviceSecurityCheck",
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
						actions: "startPinService",
					},
					{
						cond: (ctx) => ctx.deviceSecurityType === "BIOMETRIC",
						actions: "startBiometricService",
					},
				],
			},
			pinFlowInit: {
				on: {
					SERVICE_REQUEST__CURRENT_PIN: "currentPinInput",
					SERVICE_REQUEST__NEW_PIN: "newPinInput",
				},
			},
			currentPinInput: {
				on: {
					SERVICE_NOTIFICATION__AUTH_FLOW_COMPLETE: "authorised",
				},
			},
			newPinInput: {
				on: {
					SERVICE_NOTIFICATION__AUTH_FLOW_COMPLETE: "authorised",
					SKIP_PIN_SETUP: "authorised",
				},
			},
			changingCurrentPinInput: {
				on: {
					SERVICE_NOTIFICATION__AUTH_FLOW_COMPLETE: "authorised",
					SKIP_PIN_SETUP: "authorised",
				},
			},
			clearingCurrentPin: {
				on: {
					SERVICE_NOTIFICATION__AUTH_FLOW_COMPLETE: "authorised",
				},
			},
			biometricFlowInit: {
				on: {
					SERVICE_NOTIFICATION__BIOMETRIC_NOT_SUPPORTED: "biometricNotSupported",
					SERVICE_NOTIFICATION__AUTH_FLOW_COMPLETE: "authorised",
				},
			},
			biometricNotSupported: {
				on: {
					CHANGE_DEVICE_SECURITY_TYPE: "deviceSecurityCheck",
				},
			},
			authorised: {
				on: {
					SERVICE_NOTIFICATION__LOGGED_OUT: "loginFlowCheck",
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
						target: "changingCurrentPinInput",
					},
				},
			},
		},
	},
	authSysytemImplementations
);

// authSystem.

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
}: AuthSystemConfig<User> = {}): StateMachine<AuthSystemContext, any, AuthSystemEvents> {
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

	return authSystem.withContext({
		...authSystemModel.initialContext,
		biometricService: deviceSecurityInterface
			? (spawn(createBiometricWorker(deviceSecurityInterface), {
					name: "biometricService",
					autoForward: true,
			  }) as any)
			: null,
		otpService: otpServiceApi
			? (spawn(createOtpWorker(otpServiceApi), {
					name: "otpService",
					autoForward: true,
			  }) as any)
			: null,
		pinService: deviceSecurityInterface
			? (spawn(createPinWorker(deviceSecurityInterface), {
					name: "pinService",
					autoForward: true,
			  }) as any)
			: null,
		usernamePasswordService: usernamePasswordServiceApi
			? (spawn(createUsernamePasswordWorker(usernamePasswordServiceApi), {
					name: "usernamePasswordService",
					autoForward: true,
			  }) as any)
			: null,
		deviceSecurityType,
		loginFlowType,
	});
}
