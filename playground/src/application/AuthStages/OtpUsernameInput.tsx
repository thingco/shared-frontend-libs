import { useAuthState, useAuthUpdate } from "@thingco/auth-flows";
import React, { useState } from "react";

export const OtpUsernameInput = () => {
	const { inOtpUsernameInputState, isLoading } = useAuthState();
	const { submitUsername } = useAuthUpdate();

	const [localOtpUsername, setLocalOtpUsername] = useState("");

	return inOtpUsernameInputState ? (
		<section style={{ opacity: inOtpUsernameInputState ? 1 : 0.25 }}>
			<input
				type="email"
				value={localOtpUsername}
				onChange={(e) => setLocalOtpUsername(e.target.value)}
				disabled={!inOtpUsernameInputState}
			/>
			<button onClick={() => submitUsername(localOtpUsername)} disabled={isLoading}>
				Submit email
			</button>
		</section>
	) : null;
};
