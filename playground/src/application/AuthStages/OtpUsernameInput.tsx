import { useAuthUpdate } from "@thingco/auth-flows";
import React, { useState } from "react";

export const OtpUsernameInput = ({ isLoading }: { isLoading: boolean }) => {
	const { submitUsername } = useAuthUpdate();

	const [localOtpUsername, setLocalOtpUsername] = useState("");

	return (
		<section>
			<input
				type="email"
				value={localOtpUsername}
				onChange={(e) => setLocalOtpUsername(e.target.value)}
				disabled={isLoading}
			/>
			<button onClick={() => submitUsername(localOtpUsername)} disabled={isLoading}>
				Submit email
			</button>
		</section>
	);
};
