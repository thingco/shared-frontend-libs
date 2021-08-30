import React from "react";

import { AuthProvider, createAuthenticationSystem } from "..";
import * as AuthStage from "./AuthStages";

const authenticationSystem = createAuthenticationSystem({
	loginFlowType: "OTP",
	deviceSecurityType: "PIN",
});

export const App = () => (
	<AuthProvider authenticationSystem={authenticationSystem} useDevTools={true}>
		<article className="app-section auth-stages">
			<header className="app-section__header">
				<h2>Auth flow</h2>
			</header>
			<AuthStage.CheckingForSession />
			<AuthStage.OtpUsernameInput />
			<AuthStage.OtpInput />
			<AuthStage.Authenticated />
			<AuthStage.LoggingOut />
			<AuthStage.CheckPin />
			<AuthStage.CurrentPinInput />
			<AuthStage.NewPinInput />
			<AuthStage.ChangePinInput />
		</article>
	</AuthProvider>
);
