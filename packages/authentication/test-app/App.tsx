import React from "react";
import classnames from "classnames";

import { AuthProvider, useAuthProvider } from "..";
import {
	ConfigInjector,
	CONFIG_STORAGE_KEY,
	UiLayout,
	useConfigState,
	useConfigUpdate,
} from "./ConfigInjector";
import { ConfigToolbar } from "./ConfigToolbar";
import * as AuthStage from "./stages";

import { DeviceSecurityType, LoginFlowType } from "../types";

const awsCustomFlowClientConfig = {
	region: "eu-west-1",
	userPoolId: "eu-west-1_ALKzWpcBv",
	userPoolWebClientId: "141rcrvnpc2vktj9mbjrmok0l4",
	authenticationFlowType: "CUSTOM_AUTH",
};

const awsUsernamePasswordClientConfig = {
	region: "eu-west-1",
	userPoolId: "eu-west-1_ALKzWpcBv",
	userPoolWebClientId: "6puatgps30nq9rf1f3aqoo84t5",
	authenticationFlowType: "USER_PASSWORD_AUTH",
};

const AuthenticationConfig = () => {
	const { loginFlowType, deviceSecurityType, uiLayout, devToolsStatus } = useConfigState();
	const { setUiLayout, nukeStorage } = useConfigUpdate();
	const [toolbarOpen, setToolbarOpen] = React.useState(false);

	return (
		<ConfigToolbar toolbarOpen={toolbarOpen}>
			<ConfigToolbar.MenuControl toolbarOpen={toolbarOpen} setToolbarOpen={setToolbarOpen} />
			<ConfigToolbar.Menu active={toolbarOpen}>
				<ConfigToolbar.MenuItem
					label="Set login flow"
					description="Do you want to demo OTP login flow or username and password flow?"
				>
					<ConfigToolbar.CoreConfigSwitchInput
						label="Set login flow"
						storageKey={CONFIG_STORAGE_KEY.LOGIN_FLOW_TYPE}
						options={["OTP", "USERNAME_PASSWORD"] as LoginFlowType[]}
						value={loginFlowType}
					/>
				</ConfigToolbar.MenuItem>
				<ConfigToolbar.MenuItem
					label="Set device security type"
					description="Do you want to demo PIN security or turn off device security (NONE)?"
				>
					<ConfigToolbar.CoreConfigSwitchInput
						label="Device security"
						storageKey={CONFIG_STORAGE_KEY.DEVICE_SECURITY_TYPE}
						options={["NONE", "PIN"] as DeviceSecurityType[]}
						value={deviceSecurityType}
					/>
				</ConfigToolbar.MenuItem>
				<ConfigToolbar.MenuItem
					label="UI Layout"
					description="You can view the demo with either all stages visible on-screen, or you can make it closer to real-life usage by having each stage unmount when inactive."
				>
					<ConfigToolbar.StateSwitchInput
						label="UI Layout"
						options={["SHOW_ALL_STAGES", "MOUNT_WHEN_ACTIVE"] as UiLayout[]}
						value={uiLayout}
						callback={setUiLayout}
					/>
				</ConfigToolbar.MenuItem>
				<ConfigToolbar.MenuItem
					label="Use dev tools"
					description="Turn the XState inspector on or off."
				>
					<ConfigToolbar.CoreConfigToggleInput
						label="Use dev tools"
						storageKey={CONFIG_STORAGE_KEY.DEV_TOOLS_STATUS}
						on="DEV_TOOLS_ACTIVE"
						off="DEV_TOOLS_INACTIVE"
						value={devToolsStatus}
					/>
				</ConfigToolbar.MenuItem>
				<ConfigToolbar.MenuItem
					label="Nuke local storage"
					description="Do you want to nuke local storage and reload the app?"
				>
					<ConfigToolbar.ButtonAction label="nuke" action={nukeStorage} />
				</ConfigToolbar.MenuItem>
			</ConfigToolbar.Menu>
		</ConfigToolbar>
	);
};

const AuthenticationOverview = () => {
	const { deviceSecurityType, loginFlowType, uiLayout, isInTestMode } = useConfigState();
	const { currentState } = useAuthProvider();
	return (
		<header
			role="banner"
			aria-labelledby="bannerTitle"
			aria-describedby="bannerMeta"
			className="auth-app__header"
		>
			<h1 id="bannerTitle" className="auth-app__header__title">
				Authentication
			</h1>
			<dl id="bannerMeta" className="auth-app__header__meta metalist">
				<div className="metalist__property">
					<dt className="metalist__property-key">Current state ID:</dt>
					<dd className="metalist__property-value">{currentState}</dd>
				</div>
				<div className="metalist__property">
					<dt className="metalist__property-key">Login flow type:</dt>
					<dd className="metalist__property-value">{loginFlowType}</dd>
				</div>
				<div className="metalist__property">
					<dt className="metalist__property-key">Device Security Type:</dt>
					<dd className="metalist__property-value">{deviceSecurityType}</dd>
				</div>
				<div className="metalist__property">
					<dt className="metalist__property-key">Display preferences:</dt>
					<dd className="metalist__property-value">{uiLayout}</dd>
				</div>
			</dl>
			{!isInTestMode && <AuthenticationConfig />}
		</header>
	);
};

export const Authentication = () => {
	const { loginFlowType, deviceSecurityType, uiLayout, devToolsStatus } = useConfigState();

	return (
		<AuthProvider
			loginFlowType={loginFlowType}
			deviceSecurityType={deviceSecurityType}
			useDevTools={devToolsStatus === "DEV_TOOLS_ACTIVE"}
		>
			<div
				className={classnames("auth-app", {
					"auth-app--all-stages-layout": uiLayout === "SHOW_ALL_STAGES",
					"auth-app--single-stage-layout": uiLayout === "MOUNT_WHEN_ACTIVE",
				})}
			>
				<AuthenticationOverview />
				<main className="auth-stages">
					<AuthStage.CheckingForSession />
					<AuthStage.SubmittingOtpUsername />
					<AuthStage.SubmittingOtp />
					<AuthStage.SubmittingUsernameAndPassword />
					<AuthStage.SubmittingForceChangePassword />
					<AuthStage.ForgottenPasswordRequestingReset />
					<AuthStage.ForgottenPasswordSubmittingReset />
					<AuthStage.ForgottenPasswordResetSuccess />
					<AuthStage.CheckingForPin />
					<AuthStage.SubmittingCurrentPin />
					<AuthStage.SubmittingNewPin />
					<AuthStage.ForgottenPinRequestingReset />
					<AuthStage.Authenticated />
					<AuthStage.AuthenticatedChangingPassword />
					<AuthStage.AuthenticatedPasswordChangeSuccess />
					<AuthStage.AuthenticatedValidatingPin />
					<AuthStage.AuthenticatedChangingPin />
					<AuthStage.AuthenticatedPinChangeSuccess />
					<AuthStage.AuthenticatedLoggingOut />
				</main>
			</div>
		</AuthProvider>
	);
};

export const App = () => (
	<ConfigInjector
		awsCustomFlowClientConfig={awsCustomFlowClientConfig}
		awsUsernamePasswordClientConfig={awsUsernamePasswordClientConfig}
	>
		<Authentication />
	</ConfigInjector>
);
