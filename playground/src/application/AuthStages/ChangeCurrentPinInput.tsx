import { useAuthUpdate } from "@thingco/auth-flows";
import React, { useState } from "react";

export const ChangeCurrentPinInput = ({ isLoading }: { isLoading: boolean }) => {
	const { submitCurrentAndNewPin, skipPinSetup } = useAuthUpdate();

	const [localPin, setLocalPin] = useState("");
	const [localNewPin, setLocalNewPin] = useState("");

	return (
		<section>
			<input
				type="text"
				value={localPin}
				onChange={(e) => setLocalPin(e.target.value)}
				disabled={isLoading}
			/>
			<input
				type="text"
				value={localNewPin}
				onChange={(e) => setLocalNewPin(e.target.value)}
				disabled={isLoading}
			/>
			<button onClick={() => submitCurrentAndNewPin(localPin, localNewPin)} disabled={isLoading}>
				Submit pin
			</button>

			<button onClick={() => skipPinSetup()}>Skip pin setup</button>
		</section>
	);
};
