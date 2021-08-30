import {
	useAuthenticated,
	useAwaitingChangePassword,
	useAwaitingChangePinInput,
	useAwaitingCurrentPinInput,
	useAwaitingForcedChangePassword,
	useAwaitingNewPinInput,
	useAwaitingOtp,
	useAwaitingOtpUsername,
	useAwaitingPasswordResetRequest,
	useAwaitingPasswordResetSubmission,
	useAwaitingSessionCheck,
	useAwaitingUsernameAndPassword,
	useLoggingOut,
	usePinChecks,
	useResettingPin,
} from "./auth-system-hooks";

export const AuthStage = {
	useAwaitingCurrentPinInput,
	useAwaitingForcedChangePassword,
	useAwaitingNewPinInput,
	useAwaitingOtp,
	useAwaitingOtpUsername,
	useAwaitingPasswordResetRequest,
	useAwaitingPasswordResetSubmission,
	useAwaitingSessionCheck,
	useAwaitingUsernameAndPassword,
	usePinChecks,
	useResettingPin,
};

export const Auth = {
	useAuthenticated,
	useAwaitingChangePassword,
	useAwaitingChangePinInput,
	useLoggingOut,
};

export { AuthProvider } from "./AuthSystemProvider";
export { createAuthenticationSystem } from "./auth-system";

export * from "./types";
