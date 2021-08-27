import { useAuthUpdate } from "@thingco/auth-flows";
import React from "react";

export const ChangeTemporaryPasswordInput = ({ isLoading }: { isLoading: boolean }) => {
	const { submitNewPassword } = useAuthUpdate();

	const [localPassword, setLocalPassword] = React.useState("");
	const [localNewPassword, setLocalNewPassword] = React.useState("");

	return (
		<section>
			<input
				type="text"
				value={localPassword}
				onChange={(e) => setLocalPassword(e.target.value)}
				disabled={isLoading}
			/>

			<input
				type="text"
				value={localNewPassword}
				onChange={(e) => setLocalNewPassword(e.target.value)}
				disabled={isLoading}
			/>
			<button
				onClick={() => submitNewPassword(localPassword, localNewPassword)}
				disabled={isLoading}
			>
				Submit password
			</button>
		</section>
	);
};
