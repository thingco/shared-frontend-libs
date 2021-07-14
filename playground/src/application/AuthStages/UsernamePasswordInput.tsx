import { useAuthState, useAuthUpdate } from "@thingco/auth-flows";
import React from "react";

export const UsernamePasswordInput = () => {
	const { inUsernamePasswordInputState, isLoading } = useAuthState();
	const { submitUsernameAndPassword } = useAuthUpdate();

	const [localUsername, setLocalUsername] = React.useState("");
	const [localPassword, setLocalPassword] = React.useState("");

	return inUsernamePasswordInputState ? (
		<section style={{ opacity: inUsernamePasswordInputState ? 1 : 0.25 }}>
			<input
				type="email"
				value={localUsername}
				onChange={(e) => setLocalUsername(e.target.value)}
				disabled={!inUsernamePasswordInputState}
			/>
			<input
				type="text"
				value={localPassword}
				onChange={(e) => setLocalPassword(e.target.value)}
				disabled={!inUsernamePasswordInputState}
			/>
			<button
				onClick={() => submitUsernameAndPassword(localUsername, localPassword)}
				disabled={isLoading}
			>
				Submit email and password
			</button>
		</section>
	) : null;
};
