import { useAuthState, useAuthUpdate } from "@thingco/auth-flows";

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
