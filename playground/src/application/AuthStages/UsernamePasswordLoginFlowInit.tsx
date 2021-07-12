import { useAuthState, useAuthUpdate } from "@thingco/auth-flows";
import React from "react";

export const UsernamePasswordLoginFlowInit = () => {
	const { inUsernamePasswordLoginFlowInitState, isLoading } = useAuthState();
	const { runSessionCheck } = useAuthUpdate();

	return inUsernamePasswordLoginFlowInitState ? (
		<section
			style={{
				opacity: inUsernamePasswordLoginFlowInitState ? 1 : 0.25,
			}}
		>
			<button onClick={() => runSessionCheck()} disabled={isLoading}>
				Check session
			</button>
		</section>
	) : null;
};
