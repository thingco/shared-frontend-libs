import { useAuthenticated } from "../useAuthenticated";
import { useAuthenticatedChangingPassword } from "../useAuthenticatedChangingPassword";
import { useAuthenticatedChangingPin } from "../useAuthenticatedChangingPin";
import { useAuthenticatedLoggingOut } from "../useAuthenticatedLoggingOut";
import { useAuthenticatedPasswordChangeSuccess } from "../useAuthenticatedPasswordChangeSuccess";
import { useAuthenticatedValidatingPin } from "../useAuthenticatedValidatingPin";
import { useCheckingForPin } from "../useCheckingForPin";
import { useCheckingForSession } from "../useCheckingForSession";
import { useForgottenPasswordRequestingReset } from "../useForgottenPasswordRequestingReset";
import { useForgottenPasswordResetSuccess } from "../useForgottenPasswordResetSuccess";
import { useForgottenPasswordSubmittingReset } from "../useForgottenPasswordSubmittingReset";
import { useForgottenPinRequestingReset } from "../useForgottenPinRequestingReset";
import { useSubmittingCurrentPin } from "../useSubmittingCurrentPin";
import { useSubmittingForceChangePassword } from "../useSubmittingForceChangePassword";
import { useSubmittingNewPin } from "../useSubmittingNewPin";
import { useSubmittingOtp } from "../useSubmittingOtp";
import { useSubmittingOtpUsername } from "../useSubmittingOtpUsername";
import { useSubmittingUsernameAndPassword } from "../useSubmittingUsernameAndPassword";

/**
 * The tests loop through the available hooks. This means:
 *
 * 1. can test that every exposed state in the FSM is covered with a hook.
 * 2. can generate tests from a small data structure that is looped over rather than writing a seperate test for each hook.
 *
 * To make things easier to do the above, all the hooks are given a namespace for the tests.
 */
export const AuthHook = {
	useAuthenticated,
	useAuthenticatedChangingPassword,
	useAuthenticatedPasswordChangeSuccess,
	useAuthenticatedChangingPin,
	useAuthenticatedLoggingOut,
	useAuthenticatedValidatingPin,
	useCheckingForPin,
	useCheckingForSession,
	useSubmittingForceChangePassword,
	useForgottenPasswordRequestingReset,
	useForgottenPasswordResetSuccess,
	useForgottenPasswordSubmittingReset,
	useForgottenPinRequestingReset,
	useSubmittingCurrentPin,
	useSubmittingNewPin,
	useSubmittingOtp,
	useSubmittingOtpUsername,
	useSubmittingUsernameAndPassword,
};
