import { useAuthUpdate } from "@thingco/auth-flows";
import * as React from "react";

export const OtpLoginFlowInit = ({ isLoading }: { isLoading: boolean }) => {
	const { runSessionCheck } = useAuthUpdate();

	return (
		<section>
			<button onClick={() => runSessionCheck()} disabled={isLoading}>
				Check session
			</button>
		</section>
	);
};
