/**
 * The available states of the auth system FSM
 */
export enum AuthStateId {
	CheckingSession = "CheckingSession",
	INTERNAL__loginFlowCheck = "INTERNAL__loginFlowCheck",
	SubmittingOtpUsername = "SubmittingOtpUsername",
	SubmittingOtp = "SubmittingOtp",
	SubmittingUsernameAndPassword = "SubmittingUsernameAndPassword",
	SubmittingForceChangePassword = "SubmittingForceChangePassword",
	AuthenticatedChangingPassword = "AuthenticatedChangingPassword",
	ForgottenPasswordRequestingReset = "ForgottenPasswordRequestingReset",
	ForgottenPasswordSubmittingReset = "ForgottenPasswordSubmittingReset",
	INTERNAL__deviceSecurityCheck = "INTERNAL__deviceSecurityCheck",
	CheckingForPin = "CheckingForPin",
	SubmittingCurrentPin = "SubmittingCurrentPin",
	SubmittingNewPin = "SubmittingNewPin",
	ForgottenPinRequestingReset = "ForgottenPinRequestingReset",
	AuthenticatedValidatingPin = "AuthenticatedValidatingPin",
	AuthenticatedChangingPin = "AuthenticatedChangingPin",
	AuthenticatedPinChangeSuccess = "AuthenticatedPinChangeSuccess",
	AuthenticatedLoggingOut = "AuthenticatedLoggingOut",
	Authenticated = "Authenticated",
	AuthenticatedPasswordChangeSuccess = "AuthenticatedPasswordChangeSuccess",
	ForgottenPasswordResetSuccess = "ForgottenPasswordResetSuccess",
}
