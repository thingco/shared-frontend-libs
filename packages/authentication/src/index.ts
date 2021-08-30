import {
	useAuthenticated,
	useChangingPassword,
	useChangingPin,
	useCheckingForPin,
	useCheckingForSession,
	useLoggingOut,
	useRequestingPasswordReset,
	useResettingPin,
	useSubmittingCurrentPin,
	useSubmittingForceChangePassword,
	useSubmittingNewPin,
	useSubmittingOtp,
	useSubmittingOtpUsername,
	useSubmittingPasswordReset,
	useSubmittingUsernameAndPassword,
} from "./auth-system-hooks";

export const AuthStage = {
	useSubmittingCurrentPin,
	useSubmittingForceChangePassword,
	useSubmittingNewPin,
	useSubmittingOtp,
	useSubmittingOtpUsername,
	useRequestingPasswordReset,
	useSubmittingPasswordReset,
	useCheckingForSession,
	useSubmittingUsernameAndPassword,
	useCheckingForPin,
	useResettingPin,
};

export { useAuthenticated, useChangingPassword, useChangingPin, useLoggingOut };

export { AuthProvider } from "./AuthSystemProvider";
export { createAuthenticationSystem } from "./auth-system";

export * from "./types";
