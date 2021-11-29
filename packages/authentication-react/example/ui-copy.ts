/**
 * This is essentially a mock translations file.
 * By putting all of the copy in here, it also makes life
 * a lot easier  with respect to integration tests.
 */

const uiText = {
	banner: {
		meta: {
			term: {
				currentState: "Current state ID",
				currentUiLayout: "Display preference",
				currentDeviceSecurityType: "Device security type",
				currentLoginFlowType: "Login flow type",
				currentAllowedOtpRetries: "Allowed OTP Retries",
				currentPinLength: "PIN Length",
			},
		},
	},
	authStages: {
		common: {
			meta: {
				term: {
					isLoading: "Loading",
					error: "Error message",
					passwordAttemptsMade: "Password attempts made",
				},
			},
		},
		authenticated: {
			description: `
The user is now authenticated. They have navigated login and a token is
stored locally. They have set up/input a PIN (if that is a requirement).
\n\n
From this state, they can log out, change their password (if the login
flow is USERNAME_PASSWORD) and change their PIN (if PIN is a requirement).
		`,
			controlLabels: {
				logOut: "Log out",
				changePin: "Change my PIN",
				changePassword: "Change my password",
			},
		},
		authenticatedChangingPassword: {
			description: `
The user is already authenticated on USERNAME_PASSWORD flow and has requested
that they wish to change their password.
\n\n
They may cancel this request at this point, but if they continue, the method
provided by the state hook accepts the current password and the new password.
In the actual app, it may be provident to double up on the new password input
("enter your new password"/"confirm your new password") to ensure that the user
has correctly entered the password they wanted.
			`,
			controlLabels: {
				currentPasswordInput: "Enter your current password",
				newPasswordInput: "Enter your new password",
				changePassword: "Change password",
				cancelChangePassword: "Cancel password change",
			},
		},
		authenticatedChangingPin: {
			description: `
The user is already authenticated, is using PIN security, has requested
that they wish to change their PIN, and they have confirmed their current PIN.
They can now enter a new PIN. Note that they may still cancel the change
request at this point.
			`,
			controlLabels: {
				enterPinInput: "Enter your PIN",
				submitPin: "Submit your new PIN",
				cancelPinChange: "Cancel PIN change",
			},
		},
		authenticatedLoggingOut: {
			description: `
This stage describes a situation where the user is authenticated but wishes
to log out. It's split into a separate state to make it easier to handle
cancellation. So from "Authenticated", they indicate they wish to log out. Then
they move to this state, where they can either confirm log out or cancel.
\n\n
In an actual app, this can likely be best implemented via a popup modal.
			`,
			controlLabels: {
				logOut: "Log me out!",
				cancelLogOut: "Cancel log out",
			},
		},
		authenticatedPasswordChangeSuccess: {
			description: `
The user is authenticated using USERNAME_PASSWORD flow and has successfully
changed their password.
\n\n
This state exists to make it easier to communicate this information to the user,
and to make it easier [from a navigation structure point of view] for the
user to return to the place in the app from where they started the password
change process. In an actual app, this could simply be a popup or flash,
either timed or with a confirm button.
			`,
			controlLabels: {
				confirm: "Confirm",
			},
		},
		authenticatedPinChangeSuccess: {
			description: `
The user is authenticated using PIN device security and has successfully
changed their PIN.
\n\n
This state exists to make it easier to communicate this information to the user,
and to make it easier [from a navigation structure point of view] for the
user to return to the place in the app from where they started the password
change process. In an actual app, this could simply be a popup or flash,
either timed or with a confirm button.
			`,
			controlLabels: {
				confirm: "Confirm",
			},
		},
		authenticatedValidatingPin: {
			description: `
The user is already authenticated, is using PIN security, and has requested
that they wish to change their PIN. The user needs to validate their
current PIN before setting a new one. Note that they may cancel this request
at this point.
			`,
			controlLabels: {
				enterPin: "Enter your PIN",
				submitPin: "Validate your PIN",
				cancelPinChange: "Cancel PIN change",
			},
		},
		checkingForPin: {
			description: `
First stage of device security. The application using the
authentication system has to check to see if there is a stored
PIN. If there isn't, they'll have to set a new one. If there is,
they can move on to device security (if that is active).
\n\n
In a real app, this stage should occur automatically and be hidden
from the user.
			`,
			controlLabels: {
				checkForExistingPin: "Check for an existing PIN",
			},
		},
		checkingForSession: {
			description: `
Always the first stage of authentication. The application using the
authentication system has to check to see if there is a stored
token that indicates the user is already authenticated. If there
isn't, they'll have to log in. If there is, they can move on to
device security (if that is active).
\n\n
In a real app, this stage should occur automatically and be hidden
from the user.
			`,
			controlLabels: {
				checkForExistingSession: "Check for a session",
			},
		},
		forgottenPasswordRequestingReset: {
			description: `
If an unauthenticated user on USERNAME_PASSWORD flow has forgotten their
password, they can request a reset. The reset process is split into three
stages -- request, submit and success. If they continue by submitting their
username (i.e. their email address), then a code will be sent to them that
will allow them to pass the next stage (submission). Once the user has submitted
their email, they cannot back out -- the password will have been reset on the
system, so this stage also allows them a chance to cancel.
			`,
			controlLabels: {
				enterEmailInput: "Enter your email address",
				requestResetCode: "Submit",
				cancelPasswordReset: "Cancel",
			},
		},
		forgottenPasswordResetSuccess: {
			description: `
The user is unauthenticated using USERNAME_PASSWORD flow and has successfully
changed their password after indicating that they had forgotten their existing
password.
\n\n
This state exists to make it easier to communicate this information to the user.
In an actual app, this could simply be a popup or flash, either timed or
with a confirm button.
			`,
			controlLabels: {
				confirm: "Confirm",
			},
		},
		forgottenPasswordSubmittingReset: {
			description: `
An unauthenticated user on USERNAME_PASSWORD flow has forgotten their
password and have requested a reset. A code has been sent to them that
will allow them to pass this stage. So they need to enter the code plus
the new password. Note  that unfortunately, due to the way the AWS
libraries that interface with Cognito work, the code input and the new
password input cannot be split across stages -- the UI for this stage
must handle both.
\n\n
In the actual app, it may be provident to double up on the new password input
("enter your new password"/"confirm your new password") to ensure that the user
has correctly entered the password they wanted.
			`,
			controlLabels: {
				resetCodeInput: "Enter the reset code you have been sent",
				newPasswordInput: "Enter your new password",
				submitReset: "Submit reset code and new password",
				resendCode: "Resend the reset code",
			},
		},
		forgottenPinRequestingReset: {
			description: `
If an unauthenticated user using PIN security has forgotten their PIN,
they can request a reset. If they choose to continue, then the existing
PIN is cleared. However, for security, they are also logged out, so
the auth flow moves back to the start and they must reauthenticate in full.
Once the user has agreed to reset, they cannot back out, so this stage also
allows them a chance to cancel.
			`,
			controlLabels: {
				resetPin: "Reset PIN",
				cancelReset: "Cancel reset",
			},
		},
		submittingCurrentPin: {
			description: `
If PIN device security is active, if the user is already authenticated,
i.e. they have a valid authentication token already present, then they
are taken directly to this stage. If they have forgotten their PIN, they
may request a reset, but otherwise they will be fully authenticated and
allowed access to the app on successful submission.
			`,
			controlLabels: {
				pinInput: "Enter your PIN",
				submitPin: "Submit your PIN",
				forgotPin: "Forgotten PIN",
			},
		},
		submittingForceChangePassword: {
			description: `
The user is authenticated on USERNAME_PASSWORD flow, has successfully submitted
their username and password, but this is either the first time they have
authenticated against their account, or their password has been reset by an admin.
In this case, the password they currently have is temporary (it will have been
sent to them in plaintext), so they must change it. Once it has been changeded,
they are fully authenticated.
\n\n
In an actual app, it may be provident to double up on the new password input
("enter your new password"/"confirm your new password") to ensure that the user
has correctly entered the password they wanted.
			`,
			controlLabels: {
				newPasswordInput: "Enter your new password",
				submitPassword: "Submit your new password",
			},
		},
		submittingNewPin: {
			description: `
If PIN device security is active, when the user logs in they have to set a
new PIN. The PIN is wiped every time the user logs out, so this stage is
reached every time they go through the login flow.
\n\n
In the actual app, it may be provident to double up on the new PIN input
("enter your new PIN"/"confirm your new PIN") to ensure that the user
has correctly entered the PIN they wanted.
			`,
			controlLabels: {
				newPinInput: "Enter your new PIN",
				submitPin: "Submit your new PIN",
			},
		},
		submittingOtp: {
			description: `
A user on OTP login flow has submitted their username, and have been sent
a one-time password. From this stage, submitting that code successfully will
result in them being authenticated. They may also move back to the username
input stage should they have mis-entered something (or just wish to resend
the code).
			`,
			controlLabels: {
				otpInput: "Enter the code you were sent",
				submitOtp: "Submit the code",
				reenterUsername: "Re-enter your username",
			},
		},
		submittingOtpUsername: {
			description: `
OTP authentication flow requires that the user submit their username
foirst, in the form of an email address, which triggers the backend
to send them a one-time password (submission of which is the next stage).
			`,
			controlLabels: {
				otpUsernameInput: "Enter an email address",
				submitOtpUsername: "Submit your email address",
			},
		},
		submittingUsernameAndPassword: {
			description: `
USERNAME_PASSWORD authentication flow requires that the user submit
their username and their password. If they have forgotten the password,
they also have the option to request a reset. If this is the first time
they have logged into the account (or an admin has reset their password),
the next stage is to change the temporary password they have been assigned,
but otherwise they are authenticated if this stage is passed successfully.
			`,
			controlLabels: {
				usernameInput: "Enter an email address",
				passwordInput: "Enter your password",
				logIn: "Log in",
				forgotPassword: "Forgotten password",
			},
		},
	},
} as const;

export default uiText;
