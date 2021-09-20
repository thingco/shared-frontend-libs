/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useState } from "react";
import { createModel } from "@xstate/test";
import { cleanup, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMachine } from "xstate";

import { AuthStateId, createAuthenticationSystem } from "./auth-system";
import {
	useCheckingForSession,
	useCheckingForPin,
	useResettingPin,
	useRequestingPasswordReset,
	useSubmittingPasswordReset,
	useSubmittingForceChangePassword,
	useSubmittingNewPin,
	useSubmittingOtp,
	useSubmittingOtpUsername,
	useSubmittingCurrentPin,
	useSubmittingUsernameAndPassword,
	useAuthenticated,
	useLoggingOut,
} from "./auth-system-hooks";

import type { RenderResult } from "@testing-library/react";
import type { ReactNode } from "react";
import { AuthProvider, useAuthProvider } from "./AuthSystemProvider";
import { AuthError } from "./types";

/* ========================================================================= *\
 * 1. UTILITIES
 * 2. SETUP
 * 3. SYSTEM UNDER TEST
 * 4. TESTS
\* ========================================================================= */

/* ------------------------------------------------------------------------- *\
 * 1. UTILITIES
\* ------------------------------------------------------------------------- */

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ------------------------------------------------------------------------- *\
 * 2. SETUP
\* ------------------------------------------------------------------------- */

const VALID_USERNAME = "validuser@example.com";
const INVALID_USERNAME = "invaliduser@example.com";

const VALID_CODE = "123456";
const INVALID_CODE = "654321";

const VALID_PASSWORD = "validpassword";
const OLD_PASSWORD = "oldpassword";
const ANOTHER_VALID_PASSWORD = "anothervalidpassword";
const INVALID_PASSWORD = "invalidpassword";
const TEMPORARY_PASSWORD = "temporarypassword";

const USER_OBJECT = { description: "I represent the user object returned by the OAuth system" };

// prettier-ignore
const MockCb = {
	checkSessionCb: jest.fn(),
	validateOtpUsernameCb: jest.fn(async (username) => {
		await sleep(10);
		if (username === VALID_USERNAME) {
			return Promise.resolve(USER_OBJECT);
		} else {
			return Promise.reject();
		}
	}),
	validateOtpCb: jest.fn(async (_, otp) => {
		await sleep(10);
		if (otp === VALID_CODE) {
			return Promise.resolve(USER_OBJECT);
		} else {
			return Promise.reject()
		}
	}),
	validateUsernameAndPasswordCb: jest.fn(async (username, password) => {
		await sleep(10);
		if (username === VALID_USERNAME && password === VALID_PASSWORD) {
			return Promise.resolve(USER_OBJECT);
		} else if (username === VALID_USERNAME && password === OLD_PASSWORD) {
			return Promise.resolve(["NEW_PASSWORD_REQUIRED", USER_OBJECT]);
		} else {
			return Promise.reject();
		}
	}),
	validateForceChangePasswordCb: jest.fn(async (_, password) => {
		await sleep(10);
		if (password === VALID_PASSWORD) {
			return Promise.resolve();
		} else {
			return Promise.reject();
		}
	}),
	requestNewPasswordCb: jest.fn(async (username) => {
		if (username === VALID_USERNAME) {
			return Promise.resolve();
		} else {
			return Promise.reject();
		}
	}),
	submitNewPasswordCb: jest.fn((code, newPassword) => code === VALID_CODE && newPassword === VALID_PASSWORD ? Promise.resolve() : Promise.reject()),
	changePasswordCb: jest.fn((oldPassword, newPassword) => oldPassword === VALID_PASSWORD && newPassword === ANOTHER_VALID_PASSWORD ? Promise.resolve() : Promise.reject()),
	checkForExistingPinCb: jest.fn(),
	validatePinCb: jest.fn((pin: string) => pin === VALID_CODE ? Promise.resolve() : Promise.reject()),
	setNewPinCb: jest.fn((pin: string) => pin === VALID_CODE ? Promise.resolve() : Promise.reject()),
	changePinCb: jest.fn((newPin: string) => newPin === VALID_CODE ? Promise.resolve() : Promise.reject()),
	logOutCb: jest.fn(),
}

/* ------------------------------------------------------------------------- *\
 * 3. SYSTEM UNDER TEST
\* ------------------------------------------------------------------------- */

/**
 * This is a model auth system, to be run using the react testing library + @xstate/test model test.
 *
 * It's built to allow the tests to operate as if a real user were using them.
 *
 * 3a. UTILITY COMPONENTS
 * 3b. AUTHENTICATION STAGE COMPONENTS
 * 3c. APPLICATION WRAPPER
 */

/* ------------------------------------------------------------------------- *\
 * 3a. UTILITY COMPONENTS
\* ------------------------------------------------------------------------- */

/**
 * Every stage has a primary method that submits data, and requires a form
 */
const Form = ({
	children,
	submitCb,
	cbParams,
}: {
	children: React.ReactNode;
	submitCb: (...args: any[]) => void;
	cbParams?: any[];
}) => (
	<form
		className="form"
		onSubmit={(e) => {
			e.preventDefault();
			cbParams ? submitCb(...cbParams) : submitCb();
		}}
	>
		{children}
	</form>
);

/**
 * To easily disable all form elements when {something} happens, wrap them in a fieldset.
 */
const FormElements = ({ children, isDisabled }: { children: ReactNode; isDisabled: boolean }) => (
	<fieldset disabled={isDisabled}>{children}</fieldset>
);

/**
 * One input group contains renders one text input. Can just have text inputs for testing purposes.
 */
const FormInputGroup = ({
	id,
	label,
	validationErrors,
	value,
	valueSetter,
}: {
	id: string;
	label: string;
	validationErrors: string[];
	value: string;
	valueSetter: (v: string) => void;
}) => (
	<>
		<label htmlFor={id}>{label}</label>
		<input
			id={id}
			name={id}
			type="text"
			value={value}
			onChange={(e) => valueSetter(e.target.value)}
		/>
		{validationErrors.map((errorMsg) => (
			<p key={errorMsg.toLowerCase().replace(/s+/g, "")}>{errorMsg}</p>
		))}
	</>
);

/** A stage may have one or more secondary actions which immediately trigger a state change. */
const FormSecondaryAction = ({
	actionCallback,
	label,
}: {
	actionCallback: () => void;
	label: string;
}) => (
	<button type="button" onClick={() => actionCallback()}>
		{label}
	</button>
);

const FormSubmit = ({ label }: { label: string }) => <button type="submit">{label}</button>;

Form.Elements = FormElements;
Form.InputGroup = FormInputGroup;
Form.SecondaryAction = FormSecondaryAction;
Form.Submit = FormSubmit;

const AuthStageTestReporter = ({
	errorMsg = "",
	isLoading,
	stageId,
}: {
	errorMsg: string;
	isLoading: boolean;
	stageId: AuthStateId;
}) => (
	<header title={stageId}>
		<p>Stage: {stageId}</p>
		<p>Loading: {isLoading.toString()}</p>
		<p>Error: {errorMsg || "n/a"}</p>
	</header>
);

const AuthOverallTestReporter = () => {
	const { currentState, loginFlowType, deviceSecurityType } = useAuthProvider();

	return (
		<header title="Auth system reporter">
			<p>Current stage: {currentState}</p>
			<p>Current login flow: {loginFlowType}</p>
			<p>Current device security: {deviceSecurityType}</p>
		</header>
	);
};

/* ------------------------------------------------------------------------- *\
 * 3b. AUTHENTICATION STAGE COMPONENTS
\* ------------------------------------------------------------------------- */

function CheckingForSession() {
	const { error, isLoading, isActive, checkSession } = useCheckingForSession(MockCb.checkSessionCb);

	return isActive ? (
		<section>
			<AuthStageTestReporter
				stageId={AuthStateId.CheckingForSession}
				isLoading={isLoading}
				errorMsg={error}
			/>
			<Form submitCb={checkSession}>
				<Form.Submit label="Check for a session" />
			</Form>
		</section>
	) : null;
}

function OtpUsername() {
	const { error, isLoading, isActive, validateUsername, validationErrors } =
		useSubmittingOtpUsername(MockCb.validateOtpUsernameCb);
	const [email, setEmail] = useState("");

	return isActive ? (
		<section>
			<AuthStageTestReporter
				stageId={AuthStateId.SubmittingOtpUsername}
				isLoading={isLoading}
				errorMsg={error}
			/>
			<Form submitCb={validateUsername} cbParams={[email]}>
				<Form.InputGroup
					id="otpUsername"
					label="Enter your email"
					validationErrors={validationErrors["username"]}
					value={email}
					valueSetter={setEmail}
				/>
				<Form.Submit label="Submit username" />
			</Form>
		</section>
	) : null;
}

function Otp() {
	const { error, isLoading, isActive, goBack, validateOtp, validationErrors } = useSubmittingOtp(
		MockCb.validateOtpCb
	);
	const [password, setPassword] = useState("");

	return isActive ? (
		<section>
			<AuthStageTestReporter
				stageId={AuthStateId.SubmittingOtp}
				isLoading={isLoading}
				errorMsg={error}
			/>
			<Form submitCb={validateOtp} cbParams={[password]}>
				<Form.InputGroup
					id="otp"
					label="Enter the OTP"
					validationErrors={validationErrors["password"]}
					value={password}
					valueSetter={setPassword}
				/>
				<Form.Submit label="Submit OTP" />
				<Form.SecondaryAction actionCallback={goBack} label="Re-enter email" />
			</Form>
		</section>
	) : null;
}

function UsernameAndPassword() {
	const {
		error,
		isLoading,
		isActive,
		validateUsernameAndPassword,
		forgottenPassword,
		validationErrors,
	} = useSubmittingUsernameAndPassword(MockCb.validateUsernameAndPasswordCb);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	return isActive ? (
		<section>
			<AuthStageTestReporter
				stageId={AuthStateId.SubmittingUsernameAndPassword}
				isLoading={isLoading}
				errorMsg={error}
			/>
			<Form submitCb={validateUsernameAndPassword} cbParams={[username, password]}>
				<Form.InputGroup
					id="username"
					label="Enter your username"
					validationErrors={validationErrors["username"]}
					value={username}
					valueSetter={setUsername}
				/>
				<Form.InputGroup
					id="password"
					label="Enter your password"
					validationErrors={validationErrors["password"]}
					value={password}
					valueSetter={setPassword}
				/>
				<Form.Submit label="Submit username and password" />
				<Form.SecondaryAction actionCallback={forgottenPassword} label="Forgotten password" />
			</Form>
		</section>
	) : null;
}

function ForceChangePassword() {
	const { error, isLoading, isActive, validationErrors, validateNewPassword } =
		useSubmittingForceChangePassword(MockCb.validateForceChangePasswordCb);
	const [password, setPassword] = useState("");

	return isActive ? (
		<section>
			<AuthStageTestReporter
				stageId={AuthStateId.SubmittingForceChangePassword}
				isLoading={isLoading}
				errorMsg={error}
			/>
			<Form submitCb={validateNewPassword} cbParams={[password]}>
				<Form.InputGroup
					id="password"
					label="Enter your password"
					validationErrors={validationErrors["password"]}
					value={password}
					valueSetter={setPassword}
				/>
				<Form.Submit label="Submit new password" />
			</Form>
		</section>
	) : null;
}

function RequestNewPassword() {
	const {
		error,
		isActive,
		isLoading,
		cancelResetPasswordRequest,
		requestNewPassword,
		validationErrors,
	} = useRequestingPasswordReset(MockCb.requestNewPasswordCb);
	const [username, setUsername] = useState("");

	return isActive ? (
		<section>
			<AuthStageTestReporter
				stageId={AuthStateId.RequestingPasswordReset}
				isLoading={isLoading}
				errorMsg={error}
			/>
			<Form submitCb={requestNewPassword} cbParams={[username]}>
				<Form.InputGroup
					id="username"
					label="Enter your Usename"
					validationErrors={validationErrors["username"]}
					value={username}
					valueSetter={setUsername}
				/>
				<Form.Submit label="Request a new password" />
				<Form.SecondaryAction
					label="Cancel password reset"
					actionCallback={cancelResetPasswordRequest}
				/>
			</Form>
		</section>
	) : null;
}

function NewPassword() {
	const { error, isActive, isLoading, validationErrors, submitNewPassword } =
		useSubmittingPasswordReset(MockCb.submitNewPasswordCb);

	const [code, setCode] = useState("");
	const [newPassword, setNewPassword] = useState("");

	return isActive ? (
		<section>
			<AuthStageTestReporter
				stageId={AuthStateId.SubmittingPasswordReset}
				isLoading={isLoading}
				errorMsg={error}
			/>
			<Form submitCb={submitNewPassword} cbParams={[code, newPassword]}>
				<Form.InputGroup
					id="resetCode"
					label="Enter the reset code you have been sent"
					validationErrors={validationErrors["code"]}
					value={code}
					valueSetter={setCode}
				/>
				<Form.InputGroup
					id="newPassword"
					label="Enter your new password"
					validationErrors={validationErrors["newPassword"]}
					value={newPassword}
					valueSetter={setNewPassword}
				/>
				<Form.Submit label="Submit reset code and new password" />
			</Form>
		</section>
	) : null;
}

function CheckForPin() {
	const { error, isActive, isLoading, checkForExistingPin } = useCheckingForPin(
		MockCb.checkForExistingPinCb
	);

	return isActive ? (
		<section>
			<AuthStageTestReporter
				stageId={AuthStateId.CheckingForPin}
				isLoading={isLoading}
				errorMsg={error}
			/>
			<Form submitCb={checkForExistingPin}>
				<Form.Submit label="Check for an existing PIN" />
			</Form>
		</section>
	) : null;
}

function Pin() {
	const { error, isActive, isLoading, validationErrors, validatePin, requestPinReset } =
		useSubmittingCurrentPin(MockCb.validatePinCb);
	const [pin, setPin] = useState("");

	return isActive ? (
		<section>
			<AuthStageTestReporter
				stageId={AuthStateId.SubmittingCurrentPin}
				isLoading={isLoading}
				errorMsg={error}
			/>
			<Form submitCb={validatePin}>
				<Form.InputGroup
					id="pin"
					label="Enter your current PIN"
					validationErrors={validationErrors["pin"]}
					value={pin}
					valueSetter={setPin}
				/>
				<Form.Submit label="Submit PIN" />
				<Form.SecondaryAction label="Forgot PIN" actionCallback={requestPinReset} />
			</Form>
		</section>
	) : null;
}

function ResetPin() {
	const { error, isActive, isLoading, resetPin } = useResettingPin(MockCb.logOutCb);

	return isActive ? (
		<section>
			<AuthStageTestReporter
				stageId={AuthStateId.ResettingPin}
				isLoading={isLoading}
				errorMsg={error}
			/>
			<Form submitCb={resetPin}>
				<Form.Submit label="Reset PIN" />
			</Form>
		</section>
	) : null;
}

function NewPin() {
	const { error, isActive, isLoading, validationErrors, setNewPin } = useSubmittingNewPin(
		MockCb.setNewPinCb
	);
	const [pin, setPin] = useState("");

	return isActive ? (
		<section>
			<AuthStageTestReporter
				stageId={AuthStateId.SubmittingNewPin}
				isLoading={isLoading}
				errorMsg={error}
			/>
			<Form submitCb={setNewPin}>
				<Form.InputGroup
					id="pin"
					label="Enter a PIN"
					validationErrors={validationErrors["pin"]}
					value={pin}
					valueSetter={setPin}
				/>
				<Form.Submit label="Submit PIN" />
			</Form>
		</section>
	) : null;
}

function Authenticated() {
	const { isActive, requestLogOut, requestPasswordChange, requestPinChange } = useAuthenticated();

	return isActive ? (
		<section>
			<AuthStageTestReporter stageId={AuthStateId.Authenticated} errorMsg="" isLoading={false} />
			<Form.SecondaryAction actionCallback={requestLogOut} label="Log out" />
			<Form.SecondaryAction actionCallback={requestPinChange} label="Change PIN" />
			<Form.SecondaryAction actionCallback={requestPasswordChange} label="Change password" />
		</section>
	) : null;
}

function LogOut() {
	const { error, isActive, isLoading, logOut, cancelLogOut } = useLoggingOut(MockCb.logOutCb);

	return isActive ? (
		<section>
			<AuthStageTestReporter
				stageId={AuthStateId.LoggingOut}
				errorMsg={error}
				isLoading={isLoading}
			/>
			<Form submitCb={logOut}>
				<Form.Submit label="Confirm log out" />
				<Form.SecondaryAction actionCallback={cancelLogOut} label="Cancel log out" />
			</Form>
		</section>
	) : null;
}
// function ValidatePin() {}
// function ChangePin() {}
// function ChangePassword() {}

/* ------------------------------------------------------------------------- *\
 * 3c. APPLICATION WRAPPER
\* ------------------------------------------------------------------------- */

function TestApp() {
	return (
		<main>
			<AuthOverallTestReporter />
			<CheckingForSession />
			<OtpUsername />
			<Otp />
			<UsernameAndPassword />
			<ForceChangePassword />
			<RequestNewPassword />
			<NewPassword />
			<CheckForPin />
			<Pin />
			<ResetPin />
			<NewPin />
			<Authenticated />
			<LogOut />
		</main>
	);
}

/* ------------------------------------------------------------------------- *\
 * 4. TESTS
\* ------------------------------------------------------------------------- */

describe("authentication test system using OTP and no device security", () => {
	afterEach(() => {
		cleanup();
		jest.clearAllMocks();
	});

	const subject = createAuthenticationSystem({ loginFlowType: "OTP", deviceSecurityType: "NONE" });

	const machine = createMachine({
		id: "otpNoPin",
		initial: "CheckingSession",
		states: {
			CheckingSession: {
				on: {
					THERE_IS_A_SESSION: "Authenticated",
					THERE_IS_NO_SESSION: "SubmittingUsername",
				},
				meta: {
					test: async (screen: RenderResult) => {
						// The overall reporter (prints machine context values to screen):
						expect(await screen.findByText("Current stage: CheckingForSession")).toBeDefined();
						// NOTE: Only need to check these once, they should stay constant
						//       throughout the test as they're read-only values:
						expect(await screen.findByText("Current login flow: OTP")).toBeDefined();
						expect(await screen.findByText("Current device security: NONE")).toBeDefined();

						// The reporter for this stage (prints hook state values):
						expect(await screen.findByText("Error: n/a")).toBeDefined();
					},
				},
			},
			SubmittingUsername: {
				on: {
					GOOD_USERNAME: "SubmittingOtp1",
					BAD_USERNAME: "UsernameError",
				},
				meta: {
					test: async (screen: RenderResult) => {
						// The overall reporter (prints machine context values to screen):
						expect(await screen.findByText("Current stage: SubmittingOtpUsername")).toBeDefined();
						// The reporter for this stage (prints hook state values):
						expect(await screen.findByText("Error: n/a")).toBeDefined();
					},
				},
			},
			SubmittingUsernameAfterTooManyRetries: {
				on: {
					GOOD_USERNAME: "SubmittingOtp1",
				},
				meta: {
					test: async (screen: RenderResult) => {
						// The overall reporter (prints machine context values to screen):
						expect(await screen.findByText("Current stage: SubmittingOtpUsername")).toBeDefined();
						// The reporter for this stage (prints hook state values):
						expect(await screen.findByText("Error: PASSWORD_RETRIES_EXCEEDED")).toBeDefined();
					},
				},
			},
			UsernameError: {
				on: {
					GOOD_USERNAME: "SubmittingOtp1",
				},
				meta: {
					test: async (screen: RenderResult) => {
						// The overall reporter (prints machine context values to screen):
						expect(await screen.findByText("Current stage: SubmittingOtpUsername")).toBeDefined();
						// The reporter for this stage (prints hook state values):
						expect(await screen.findByText("Error: USERNAME_INVALID")).toBeDefined();
					},
				},
			},
			SubmittingOtp1: {
				on: {
					GOOD_OTP: "Authenticated",
					BAD_OTP: "SubmittingOtp2",
					REENTER_USERNAME: "SubmittingUsername",
				},
				meta: {
					test: async (screen: RenderResult) => {
						// The overall reporter (prints machine context values to screen):
						expect(await screen.findByText("Current stage: SubmittingOtp")).toBeDefined();
						// The reporter for this stage (prints hook state values):
						expect(await screen.findByText("Error: n/a")).toBeDefined();
					},
				},
			},
			SubmittingOtp2: {
				on: {
					GOOD_OTP: "Authenticated",
					BAD_OTP: "SubmittingOtp3",
					REENTER_USERNAME: "SubmittingUsername",
				},
				meta: {
					test: async (screen: RenderResult) => {
						// The overall reporter (prints machine context values to screen):
						expect(await screen.findByText("Current stage: SubmittingOtp")).toBeDefined();
						// The reporter for this stage (prints hook state values):
						expect(
							await screen.findByText("Error: PASSWORD_INVALID_2_RETRIES_REMAINING")
						).toBeDefined();
					},
				},
			},
			SubmittingOtp3: {
				on: {
					GOOD_OTP: "Authenticated",
					BAD_OTP: "SubmittingUsernameAfterTooManyRetries",
					REENTER_USERNAME: "SubmittingUsername",
				},
				meta: {
					test: async (screen: RenderResult) => {
						// The overall reporter (prints machine context values to screen):
						expect(await screen.findByText("Current stage: SubmittingOtp")).toBeDefined();
						// The reporter for this stage (prints hook state values):
						expect(
							await screen.findByText("Error: PASSWORD_INVALID_1_RETRIES_REMAINING")
						).toBeDefined();
					},
				},
			},
			Authenticated: {
				on: {
					REQUEST_LOG_OUT: "LoggingOut",
				},
				meta: {
					test: async (screen: RenderResult) => {
						// The overall reporter (prints machine context values to screen):
						expect(await screen.findByText("Current stage: Authenticated")).toBeDefined();
						// The reporter for this stage (prints hook state values):
						expect(await screen.findByText("Error: n/a")).toBeDefined();
					},
				},
			},
			LoggingOut: {
				on: {
					GOOD_LOG_OUT: "CheckingSession",
					// BAD_LOG_OUT: "Authenticated",
					CANCEL_LOG_OUT: "Authenticated",
				},
				meta: {
					test: async (screen: RenderResult) => {
						// The overall reporter (prints machine context values to screen):
						expect(await screen.findByText("Current stage: LoggingOut")).toBeDefined();
						// The reporter for this stage (prints hook state values):
						expect(await screen.findByText("Error: n/a")).toBeDefined();
					},
				},
			},
		},
	});

	const model = createModel<RenderResult>(machine).withEvents({
		THERE_IS_A_SESSION: async (screen: RenderResult) => {
			userEvent.click(await screen.findByText("Check for a session"));
			await waitFor(() => expect(MockCb.checkSessionCb).toHaveBeenCalled());
			// expect(await screen.findByText("Loading: true")).toBeDefined();
			await screen.findByText("Loading: false");
		},
		THERE_IS_NO_SESSION: async (screen: RenderResult) => {
			MockCb.checkSessionCb.mockRejectedValueOnce(null);
			userEvent.click(await screen.findByText("Check for a session"));
			await waitFor(() => expect(MockCb.checkSessionCb).toHaveBeenCalled());
			MockCb.checkSessionCb.mockReset();
			// expect(await screen.findByText("Loading: true")).toBeDefined();
			await screen.findByText("Loading: false");
		},
		GOOD_USERNAME: async (screen: RenderResult) => {
			const input = await screen.findByLabelText("Enter your email");
			userEvent.clear(input);
			userEvent.type(input, VALID_USERNAME);
			userEvent.click(await screen.findByText("Submit username"));
			await waitFor(() =>
				expect(MockCb.validateOtpUsernameCb).toHaveBeenCalledWith(VALID_USERNAME)
			);
			// expect(await screen.findByText("Loading: true")).toBeDefined();
			await screen.findByText("Loading: false");
		},
		BAD_USERNAME: async (screen: RenderResult) => {
			const input = await screen.findByLabelText("Enter your email");
			userEvent.clear(input);
			userEvent.type(input, INVALID_USERNAME);
			userEvent.click(await screen.findByText("Submit username"));
			await waitFor(() =>
				expect(MockCb.validateOtpUsernameCb).toHaveBeenCalledWith(INVALID_USERNAME)
			);
			// expect(await screen.findByText("Loading: true")).toBeDefined();
			await screen.findByText("Loading: false");
		},
		GOOD_OTP: async (screen: RenderResult) => {
			const input = await screen.findByLabelText("Enter the OTP");
			userEvent.clear(input);
			userEvent.type(input, VALID_CODE);
			userEvent.click(await screen.findByText("Submit OTP"));
			await waitFor(() =>
				expect(MockCb.validateOtpCb).toHaveBeenCalledWith(USER_OBJECT, VALID_CODE)
			);
			// expect(await screen.findByText("Loading: true")).toBeDefined();
			await screen.findByText("Loading: false");
		},
		BAD_OTP: async (screen: RenderResult) => {
			const input = await screen.findByLabelText("Enter the OTP");
			userEvent.clear(input);
			userEvent.type(input, INVALID_CODE);
			userEvent.click(await screen.findByText("Submit OTP"));
			await waitFor(() =>
				expect(MockCb.validateOtpCb).toHaveBeenCalledWith(USER_OBJECT, INVALID_CODE)
			);
		},
		REENTER_USERNAME: async (screen: RenderResult) => {
			userEvent.click(await screen.findByText("Re-enter email"));
		},
		REQUEST_LOG_OUT: async (screen: RenderResult) => {
			userEvent.click(await screen.findByText("Log out"));
		},
		CANCEL_LOG_OUT: async (screen: RenderResult) => {
			userEvent.click(await screen.findByText("Cancel log out"));
		},
		GOOD_LOG_OUT: async (screen: RenderResult) => {
			userEvent.click(await screen.findByText("Confirm log out"));
			await waitFor(() => expect(MockCb.logOutCb).toHaveBeenCalled());
			// expect(await screen.findByText("Loading: true")).toBeDefined();
			await screen.findByText("Loading: false");
		},
		BAD_LOG_OUT: async (screen: RenderResult) => {
			MockCb.logOutCb.mockRejectedValueOnce(null);
			userEvent.click(await screen.findByText("Confirm log out"));
			await waitFor(() => expect(MockCb.logOutCb).toHaveBeenCalled());
			MockCb.logOutCb.mockReset();
			// expect(await screen.findByText("Loading: true")).toBeDefined();
			await screen.findByText("Loading: false");
		},
	});

	const testPlans = model.getSimplePathPlans();

	testPlans.forEach((plan) => {
		describe(`authentication test system ${plan.description}`, () => {
			plan.paths.forEach((path) => {
				it(path.description, async () => {
					const screen = render(
						<AuthProvider authenticationSystem={subject}>
							<TestApp />
						</AuthProvider>
					);
					await path.test(screen);
				});
			});
		});
	});

	it("should have full coverage", () => {
		return model.testCoverage();
	});
});

describe("authentication test system using username password and no device security", () => {
	afterEach(() => {
		cleanup();
		jest.clearAllMocks();
	});

	const subject = createAuthenticationSystem({
		loginFlowType: "USERNAME_PASSWORD",
		deviceSecurityType: "NONE",
	});

	const machine = createMachine({
		id: "userenamePasswordNoPin",
		initial: "CheckingSession",
		states: {
			CheckingSession: {
				on: {
					THERE_IS_A_SESSION: "Authenticated",
					THERE_IS_NO_SESSION: "SubmittingUsernameAndPassword",
				},
				meta: {
					test: async (screen: RenderResult) => {
						// The overall reporter (prints machine context values to screen):
						expect(await screen.findByText("Current stage: CheckingForSession")).toBeDefined();
						// NOTE: Only need to check these once, they should stay constant
						//       throughout the test as they're read-only values:
						expect(await screen.findByText("Current login flow: USERNAME_PASSWORD")).toBeDefined();
						expect(await screen.findByText("Current device security: NONE")).toBeDefined();

						// The reporter for this stage (prints hook state values):
						expect(await screen.findByText("Error: n/a")).toBeDefined();
					},
				},
			},
			SubmittingUsernameAndPassword: {
				on: {
					GOOD_USERNAME_AND_PASSWORD: "Authenticated",
					FORCE_PASSWORD_RESET_REQUIRED: "SubmittingForceResetPassword",
					BAD_USERNAME_AND_PASSWORD: "UsernameOrPasswordError",
					FORGOT_PASSWORD: "RequestingNewPassword",
				},
				meta: {
					test: async (screen: RenderResult) => {
						// The overall reporter (prints machine context values to screen):
						expect(
							await screen.findByText("Current stage: SubmittingUsernameAndPassword")
						).toBeDefined();
						// The reporter for this stage (prints hook state values):
						expect(await screen.findByText("Error: n/a")).toBeDefined();
					},
				},
			},
			UsernameOrPasswordError: {
				on: {
					GOOD_USERNAME_AND_PASSWORD: "Authenticated",
				},
				meta: {
					test: async (screen: RenderResult) => {
						// The overall reporter (prints machine context values to screen):
						expect(
							await screen.findByText("Current stage: SubmittingUsernameAndPassword")
						).toBeDefined();
						// The reporter for this stage (prints hook state values):
						expect(await screen.findByText("Error: USERNAME_AND_PASSWORD_INVALID")).toBeDefined();
					},
				},
			},
			SubmittingForceResetPassword: {
				on: {
					GOOD_FORCE_RESET_PASSWORD: "Authenticated",
					BAD_FORCE_RESET_PASSWORD: "SubmittingForceResetPasswordError",
				},
				meta: {
					test: async (screen: RenderResult) => {
						// The overall reporter (prints machine context values to screen):
						expect(
							await screen.findByText(`Current stage: ${AuthStateId.SubmittingForceChangePassword}`)
						).toBeDefined();
						// The reporter for this stage (prints hook state values):
						expect(
							await screen.findByText(`Error: ${"PASSWORD_CHANGE_REQUIRED" as AuthError}`)
						).toBeDefined();
					},
				},
			},
			SubmittingForceResetPasswordError: {
				on: {
					GOOD_FORCE_RESET_PASSWORD: "Authenticated",
				},
				meta: {
					test: async (screen: RenderResult) => {
						// The overall reporter (prints machine context values to screen):
						expect(
							await screen.findByText(`Current stage: ${AuthStateId.SubmittingForceChangePassword}`)
						).toBeDefined();
						// The reporter for this stage (prints hook state values):
						expect(
							await screen.findByText(`Error: ${"PASSWORD_CHANGE_FAILURE" as AuthError}`)
						).toBeDefined();
					},
				},
			},
			RequestingNewPassword: {
				on: {
					PASSWORD_RESET_REQUEST_SUCCESS: "SubmittingNewPassword",
					PASSWORD_RESET_REQUEST_FAILURE: "RequestingNewPasswordError",
					CANCEL_PASSWORD_RESET: "SubmittingUsernameAndPassword",
				},
				meta: {
					test: async (screen: RenderResult) => {
						// The overall reporter (prints machine context values to screen):
						expect(await screen.findByText("Current stage: RequestingPasswordReset")).toBeDefined();
						// The reporter for this stage (prints hook state values):
						expect(await screen.findByText("Error: n/a")).toBeDefined();
					},
				},
			},
			RequestingNewPasswordError: {
				on: {
					PASSWORD_RESET_REQUEST_SUCCESS: "SubmittingNewPassword",
				},
				meta: {
					test: async (screen: RenderResult) => {
						// The overall reporter (prints machine context values to screen):
						expect(await screen.findByText("Current stage: RequestingPasswordReset")).toBeDefined();
						// The reporter for this stage (prints hook state values):
						expect(await screen.findByText("Error: PASSWORD_RESET_REQUEST_FAILURE")).toBeDefined();
					},
				},
			},
			SubmittingNewPassword: {
				on: {
					PASSWORD_CHANGE_SUCCESS: "CheckingSession",
					PASSWORD_CHANGE_FAILURE: "SubmittingNewPasswordError",
				},
				meta: {
					test: async (screen: RenderResult) => {
						// The overall reporter (prints machine context values to screen):
						expect(await screen.findByText("Current stage: SubmittingPasswordReset")).toBeDefined();
						// The reporter for this stage (prints hook state values):
						expect(await screen.findByText("Error: n/a")).toBeDefined();
					},
				},
			},
			SubmittingNewPasswordError: {
				on: {
					PASSWORD_CHANGE_SUCCESS: "CheckingSession",
				},
				meta: {
					test: async (screen: RenderResult) => {
						// The overall reporter (prints machine context values to screen):
						expect(await screen.findByText("Current stage: SubmittingPasswordReset")).toBeDefined();
						// The reporter for this stage (prints hook state values):
						expect(await screen.findByText("Error: PASSWORD_CHANGE_FAILURE")).toBeDefined();
					},
				},
			},
			Authenticated: {
				on: {
					REQUEST_LOG_OUT: "LoggingOut",
				},
				meta: {
					test: async (screen: RenderResult) => {
						// The overall reporter (prints machine context values to screen):
						expect(await screen.findByText("Current stage: Authenticated")).toBeDefined();
						// The reporter for this stage (prints hook state values):
						expect(await screen.findByText("Error: n/a")).toBeDefined();
					},
				},
			},
			LoggingOut: {
				on: {
					GOOD_LOG_OUT: "CheckingSession",
					// BAD_LOG_OUT: "Authenticated",
					CANCEL_LOG_OUT: "Authenticated",
				},
				meta: {
					test: async (screen: RenderResult) => {
						// The overall reporter (prints machine context values to screen):
						expect(await screen.findByText("Current stage: LoggingOut")).toBeDefined();
						// The reporter for this stage (prints hook state values):
						expect(await screen.findByText("Error: n/a")).toBeDefined();
					},
				},
			},
		},
	});

	const model = createModel<RenderResult>(machine).withEvents({
		THERE_IS_A_SESSION: async (screen: RenderResult) => {
			userEvent.click(await screen.findByText("Check for a session"));
			await waitFor(() => expect(MockCb.checkSessionCb).toHaveBeenCalled());
			// expect(await screen.findByText("Loading: true")).toBeDefined();
			await screen.findByText("Loading: false");
		},
		THERE_IS_NO_SESSION: async (screen: RenderResult) => {
			MockCb.checkSessionCb.mockRejectedValueOnce(null);
			userEvent.click(await screen.findByText("Check for a session"));
			await waitFor(() => expect(MockCb.checkSessionCb).toHaveBeenCalled());
			MockCb.checkSessionCb.mockReset();
			// expect(await screen.findByText("Loading: true")).toBeDefined();
			await screen.findByText("Loading: false");
		},
		GOOD_USERNAME_AND_PASSWORD: async (screen: RenderResult) => {
			const usernameinput = await screen.findByLabelText("Enter your username");
			const passwordinput = await screen.findByLabelText("Enter your password");
			userEvent.clear(usernameinput);
			userEvent.clear(passwordinput);
			userEvent.type(usernameinput, VALID_USERNAME);
			userEvent.type(passwordinput, VALID_PASSWORD);
			userEvent.click(await screen.findByText("Submit username and password"));
			await waitFor(() =>
				expect(MockCb.validateUsernameAndPasswordCb).toHaveBeenCalledWith(
					VALID_USERNAME,
					VALID_PASSWORD
				)
			);
			// expect(await screen.findByText("Loading: true")).toBeDefined();
			await screen.findByText("Loading: false");
		},
		BAD_USERNAME_AND_PASSWORD: async (screen: RenderResult) => {
			const usernameinput = await screen.findByLabelText("Enter your username");
			const passwordinput = await screen.findByLabelText("Enter your password");
			userEvent.clear(usernameinput);
			userEvent.clear(passwordinput);
			userEvent.type(usernameinput, INVALID_USERNAME);
			userEvent.type(passwordinput, INVALID_PASSWORD);
			userEvent.click(await screen.findByText("Submit username and password"));
			await waitFor(() =>
				expect(MockCb.validateUsernameAndPasswordCb).toHaveBeenCalledWith(
					INVALID_USERNAME,
					INVALID_PASSWORD
				)
			);
			// expect(await screen.findByText("Loading: true")).toBeDefined();
			await screen.findByText("Loading: false");
		},
		FORCE_PASSWORD_RESET_REQUIRED: async (screen: RenderResult) => {
			const usernameinput = await screen.findByLabelText("Enter your username");
			const passwordinput = await screen.findByLabelText("Enter your password");
			userEvent.clear(usernameinput);
			userEvent.clear(passwordinput);
			userEvent.type(usernameinput, VALID_USERNAME);
			userEvent.type(passwordinput, OLD_PASSWORD);
			userEvent.click(await screen.findByText("Submit username and password"));
			await waitFor(() =>
				expect(MockCb.validateUsernameAndPasswordCb).toHaveBeenCalledWith(
					VALID_USERNAME,
					OLD_PASSWORD
				)
			);
			// expect(await screen.findByText("Loading: true")).toBeDefined();
			await screen.findByText("Loading: false");
		},
		GOOD_FORCE_RESET_PASSWORD: async (screen: RenderResult) => {
			const input = await screen.findByLabelText("Enter your password");
			userEvent.clear(input);
			userEvent.type(input, VALID_PASSWORD);
			userEvent.click(await screen.findByText("Submit new password"));
			await waitFor(() =>
				expect(MockCb.validateForceChangePasswordCb).toHaveBeenCalledWith(
					USER_OBJECT,
					VALID_PASSWORD
				)
			);
			// expect(await screen.findByText("Loading: true")).toBeDefined();
			await screen.findByText("Loading: false");
		},
		BAD_FORCE_RESET_PASSWORD: async (screen: RenderResult) => {
			const input = await screen.findByLabelText("Enter your password");
			userEvent.clear(input);
			userEvent.type(input, INVALID_PASSWORD);
			userEvent.click(await screen.findByText("Submit new password"));
			await waitFor(() =>
				expect(MockCb.validateForceChangePasswordCb).toHaveBeenCalledWith(
					USER_OBJECT,
					INVALID_PASSWORD
				)
			);
			// expect(await screen.findByText("Loading: true")).toBeDefined();
			await screen.findByText("Loading: false");
		},
		FORGOT_PASSWORD: async (screen: RenderResult) => {
			userEvent.click(await screen.findByText("Forgotten password"));
		},
		PASSWORD_RESET_REQUEST_SUCCESS: async (screen: RenderResult) => {
			const input = await screen.findByLabelText("Enter your username");
			userEvent.clear(input);
			userEvent.type(input, VALID_USERNAME);
			userEvent.click(await screen.findByText("Request a new password"));
			await waitFor(() => expect(MockCb.requestNewPasswordCb).toHaveBeenCalledWith(VALID_USERNAME));
			// expect(await screen.findByText("Loading: true")).toBeDefined();
			await screen.findByText("Loading: false");
		},
		PASSWORD_RESET_REQUEST_FAILURE: async (screen: RenderResult) => {
			const input = await screen.findByLabelText("Enter your username");
			userEvent.clear(input);
			userEvent.type(input, INVALID_USERNAME);
			userEvent.click(await screen.findByText("Request a new password"));
			await waitFor(() =>
				expect(MockCb.requestNewPasswordCb).toHaveBeenCalledWith(INVALID_USERNAME)
			);
			// expect(await screen.findByText("Loading: true")).toBeDefined();
			await screen.findByText("Loading: false");
		},
		CANCEL_PASSWORD_RESET: async (screen: RenderResult) => {
			userEvent.click(await screen.findByText("Cancel password reset"));
		},
		PASSWORD_CHANGE_SUCCESS: async (screen: RenderResult) => {
			const codeinput = await screen.findByLabelText("Enter the reset code you have been sent");
			const passwordinput = await screen.findByLabelText("Enter your new password");
			userEvent.clear(codeinput);
			userEvent.clear(passwordinput);
			userEvent.type(codeinput, VALID_CODE);
			userEvent.type(passwordinput, VALID_PASSWORD);
			userEvent.click(await screen.findByText("Submit reset code and new password"));
			await waitFor(() =>
				expect(MockCb.submitNewPasswordCb).toHaveBeenCalledWith(VALID_CODE, VALID_PASSWORD)
			);
			// expect(await screen.findByText("Loading: true")).toBeDefined();
			await screen.findByText("Loading: false");
		},
		PASSWORD_CHANGE_FAILURE: async (screen: RenderResult) => {
			const codeinput = await screen.findByLabelText("Enter the reset code you have been sent");
			const passwordinput = await screen.findByLabelText("Enter your new password");
			userEvent.clear(codeinput);
			userEvent.clear(passwordinput);
			userEvent.type(codeinput, INVALID_CODE);
			userEvent.type(passwordinput, INVALID_PASSWORD);
			userEvent.click(await screen.findByText("Submit reset code and new password"));
			await waitFor(() =>
				expect(MockCb.submitNewPasswordCb).toHaveBeenCalledWith(INVALID_CODE, INVALID_PASSWORD)
			);
			// expect(await screen.findByText("Loading: true")).toBeDefined();
			await screen.findByText("Loading: false");
		},
		REQUEST_LOG_OUT: async (screen: RenderResult) => {
			userEvent.click(await screen.findByText("Log out"));
		},
		CANCEL_LOG_OUT: async (screen: RenderResult) => {
			userEvent.click(await screen.findByText("Cancel log out"));
		},
		GOOD_LOG_OUT: async (screen: RenderResult) => {
			userEvent.click(await screen.findByText("Confirm log out"));
			await waitFor(() => expect(MockCb.logOutCb).toHaveBeenCalled());
			// expect(await screen.findByText("Loading: true")).toBeDefined();
			await screen.findByText("Loading: false");
		},
		BAD_LOG_OUT: async (screen: RenderResult) => {
			MockCb.logOutCb.mockRejectedValueOnce(null);
			userEvent.click(await screen.findByText("Confirm log out"));
			await waitFor(() => expect(MockCb.logOutCb).toHaveBeenCalled());
			MockCb.logOutCb.mockReset();
			// expect(await screen.findByText("Loading: true")).toBeDefined();
			await screen.findByText("Loading: false");
		},
	});

	const testPlans = model.getSimplePathPlans();

	testPlans.forEach((plan) => {
		describe(`authentication test system ${plan.description}`, () => {
			plan.paths.forEach((path) => {
				it(path.description, async () => {
					const screen = render(
						<AuthProvider authenticationSystem={subject}>
							<TestApp />
						</AuthProvider>
					);
					await path.test(screen);
				});
			});
		});
	});

	it("should have full coverage", () => {
		return model.testCoverage();
	});
});

describe("authentication test system using username and password and no device security", () => {
	test.todo("Add username password flow model test");
});

describe("authentication test system using PIN device security", () => {
	test.todo("Add PIN security model test");
});
