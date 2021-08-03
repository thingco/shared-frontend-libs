import { useAuthUpdate } from "@thingco/auth-flows";
import React from "react";

export const UsernameAndPasswordInput = ({ isLoading }: { isLoading: boolean }) => {
	const { submitUsernameAndPassword } = useAuthUpdate();

	const [localUsername, setLocalUsername] = React.useState("");
	const [localPassword, setLocalPassword] = React.useState("");

	return (
		<section>
			<input
				type="email"
				value={localUsername}
				onChange={(e) => setLocalUsername(e.target.value)}
				disabled={isLoading}
			/>
			<input
				type="text"
				value={localPassword}
				onChange={(e) => setLocalPassword(e.target.value)}
				disabled={isLoading}
			/>
			<button
				onClick={() => submitUsernameAndPassword(localUsername, localPassword)}
				disabled={isLoading}
			>
				Submit email and password
			</button>
		</section>
	);
};
