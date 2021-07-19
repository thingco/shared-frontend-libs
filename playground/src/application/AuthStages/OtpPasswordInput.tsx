import { useAuthUpdate } from "@thingco/auth-flows";
import React, { useState } from "react";

export const OtpPasswordInput = ({ isLoading }: { isLoading: boolean }) => {
	const { submitPassword } = useAuthUpdate();

	const [localOtpPassword, setLocalOtpPassword] = useState("");

	return (
		<section>
			<input
				type="text"
				value={localOtpPassword}
				onChange={(e) => setLocalOtpPassword(e.target.value)}
				disabled={isLoading}
			/>
			<button onClick={() => submitPassword(localOtpPassword)} disabled={isLoading}>
				Submit OTP
			</button>
		</section>
	);
};
