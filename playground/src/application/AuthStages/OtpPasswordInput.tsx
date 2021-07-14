import { useAuthState, useAuthUpdate } from "@thingco/auth-flows";
import React, { useState } from "react";

export const OtpPasswordInput = () => {
	const { inOtpPasswordInputState, isLoading } = useAuthState();
	const { submitPassword } = useAuthUpdate();

	const [localOtpPassword, setLocalOtpPassword] = useState("");

	return inOtpPasswordInputState ? (
		<section style={{ opacity: inOtpPasswordInputState ? 1 : 0.25 }}>
			<input
				type="text"
				value={localOtpPassword}
				onChange={(e) => setLocalOtpPassword(e.target.value)}
				disabled={!inOtpPasswordInputState}
			/>
			<button onClick={() => submitPassword(localOtpPassword)} disabled={isLoading}>
				Submit OTP
			</button>
		</section>
	) : null;
};
