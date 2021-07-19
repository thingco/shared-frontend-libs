import { useAuthState, useAuthUpdate } from "@thingco/auth-flows";
import * as React from "react";

export const Authorised = () => {
	const { inAuthorisedState } = useAuthState();
	const { logOut, changeCurrentPin /*, changeDeviceSecurityType */ } = useAuthUpdate();

	return inAuthorisedState ? (
		<section>
			<h1>Logged in stuff!</h1>
			<button onClick={() => logOut()}>Log out</button>
			<button onClick={() => changeCurrentPin()}>Change my current pin</button>
			{/* <fieldset>
			<select>
				<option />
			</select>
			</fieldset> */}
		</section>
	) : null;
};
