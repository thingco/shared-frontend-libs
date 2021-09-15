/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useState } from "react";
import { createModel } from "@xstate/test";
import { fireEvent, render, within } from "@testing-library/react";
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
} from "./auth-system-hooks";

import type { RenderResult } from "@testing-library/react";
import type { ReactNode } from "react";
import type { AuthEvent, AuthInterpreter } from "./auth-system";
import { AuthProvider, useAuthProvider } from "./AuthSystemProvider";

/* ========================================================================= *\
 * 1. UTILITIES
 * 2. SETUP
 * 3. SYSTEM UNDER TEST
 * 4. TESTS
\* ========================================================================= */

/* ------------------------------------------------------------------------- *\
 * 1. UTILITIES
\* ------------------------------------------------------------------------- */

/**
 * XState's `test` package requires defining a test model (System Under Test), then providing
 * a mapping of events in the SUT to events in the actual model. Make this less onerous, this
 * usitlity function just requires the actual event to be sent passed in:
 */
function doSend(e: AuthEvent) {
	return {
		exec: ({ send }: AuthInterpreter) => send(e),
	} as any;
}

/* ------------------------------------------------------------------------- *\
 * 2. SEUP
\* ------------------------------------------------------------------------- */

const VALID_USERNAME = "validuser@example.com";
const INVALID_USERNAME = "invaliduser@example.com";

const VALID_CODE = "123456";
const INVALID_CODE = "654321";
const ANOTHER_VALID_CODE = "123456";
const ANOTHER_INVALID_CODE = "654321";

const VALID_PASSWORD = "validpassword";
const ANOTHER_VALID_PASSWORD = "anothervalidpassword";
const INVALID_PASSWORD = "invalidpassword";
const TEMPORARY_PASSWORD = "temporarypassword";

const USER_OBJECT = { description: "I represent the user object returned by the OAuth system" };

// prettier-ignore
const MockCb = {
	checkSessionCb: jest.fn(),
	validateOtpUsernameCb: jest.fn((username) => username === VALID_USERNAME ? Promise.resolve(USER_OBJECT) : Promise.reject()),
	validateOtpCb: jest.fn((_, otp) => otp === VALID_CODE ? Promise.resolve(USER_OBJECT) : Promise.reject() ),
	validateUsernameAndPasswordCb: jest.fn((username, password) => {
		if (username === VALID_USERNAME && password === VALID_PASSWORD) {
			return Promise.resolve(USER_OBJECT);
		} else if (username === VALID_USERNAME && password === VALID_CODE) {
			return Promise.resolve({ ...USER_OBJECT, NEW_PASSWORD_REQUIRED: true });
		} else {
			return Promise.reject();
		}
	}),
	validateForceChangePasswordCb: jest.fn((_, password) => password === VALID_PASSWORD ? Promise.resolve() : Promise.reject()),
	requestNewPasswordCb: jest.fn((username) => username === VALID_USERNAME ? Promise.resolve() : Promise.reject()),
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
	isActive,
	isLoading,
	stageId,
}: {
	errorMsg: string;
	isActive: boolean;
	isLoading: boolean;
	stageId: AuthStateId;
}) => (
	<header title={stageId}>
		<p aria-label={stageId}>Stage: {stageId}</p>
		<p>Active: {isActive.toString()}</p>
		<p>Loading: {isLoading.toString()}</p>
		<p>Error: {errorMsg || "n/a"}</p>
	</header>
);

const AuthOverallTestReporter = () => {
	const { currentState, loginFlowType, deviceSecurityType } = useAuthProvider();

	return (
		<header role="banner">
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

	return (
		<section>
			<AuthStageTestReporter
				stageId={AuthStateId.CheckingForSession}
				isActive={isActive}
				isLoading={isLoading}
				errorMsg={error}
			/>
			<Form submitCb={checkSession}>
				<Form.Submit label="Check for a session" />
			</Form>
		</section>
	);
}

function OtpUsername() {
	const { error, isLoading, isActive, validateUsername, validationErrors } =
		useSubmittingOtpUsername(MockCb.validateOtpUsernameCb);
	const [email, setEmail] = useState("");

	return (
		<section>
			<AuthStageTestReporter
				stageId={AuthStateId.SubmittingOtpUsername}
				isActive={isActive}
				isLoading={isLoading}
				errorMsg={error}
			/>
			<Form submitCb={validateUsername}>
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
	);
}

function Otp() {
	const { error, isLoading, isActive, validateOtp, validationErrors } = useSubmittingOtp(
		MockCb.validateOtpCb
	);
	const [password, setPassword] = useState("");

	return (
		<section>
			<AuthStageTestReporter
				stageId={AuthStateId.SubmittingOtp}
				isActive={isActive}
				isLoading={isLoading}
				errorMsg={error}
			/>
			<Form submitCb={validateOtp}>
				<Form.InputGroup
					id="otp"
					label="Enter the OTP"
					validationErrors={validationErrors["password"]}
					value={password}
					valueSetter={setPassword}
				/>
				<Form.Submit label="Submit OTP" />
			</Form>
		</section>
	);
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

	return (
		<section>
			<AuthStageTestReporter
				stageId={AuthStateId.SubmittingUsernameAndPassword}
				isActive={isActive}
				isLoading={isLoading}
				errorMsg={error}
			/>
			<Form submitCb={validateUsernameAndPassword}>
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
	);
}

function ForceChangePassword() {
	const { error, isLoading, isActive, validationErrors, validateNewPassword } =
		useSubmittingForceChangePassword(MockCb.validateForceChangePasswordCb);
	const [password, setPassword] = useState("");

	return (
		<section>
			<AuthStageTestReporter
				stageId={AuthStateId.SubmittingForceChangePassword}
				isActive={isActive}
				isLoading={isLoading}
				errorMsg={error}
			/>
			<Form submitCb={validateNewPassword}>
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
	);
}

function RequestNewPassword() {
	const { error, isActive, isLoading, requestNewPassword, validationErrors } =
		useRequestingPasswordReset(MockCb.requestNewPasswordCb);
	const [username, setUsername] = useState("");

	return (
		<section>
			<AuthStageTestReporter
				stageId={AuthStateId.RequestingPasswordReset}
				isActive={isActive}
				isLoading={isLoading}
				errorMsg={error}
			/>
			<Form submitCb={requestNewPassword}>
				<Form.InputGroup
					id="username"
					label="Enter your Usename"
					validationErrors={validationErrors["username"]}
					value={username}
					valueSetter={setUsername}
				/>
				<Form.Submit label="Request a new password" />
			</Form>
		</section>
	);
}

function NewPassword() {
	const { error, isActive, isLoading, validationErrors, submitNewPassword } =
		useSubmittingPasswordReset(MockCb.submitNewPasswordCb);

	const [code, setCode] = useState("");
	const [newPassword, setNewPassword] = useState("");

	return (
		<section>
			<AuthStageTestReporter
				stageId={AuthStateId.SubmittingPasswordReset}
				isActive={isActive}
				isLoading={isLoading}
				errorMsg={error}
			/>
			<Form submitCb={submitNewPassword}>
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
	);
}

function CheckForPin() {
	const { error, isActive, isLoading, checkForExistingPin } = useCheckingForPin(
		MockCb.checkForExistingPinCb
	);

	return (
		<section>
			<AuthStageTestReporter
				stageId={AuthStateId.CheckingForPin}
				isActive={isActive}
				isLoading={isLoading}
				errorMsg={error}
			/>
			<Form submitCb={checkForExistingPin}>
				<Form.Submit label="Check for an existing PIN" />
			</Form>
		</section>
	);
}

function Pin() {
	const { error, isActive, isLoading, validationErrors, validatePin, requestPinReset } =
		useSubmittingCurrentPin(MockCb.validatePinCb);
	const [pin, setPin] = useState("");

	return (
		<section>
			<AuthStageTestReporter
				stageId={AuthStateId.SubmittingCurrentPin}
				isActive={isActive}
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
	);
}

function ResetPin() {
	const { error, isActive, isLoading, resetPin } = useResettingPin(MockCb.logOutCb);

	return (
		<section>
			<AuthStageTestReporter
				stageId={AuthStateId.ResettingPin}
				isActive={isActive}
				isLoading={isLoading}
				errorMsg={error}
			/>
			<Form submitCb={resetPin}>
				<Form.Submit label="Reset PIN" />
			</Form>
		</section>
	);
}

function NewPin() {
	const { error, isActive, isLoading, validationErrors, setNewPin } = useSubmittingNewPin(
		MockCb.setNewPinCb
	);
	const [pin, setPin] = useState("");

	return (
		<section>
			<AuthStageTestReporter
				stageId={AuthStateId.SubmittingNewPin}
				isActive={isActive}
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
	);
}

function Authenticated() {
	const { isActive, requestLogOut, requestPasswordChange, requestPinChange } = useAuthenticated();

	return (
		<section>
			<AuthStageTestReporter
				stageId={AuthStateId.Authenticated}
				errorMsg=""
				isActive={isActive}
				isLoading={false}
			/>
			<Form.SecondaryAction actionCallback={requestLogOut} label="Log out" />
			<Form.SecondaryAction actionCallback={requestPinChange} label="Change PIN" />
			<Form.SecondaryAction actionCallback={requestPasswordChange} label="Change password" />
		</section>
	);
}

function LogOut() {}
function ValidatePin() {}
function ChangePin() {}
function ChangePassword() {}

/* ------------------------------------------------------------------------- *\
 * 3c. APPLICATION WRAPPER
\* ------------------------------------------------------------------------- */

function TestApp() {
	return (
		<>
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
		</>
	);
}

/* ------------------------------------------------------------------------- *\
 * 4. TESTS
\* ------------------------------------------------------------------------- */

describe("authentication test system using OTP and no device security", () => {
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
						const authSystemReporter = screen.getByRole("banner");
						expect(
							within(authSystemReporter).getByText("Current stage: CheckingForSession")
						).toBeDefined();
						// NOTE: Only need to check these once, they should stay constant
						//       throughout the test as they're read-only values:
						expect(within(authSystemReporter).getByText("Current login flow: OTP")).toBeDefined();
						expect(
							within(authSystemReporter).getByText("Current device security: NONE")
						).toBeDefined();

						// The reporter for this stage (prints hook state values):
						const stageReporter = screen.getByTitle("CheckingForSession");
						expect(stageReporter).toBeDefined();
						expect(within(stageReporter).getByText("Active: true")).toBeDefined();
						expect(within(stageReporter).getByText("Error: n/a")).toBeDefined();
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
						const authSystemReporter = screen.getByRole("banner");
						expect(
							within(authSystemReporter).getByText("Current stage: SubmittingOtpUsername")
						).toBeDefined();

						// The reporter for this stage (prints hook state values):
						const stageReporter = screen.getByTitle("SubmittingOtpUsername");
						expect(stageReporter).toBeDefined();
						expect(within(stageReporter).getByText("Active: true")).toBeDefined();
						expect(within(stageReporter).getByText("Error: n/a")).toBeDefined();
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
						const authSystemReporter = screen.getByRole("banner");
						expect(
							within(authSystemReporter).getByText("Current stage: SubmittingOtp")
						).toBeDefined();

						// The reporter for this stage (prints hook state values):
						const stageReporter = screen.getByTitle("SubmittingOtp");
						expect(stageReporter).toBeDefined();
						expect(within(stageReporter).getByText("Active: true")).toBeDefined();
						expect(within(stageReporter).getByText("Error: n/a")).toBeDefined();
					},
				},
			},
			UsernameError: {
				on: {
					GOOD_USERNAME: "SubmittingOtp1",
				},
				meta: {
					test: async (service: RenderResult) => {
						console.log(service);
					},
				},
			},
			SubmittingOtp1: {
				on: {
					GOOD_OTP: "Authenticated",
					BAD_OTP_1: "SubmittingOtp2",
					REENTER_USERNAME: "SubmittingUsername",
				},
				meta: {
					test: async (service: RenderResult) => {
						console.log(service);
					},
				},
			},
			SubmittingOtp2: {
				on: {
					BAD_OTP_2: "SubmittingOtp3",
				},
				meta: {
					test: async (service: RenderResult) => {
						console.log(service);
					},
				},
			},
			SubmittingOtp3: {
				on: {
					BAD_OTP_3: "SubmittingUsernameAfterTooManyRetries",
				},
				meta: {
					test: async (service: RenderResult) => {
						console.log(service);
					},
				},
			},
			Authenticated: {
				on: {
					CAN_I_LOG_OUT_PLEASE: "LoggingOut",
				},
				meta: {
					test: async (service: RenderResult) => {
						console.log(service);
					},
				},
			},
			LoggingOut: {
				on: {
					LOG_OUT_WORKED: "CheckingSession",
					LOG_OUT_FAILED: "Authenticated",
					ACTUALLY_NO_STAY_LOGGED_IN: "Authenticated",
				},
				meta: {
					test: async (service: RenderResult) => {
						console.log(service);
					},
				},
			},
		},
	});

	const model = createModel<RenderResult>(machine).withEvents({
		THERE_IS_A_SESSION: async (screen: RenderResult) => {
			fireEvent.click(await screen.findByText("Check for a session"));
		},
		THERE_IS_NO_SESSION: async (screen: RenderResult) => {
			MockCb.checkSessionCb.mockRejectedValueOnce(null);
			fireEvent.click(await screen.findByText("Check for session"));
			MockCb.checkSessionCb.mockReset();
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

	//it("should have full coverage", () => {
	//	return model.testCoverage();
	//});
});

describe("authentication test system using username and password and no device security", () => {
	test.todo("Add username password flow model test");
});

describe("authentication test system using PIN device security", () => {
	test.todo("Add PIN security model test");
});
