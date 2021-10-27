import { useAuthUpdate } from "@thingco/auth-flows";
import React from "react";

export const PasswordInput = ({ isLoading }: { isLoading: boolean }) => {
	const { submitPassword } = useAuthUpdate();

	const [localPassword, setLocalPassword] = React.useState("");

	return (
		<section>
			<input
				type="text"
				value={localPassword}
				onChange={(e) => setLocalPassword(e.target.value)}
				disabled={isLoading}
			/>
			<button onClick={() => submitPassword(localPassword)} disabled={isLoading}>
				Submit password
			</button>
		</section>
	);
};
