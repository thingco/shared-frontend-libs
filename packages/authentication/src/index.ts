import {
	useAuthenticated,
	useChangingPassword,
	useChangingPin,
	useCheckingForPin,
	useCheckingForSession,
	usePasswordChangedSuccess,
	usePasswordResetSuccess,
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
	useValidatingPin,
} from "./auth-system-hooks";

export const AuthStage = {
	useValidatingPin,
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
	usePasswordChangedSuccess,
	usePasswordResetSuccess,
	useSubmittingOtpUsername,
	useSubmittingPasswordReset,
	useSubmittingUsernameAndPassword,
};

export { useAuthenticated, useChangingPassword, useChangingPin, useLoggingOut, useValidatingPin };

export { AuthProvider } from "./AuthSystemProvider";
export { createAuthenticationSystem } from "./auth-system";

export * from "./types";
