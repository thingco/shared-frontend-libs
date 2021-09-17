import React from "react";

import { AuthProvider, createAuthenticationSystem } from "..";
import * as AuthStage from "./AuthStages";

const loginFlowType: "OTP" | "USERNAME_PASSWORD" = "USERNAME_PASSWORD";

const authenticationSystem = createAuthenticationSystem({
	loginFlowType: loginFlowType,
	deviceSecurityType: "PIN",
});

export const App = () => (
	<AuthProvider authenticationSystem={authenticationSystem} useDevTools={true}>
		<article className="app-section auth-stages">
			<header className="app-section__header">
				<h2>Auth flow</h2>
			</header>
			<AuthStage.CheckingForSession />
			{/* @ts-expect-error hardcoded variable */}
			{loginFlowType === "OTP" ? (
				<>
					<AuthStage.OtpUsernameInput />
					<AuthStage.OtpInput />
				</>
			) : (
				<>
					<AuthStage.UsernamePasswordInput />
					<AuthStage.ResetPasswordUsernameInput />
					<AuthStage.ResetPasswordOtpPasswordInput />
					<AuthStage.PasswordChangedSuccess />
				</>
			)}
			<AuthStage.Authenticated />
			<AuthStage.LoggingOut />
			<AuthStage.CheckPin />
			<AuthStage.CurrentPinInput />
			<AuthStage.NewPinInput />
			<AuthStage.ValidatePinInput />
			<AuthStage.ChangePinInput />
		</article>
	</AuthProvider>
);
