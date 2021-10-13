import { useAuthenticated } from "core/react/useAuthenticated";
import { useAuthenticatedChangingPassword } from "core/react/useAuthenticatedChangingPassword";
import { useAuthenticatedChangingPin } from "core/react/useAuthenticatedChangingPin";
import { useAuthenticatedLoggingOut } from "core/react/useAuthenticatedLoggingOut";
import { useAuthenticatedPasswordChangeSuccess } from "core/react/useAuthenticatedPasswordChangeSuccess";
import { useAuthenticatedValidatingPin } from "core/react/useAuthenticatedValidatingPin";
import { useCheckingForPin } from "core/react/useCheckingForPin";
import { useCheckingForSession } from "core/react/useCheckingForSession";
import { useForgottenPasswordRequestingReset } from "core/react/useForgottenPasswordRequestingReset";
import { useForgottenPasswordResetSuccess } from "core/react/useForgottenPasswordResetSuccess";
import { useForgottenPasswordSubmittingReset } from "core/react/useForgottenPasswordSubmittingReset";
import { useForgottenPinRequestingReset } from "core/react/useForgottenPinRequestingReset";
import { useSubmittingCurrentPin } from "core/react/useSubmittingCurrentPin";
import { useSubmittingForceChangePassword } from "core/react/useSubmittingForceChangePassword";
import { useSubmittingNewPin } from "core/react/useSubmittingNewPin";
import { useSubmittingOtp } from "core/react/useSubmittingOtp";
import { useSubmittingOtpUsername } from "core/react/useSubmittingOtpUsername";
import { useSubmittingUsernameAndPassword } from "core/react/useSubmittingUsernameAndPassword";

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
