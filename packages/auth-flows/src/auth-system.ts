import { createMachine, send, spawn } from "xstate";
import { log } from "xstate/lib/actions";
import { createModel, ModelContextFrom, ModelEventsFrom } from "xstate/lib/model";

import { OTPService } from "./otp-service";
import { createOtpWorker } from "./otp-worker";
import { createPinWorker } from "./pin-worker";
import { UsernamePasswordService } from "./username-password-service";
import { createUsernamePasswordWorker } from "./username-password-worker";
import { AuthSystemError } from "./utilities";

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ActorRef, StateMachine } from "xstate";
import type {
	DeviceSecurityService,
	DeviceSecurityType,
	LoginFlowType,
	SessionCheckBehaviour,
} from "./types";
export const authSystemModel = createModel(
	{
		isLoading: false,
		deviceSecurityType: "NONE" as DeviceSecurityType,
		loginFlowType: "OTP" as LoginFlowType,
		otpService: null as AuthSystemServiceRef | null,
		pinService: null as AuthSystemServiceRef | null,
		usernamePasswordService: null as AuthSystemServiceRef | null,
	},
	{
		// prettier-ignore
		events: {
			AUTH_FLOW_COMPLETE: () => ({}),
			CHANGE_DEVICE_SECURITY_TYPE: (deviceSecurityType: DeviceSecurityType) => ({ deviceSecurityType }),
			CHANGE_EXISTING_PIN: () => ({}),
			CHANGE_LOGIN_FLOW_TYPE: (loginFlowType: LoginFlowType) => ({ loginFlowType }),
			CHECK_FOR_EXISTING_PIN: () => ({}),
			CHECK_FOR_SESSION: (sessionCheckBehaviour: SessionCheckBehaviour = "normal") => ({ sessionCheckBehaviour }),
			GO_BACK: () => ({}),
			LOG_OUT: () => ({}),
			LOGGED_OUT: () => ({}),
			ASYNC_REQUEST_PENDING: () => ({}),
			ASYNC_REQUEST_SETTLED: () => ({}),
			REQUEST_EXISTING_PIN: () => ({}),
			REQUEST_EXISTING_PIN_AND_NEW_PIN: () => ({}),
			REQUEST_NEW_PIN: () => ({}),
			REQUEST_PASSWORD: () => ({}),
			REQUEST_USERNAME_AND_PASSWORD: () => ({}),
			REQUEST_USERNAME: () => ({}),
			RESEND_PASSWORD: () => ({}),
			SKIP_PIN_SETUP: () => ({}),
			SUBMIT_CURRENT_PIN: (currentPin: string) => ({ currentPin }),
			SUBMIT_CURRENT_AND_NEW_PIN: (currentPin: string, newPin: string) => ({ currentPin, newPin }),
			SUBMIT_NEW_PIN: (newPin: string) => ({ newPin }),
			SUBMIT_PASSWORD: (password: string) => ({ password }),
			SUBMIT_USERNAME_AND_PASSWORD: (username: string, password: string) => ({ username, password }),
			SUBMIT_USERNAME: (username: string) => ({ username }),
		},
	}
);

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

const authServiceImplementations = {
	actions: {
		startBiometricService: () => {
			throw new AuthSystemError("No implementation for biometric security service defined.");
		},
		startOtpService: () => {
			throw new AuthSystemError("No implementation for OTP service defined.");
		},
		startPinService: () => {
			throw new AuthSystemError("No implementation for PIN security service defined.");
		},
		startUsernamePasswordService: () => {
			throw new AuthSystemError("No implementation for username password service defined.");
		},
		// Generic actions to set the loading status of the machine. `loadingStarted`
		// before every invocation of a network call and `loadingEnd` after that
		// network call is settled. Triggered when a message comes in from one of the services.
		loadingStarted: authSystemModel.assign({ isLoading: true }),
		loadingComplete: authSystemModel.assign({ isLoading: false }),
		assignNewDeviceSecurityTypeToContext: authSystemModel.assign((ctx, e) => {
			if (e.type !== "CHANGE_DEVICE_SECURITY_TYPE") {
				return {};
			} else if (e.deviceSecurityType === ctx.deviceSecurityType) {
				console.warn(`Device security type is already ${ctx.deviceSecurityType}, this is a noop`);
				return {};
			} else {
				return { deviceSecurityType: e.deviceSecurityType };
			}
		}),
		// adjust the login flow type to be used, which will cause the logic to switch in
		// the initial loginFlowCheck state
		assignNewLoginFlowTypeToContext: authSystemModel.assign((_, e) => {
			if (e.type !== "CHANGE_LOGIN_FLOW_TYPE") return {};
			return { loginFlowType: e.loginFlowType };
		}),
		// some actions that occur on the system need to be followed by a log out, so
		// following broadcasts a request for that to the machine:
		broadcastLogOutRequest: send("LOG_OUT"),
		// When a user attempts to change their pin, the pin service starts up. Once it's
		// started, need to notify it that there's a pin change required:
		notifyPinServiceOfPinChangeRequest: send("CHANGE_EXISTING_PIN", { to: "pinService" }),
	},
};

export const authSystem = createMachine<typeof authSystemModel>(
	{
		id: "authSystem",
		initial: "loginFlowCheck",
		context: authSystemModel.initialContext,
		on: {
			ASYNC_REQUEST_PENDING: { actions: "loadingStarted", internal: true },
			ASYNC_REQUEST_SETTLED: { actions: "loadingComplete", internal: true },
		},
		states: {
			loginFlowCheck: {
				always: [
					{
						cond: (ctx) => ctx.loginFlowType === "OTP",
						actions: "startOtpService",
						target: "otpLoginFlowInit",
					},
					{
						cond: (ctx) => ctx.loginFlowType === "USERNAME_PASSWORD",
						actions: "startUsernamePasswordService",
						target: "usernamePasswordLoginFlowInit",
					},
				],
			},
			otpLoginFlowInit: {
				on: {
					REQUEST_USERNAME: "otpUsernameInput",
					AUTH_FLOW_COMPLETE: "deviceSecurityCheck",
				},
			},
			otpUsernameInput: {
				on: {
					REQUEST_PASSWORD: "otpPasswordInput",
				},
			},
			otpPasswordInput: {
				on: {
					RESEND_PASSWORD: undefined,
					AUTH_FLOW_COMPLETE: "deviceSecurityCheck",
					GO_BACK: "otpUsernameInput",
				},
			},
			usernamePasswordLoginFlowInit: {
				on: {
					REQUEST_USERNAME_AND_PASSWORD: "usernamePasswordInput",
					AUTH_FLOW_COMPLETE: "deviceSecurityCheck",
				},
			},
			usernamePasswordInput: {
				on: {
					AUTH_FLOW_COMPLETE: "deviceSecurityCheck",
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
						target: "pinFlowInit",
						actions: "startPinService",
					},
					// {
					// 	cond: (ctx) => ctx.deviceSecurityType === "BIOMETRIC",
					// 	target: "biometricFlowInit",
					// 	actions: "startBiometricService",
					// },
				],
			},
			pinFlowInit: {
				on: {
					REQUEST_EXISTING_PIN: "currentPinInput",
					REQUEST_NEW_PIN: "newPinInput",
				},
			},
			currentPinInput: {
				on: {
					AUTH_FLOW_COMPLETE: "authorised",
				},
			},
			newPinInput: {
				on: {
					AUTH_FLOW_COMPLETE: "authorised",
					SKIP_PIN_SETUP: "authorised",
				},
			},
			changeCurrentPinInput: {
				entry: "notifyPinServiceOfPinChangeRequest",
				on: {
					AUTH_FLOW_COMPLETE: "authorised",
					SKIP_PIN_SETUP: "authorised",
				},
			},
			authorised: {
				on: {
					LOGGED_OUT: "loginFlowCheck",
					CHANGE_LOGIN_FLOW_TYPE: {
						actions: ["assignNewLoginFlowTypeToContext", "broadcastLogOutRequest"],
					},
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
							cond: (_, e) => e.deviceSecurityType === "NONE",
							actions: [
								"assignNewDeviceSecurityTypeToContext",
								log(
									"Device security type set to 'NONE', This means device security is turned off. This is a no-op, and will only have an effect the next time you visit and log in."
								),
							],
							target: undefined,
						},
						{
							actions: "assignNewDeviceSecurityTypeToContext",
							target: "deviceSecurityCheck",
						},
					],
					CHANGE_EXISTING_PIN: {
						actions: "startPinService",
						target: "changeCurrentPinInput",
					},
				},
			},
		},
	},
	authServiceImplementations
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
	ModelContextFrom<typeof authSystemModel>,
	any,
	ModelEventsFrom<typeof authSystemModel>
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
		.withConfig({
			actions: {
				startOtpService: authSystemModel.assign({
					otpService: () => {
						if (!otpServiceApi) {
							console.warn(
								"No OTP service has been defined. If you did intend to have this functionality, you need to define an interface for the auth system to use."
							);
							return null;
						} else {
							console.log("Starting OTP login worker...");
							return spawn(createOtpWorker(otpServiceApi), {
								name: "otpService",
								autoForward: true,
							}) as any;
						}
					},
				}) as any,
				startUsernamePasswordService: authSystemModel.assign({
					usernamePasswordService: () => {
						if (!usernamePasswordServiceApi) {
							console.warn(
								"No username/password service has been defined. If you did intend to include this functionality, you must define an interface for the auth system to use."
							);
							return null;
						} else {
							console.log("Starting username/password login worker...");
							return spawn(createUsernamePasswordWorker(usernamePasswordServiceApi), {
								name: "usernamePasswordService",
								autoForward: true,
							}) as any;
						}
					},
				}) as any,
				startPinService: authSystemModel.assign({
					pinService: () => {
						if (!deviceSecurityInterface) {
							console.warn(
								"No device security service has been defined. If you did intend to include this functionality, you must define an interface for the auth system to use."
							);
							return null;
						} else {
							console.log("Starting pin login worker...");
							return spawn(createPinWorker(deviceSecurityInterface), {
								name: "pinInputService",
								autoForward: true,
							}) as any;
						}
					},
				}) as any,
			},
		})
		.withContext({
			...authSystemModel.initialContext,
			deviceSecurityType,
			loginFlowType,
		});
}
