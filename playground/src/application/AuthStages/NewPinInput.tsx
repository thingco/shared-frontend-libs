import { useAuthUpdate } from "@thingco/auth-flows";
import React, { useState } from "react";

export const NewPinInput = ({ isLoading }: { isLoading: boolean }) => {
	const { submitNewPin, skipPinSetup } = useAuthUpdate();

	const [localPin, setLocalPin] = useState("");

	return (
		<section>
			<input
				type="email"
				value={localPin}
				onChange={(e) => setLocalPin(e.target.value)}
				disabled={isLoading}
			/>
			<button onClick={() => submitNewPin(localPin)} disabled={isLoading}>
				Add new pin
			</button>
			<button onClick={() => skipPinSetup()}>Skip pin setup</button>
		</section>
	);
};
