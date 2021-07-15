import { useAuthState, useAuthUpdate } from "@thingco/auth-flows";
import * as React from "react";

export const OtpLoginFlowInit = () => {
	const { inOtpLoginFlowInitState, isLoading } = useAuthState();
	const { runSessionCheck } = useAuthUpdate();

	return inOtpLoginFlowInitState ? (
		<section>
			<button onClick={() => runSessionCheck()} disabled={isLoading}>
				Check session
			</button>
		</section>
	) : null;
};
