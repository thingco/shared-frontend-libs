/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Auth } from "@aws-amplify/auth";
import React from "react";

import type { DeviceSecurityType, LoginFlowType } from "core/types";
import { resetPinCb } from "./stages/callback-implementations";
/**
 * A React provider + associated hooks for enabling injection of configuration.
 *
 * @remarks
 * For development and for tests, it's important to be able to switch the configurations easily. In
 * an actual app, configs are injected at build-time. The config injector takes the place of build-time
 * configurations for the test app, providing an easy way to update them at run-time.
 *
 * It's not designed to be efficient: it just blows everything away and rebuilds when a config is changed.
 *
 * The configs are read from and pushed to local storage to reduce friction when developing (it would be
 * quite annoying to have to set the app config every time the page reloaded on a code change).
 *
 * Currently, it covers:
 *
 * 1. The login flow type: we need to be able to check both the OTP and username/password flows function
 *    as expected.
 * 2. The device security type: we need to be able to check the PIN flows (NOTE: PIN security is implemented
 *    using local storage).
 * 3. The UI layout: IRL, the authentication stages are expected to be displayed to users as separate "screens".
 *    so for example they *just* see a screen with username input, then a screen with OTP input. In development,
 *    it's useful to be able to see *all* the stages at once, it makes it easier to debug when something goes
 *    wrong. So the UI layout can be configured to either show all stages, or to unmount each stage when it
 *    is inactive. NOTE: this involves instrumenting each component individually to ensure it doesn't render:
 *
 * ```tsx
 * if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;
 * ```
 *
 *    Bear this in mind when adding stages.
 * 4. Whether the XState visualiser should be used (via the useDevTools flag). The debugger is great, but it
 *    opens [and switches focus to] a new tab. This means that, when developing, every time the page reloads
 *    the focus switches. Annoying. It also needs to be turned off for tests.
 *
 * NOTE: Changes to the *core* configs (those that actually affect the authentication system FSM itself) will
 * trigger page reload. This is to ensure that the FSM is completely rebuilt and the auth flow begins anew.
 */

/**
 * Use union of strings instead of boolean for defining UI layout to make consistent with other config values.
 */
export type UiLayout = "SHOW_ALL_STAGES" | "MOUNT_WHEN_ACTIVE";
export type DevTools = "DEV_TOOLS_ACTIVE" | "DEV_TOOLS_INACTIVE";

export type Configs = {
	/**
	 * The current login flow used for authentication: will either be OTP or USERNAME_PASSWORD.
	 */
	loginFlowType: LoginFlowType;
	/**
	 * The type of device-level security used: will either be NONE or PIN.
	 */
	deviceSecurityType: DeviceSecurityType;
	/**
	 * Whether to show all stages in the UI. If this is false, components for stages will unmount
	 * when the stage is inactive, which is how it should operate in a real app. If set to true,
	 * then all stages will be show in the UI, which is useful for development, as it gives a
	 * full picture of the app that can be very helpful for debugging purposes. By default, this
	 * property should be set to false.
	 */
	uiLayout: UiLayout;
	/**
	 * Whether to use the XState inspector or not (see {@link https://xstate.js.org/docs/packages/xstate-inspect/} for more details)
	 */
	devToolsStatus: DevTools;
	/**
	 * If the app is being used to run tests against, we want to prefill some configs and prevent others
	 * having an effect.
	 */
	isInTestMode: boolean;
};

/**
 * Name the local storage keys to allow for reuse throught the config components
 */
export enum CONFIG_STORAGE_KEY {
	DEVICE_SECURITY_TYPE = "auth_test_app_device_security_type",
	LOGIN_FLOW_TYPE = "auth_test_app_login_flow_type",
	DEV_TOOLS_STATUS = "auth_test_app_dev_tools_status",
}

/**
 * Callback used in place of `React.setState` for core updates, which need handling slightly differently
 * to presentational updates.
 *
 * @typeParam T - specify the value targeted by the SwitchCoreConfig function, allowing for inference in
 *								the control components.
 */
export type UpdateCoreConfig<T = string> = (
	configLabel: string,
	configKey: CONFIG_STORAGE_KEY,
	configSetting: T
) => Promise<void>;

/**
 * When a *core* config is changed, basically force the app to reevaluate everything.
 *
 * @remarks
 * As it's a web app, this is acheived by storing the new setting, running log out and then force reloading.
 * It also pops up a *browser/system* confirmation box, so the user can back out of the update easily.
 * NOTE: this is in no way connected to the FSM, so the reload will not trigger any state changes.
 *
 * @param configLabel - the name of the config targeted, for example "Login flow type".
 * @param configKey - the storage key for this config.
 * @param configSetting - the value for the config, for example "OTP"
 */
const updateCoreConfig: UpdateCoreConfig = async (configLabel, configKey, configSetting) => {
	const ok = globalThis?.confirm(
		`Are you sure you want to change the "${configLabel}" setting to "${configSetting}"?`
	);
	if (ok) {
		globalThis?.localStorage?.setItem(configKey, configSetting);
		await resetPinCb();
		globalThis?.location?.reload();
	}
	return void 0;
};

/**
 * Utility function that can be provided to the config menu; allows a developer to clear everything down
 * and relaod the app without fear that configs/tokens will be present.
 */
const nukeStorage = () => {
	const ok = globalThis?.confirm("Are you really sure you want to completely nuke local storage?");
	if (ok) {
		globalThis?.localStorage?.clear();
		globalThis?.location?.reload();
	}
	return void 0;
};

export type ConfigUpdateMethods = {
	/**
	 * Update a config defined as core (_ie_ it completely alters the login flow).
	 */
	updateCoreConfig: UpdateCoreConfig;
	/**
	 * Update, visually, the display of the auth stages in the test app. This is a
	 * non-destructive action.
	 */
	setUiLayout: React.Dispatch<UiLayout>;
	/**
	 * Wipe *all* values in local storage. This will destroy all stored keys, setting
	 * the config back to default, destroy all auth tokens, logging the user out, and
	 * destroy the stored PIN, requiring it be set up on next log in.
	 */
	nukeStorage: typeof nukeStorage;
};

/**
 * The current state of the config (read-only). Initialises as null, should only be accessed via
 * the {@link useConfigState | `useConfigState()` hook}.
 */
const ConfigStateContext = React.createContext<Configs | null>(null);

/**
 * The methods that allow updating of the configs. Initialises as null, should only be accessed via
 * the {@link useConfigUpdate | `useConfigUpdate()` hook}.
 */
const ConfigUpdateContext = React.createContext<ConfigUpdateMethods | null>(null);

type ConfigInjectorProps = {
	/**
	 * The rest of the app: *this provider must sit at the top of the tree*.
	 */
	children: React.ReactNode;
	/**
	 * If in test mode, several properties will be prefilled and configuration of Auth will be skipped.
	 *
	 * @defaultValue false
	 */
	isInTestMode?: boolean;
	/**
	 * An object containing the configuration for a Cognito CUSTOM_FLOW, initialised
	 * using {@link https://docs.amplify.aws/lib/auth/start/q/platform/js/#re-use-existing-authentication-resource | AWS Amplify's `Auth.config` function}.
	 *
	 * @defaultValue undefined
	 */
	awsCustomFlowClientConfig?: any;
	/**
	 * An object containing the configuration for a Cognito USERNAME_PASSWORD flow, initialised
	 * using {@link https://docs.amplify.aws/lib/auth/start/q/platform/js/#re-use-existing-authentication-resource | AWS Amplify's `Auth.config` function}.
	 *
	 * NOTE: this method of auth is not recommended by AWS, is is marked as legacy -- it sends
	 * the username/password over the wire, so is susceptible to attack.
	 *
	 * @defaultValue undefined
	 */
	awsUsernamePasswordClientConfig?: any;
	/**
	 * A defined device security type should you wish to preconfigure the config (for example, if you are writing
	 * an integration test for a specific flow).
	 *
	 * @defaultValue "NONE"
	 */
	initialDeviceSecurityType?: DeviceSecurityType;
	/**
	 * A defined login flow type should you wish to preconfigure the config (for example, if you are writing
	 * an integration test for a specific flow).
	 *
	 * @defaultValue "OTP"
	 */
	initialLoginFlowType?: LoginFlowType;
	/**
	 * A defined UI display preference should you wish to preconfigure the config. If you are writing
	 * an integration test for a specific flow, you probably do not want all the stages visible as that
	 * would then require granular targeting of elements in the test. If you are developing/debugging
	 * having all the stages visible is likely to be useful.
	 *
	 * @defaultValue "MOUNT_WHEN_ACTIVE"
	 */
	initialUiLayout?: UiLayout;
	/**
	 * Whether to open the app with dev tools activated.
	 *
	 * @defaultValue "DEV_TOOLS_INACTIVE"
	 */
	initialDevToolsStatus?: DevTools;
};

/**
 * A React provider that combines the read/write context providers that manage the configuration.
 *
 * @remarks
 * This needs to be placed at the very top of the component tree, as it affects everything in the app.
 * The default `initial{ConfigSetting}` props are present to allow
 */
export const ConfigInjector = ({
	awsCustomFlowClientConfig,
	awsUsernamePasswordClientConfig,
	initialDeviceSecurityType = "NONE",
	initialLoginFlowType = "OTP",
	initialUiLayout = "MOUNT_WHEN_ACTIVE",
	initialDevToolsStatus = "DEV_TOOLS_INACTIVE",
	isInTestMode = false,
	children,
}: ConfigInjectorProps) => {
	if (!isInTestMode && (!awsCustomFlowClientConfig || !awsUsernamePasswordClientConfig)) {
		throw new Error("The app is not in test mode: the AWS configs MUST be defined");
	}

	const [deviceSecurityType, setDeviceSecurityType] =
		React.useState<DeviceSecurityType>(initialDeviceSecurityType);
	const [loginFlowType, setLoginFlowType] = React.useState<LoginFlowType>(initialLoginFlowType);
	const [devToolsStatus, setDevToolsStatus] = React.useState<DevTools>(
		isInTestMode ? "DEV_TOOLS_INACTIVE" : initialDevToolsStatus
	);
	const [uiLayout, setUiLayout] = React.useState<UiLayout>(
		isInTestMode ? "MOUNT_WHEN_ACTIVE" : initialUiLayout
	);
	const [ready, setReady] = React.useState(isInTestMode);

	React.useEffect(() => {
		if (!isInTestMode) {
			// Setting the `ready` flag to false ensures that the rest of the app will be unmounted whilst local storage
			// checks take place.
			setReady(false);
			if (globalThis?.localStorage) {
				const storedDeviceSecurityType = globalThis.localStorage.getItem(
					CONFIG_STORAGE_KEY.DEVICE_SECURITY_TYPE
				);
				if (storedDeviceSecurityType == null) {
					localStorage.setItem(CONFIG_STORAGE_KEY.DEVICE_SECURITY_TYPE, deviceSecurityType);
				} else {
					setDeviceSecurityType(storedDeviceSecurityType as DeviceSecurityType);
				}
				const storedLoginFlowType = globalThis.localStorage.getItem(
					CONFIG_STORAGE_KEY.LOGIN_FLOW_TYPE
				);
				if (storedLoginFlowType == null) {
					localStorage.setItem(CONFIG_STORAGE_KEY.LOGIN_FLOW_TYPE, loginFlowType);
				} else {
					setLoginFlowType(storedLoginFlowType as LoginFlowType);
				}
				const storedDevToolsStatus = globalThis.localStorage.getItem(
					CONFIG_STORAGE_KEY.DEV_TOOLS_STATUS
				);
				if (storedDevToolsStatus == null) {
					localStorage.setItem(CONFIG_STORAGE_KEY.DEV_TOOLS_STATUS, devToolsStatus);
				} else {
					setDevToolsStatus(storedDevToolsStatus as DevTools);
				}
			}
			// Once the `ready` flag is `true`, rendering of the child components of the provider can occur.
			setReady(true);
		}
	}, [deviceSecurityType, loginFlowType, devToolsStatus, isInTestMode]);

	React.useEffect(() => {
		if (!isInTestMode) {
			switch (loginFlowType) {
				case "OTP":
					Auth.configure(awsCustomFlowClientConfig);
					break;
				case "USERNAME_PASSWORD":
					Auth.configure(awsUsernamePasswordClientConfig);
					break;
			}
		}
	}, [loginFlowType]);

	return ready ? (
		<ConfigUpdateContext.Provider value={{ nukeStorage, updateCoreConfig, setUiLayout }}>
			<ConfigStateContext.Provider
				value={{ loginFlowType, deviceSecurityType, uiLayout, devToolsStatus, isInTestMode }}
			>
				{children}
			</ConfigStateContext.Provider>
		</ConfigUpdateContext.Provider>
	) : null;
};

/**
 * Access the read-only {@link ConfigStateContext | `ConfigState` context values}.
 */
export function useConfigState(): Configs {
	const configs = React.useContext(ConfigStateContext);

	if (!configs)
		throw new Error("useConfigState must be below the ConfigInjector in the component tree");

	return configs;
}

/**
 * Access the {@link ConfigUpdateContext | `ConfigUpdateContext` methods}.
 */
export function useConfigUpdate(): ConfigUpdateMethods {
	const configSwitchers = React.useContext(ConfigUpdateContext);

	if (!configSwitchers)
		throw new Error("useConfigSwitcher must be below the FlowSwitchProvider in the component tree");

	return configSwitchers;
}
