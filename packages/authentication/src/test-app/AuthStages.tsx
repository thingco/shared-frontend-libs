import { Auth } from "@aws-amplify/auth";
import classnames from "classnames";
import React from "react";

import { AuthStage } from "..";
import { Form } from "./Components";

export const CheckingForSession = () => {
	const { isActive, isLoading, checkSession, error } = AuthStage.useCheckingForSession(() =>
		Auth.currentSession()
	);

	return (
		<section className={classnames("auth-stage", { "auth-stage--active": isActive })}>
			<Form submitCb={checkSession}>
				<Form.Elements disabled={!isActive || isLoading} error={error}>
					<Form.Controls>
						<Form.Submit label="Check Session" testid="CheckingForSessionSubmit" />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</section>
	);
};

export const OtpUsernameInput = () => {
	const { error, isActive, isLoading, validateUsername } = AuthStage.useSubmittingOtpUsername(
		(username: string) => Auth.signIn(username)
	);
	const [username, setUsername] = React.useState("");

	return (
		<section className={classnames("auth-stage", { "auth-stage--active": isActive })}>
			<Form submitCb={validateUsername} cbParams={[username]}>
				<Form.Elements disabled={!isActive || isLoading} error={error}>
					<Form.InputGroup
						error={error}
						id="otpUsername"
						inputType="email"
						isActive={isActive}
						label="Enter an email address"
						value={username}
						valueSetter={setUsername}
						testid="otpUsernameInput"
					/>
					<Form.Controls>
						<Form.Submit label="Submit username" testid="otpUsernameSubmit" />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</section>
	);
};

export const OtpInput = () => {
	const { error, isActive, isLoading, validateOtp } = AuthStage.useSubmittingOtp(
		async (user, password) => {
			await Auth.sendCustomChallengeAnswer(user, password);
			return Auth.currentAuthenticatedUser();
		}
	);
	const [otp, setOtp] = React.useState("");

	return (
		<section className={classnames("auth-stage", { "auth-stage--active": isActive })}>
			<Form submitCb={validateOtp} cbParams={[otp]}>
				<Form.Elements disabled={!isActive || isLoading} error={error}>
					<Form.InputGroup
						error={error}
						id="otp"
						inputType="text"
						isActive={isActive}
						label="Enter the OTP you have been sent:"
						value={otp}
						valueSetter={setOtp}
						testid="otpInput"
					/>
					<Form.Controls>
						<Form.Submit label="Submit OTP" testid="otpSubmit" />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</section>
	);
};

const PIN_KEY = "authentication_test_app_pin";

const LocalPinService = {
	async hasPinSet() {
		const storedPin = window.localStorage.getItem(PIN_KEY);
		return storedPin ? Promise.resolve() : Promise.reject();
	},
	async checkPin(pin: string) {
		const storedPin = window.localStorage.getItem(PIN_KEY);
		return storedPin && storedPin === pin ? Promise.resolve() : Promise.reject();
	},
	async setPin(pin: string) {
		try {
			window.localStorage.setItem(PIN_KEY, pin);
			return Promise.resolve();
		} catch {
			return Promise.reject();
		}
	},
	async changePin(newPin: string) {
		try {
			return await LocalPinService.setPin(newPin);
		} catch {
			return Promise.reject();
		}
	},
	async clearPin() {
		try {
			window.localStorage.removeItem(PIN_KEY);
			return Promise.resolve();
		} catch {
			return Promise.reject();
		}
	},
};

export const CheckPin = () => {
	const { error, isActive, isLoading, checkForExistingPin } = AuthStage.useCheckingForPin(() =>
		LocalPinService.hasPinSet()
	);

	return (
		<section className={classnames("auth-stage", { "auth-stage--active": isActive })}>
			<Form submitCb={checkForExistingPin}>
				<Form.Elements disabled={!isActive || isLoading} error={error}>
					<Form.Controls>
						<Form.Submit label="Check for an existing PIN" testid="checkPinSubmit" />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</section>
	);
};

export const CurrentPinInput = () => {
	const { error, isActive, isLoading, validatePin } = AuthStage.useSubmittingCurrentPin((pin) =>
		LocalPinService.checkPin(pin)
	);
	const [pin, setPin] = React.useState("");

	return (
		<section className={classnames("auth-stage", { "auth-stage--active": isActive })}>
			<Form submitCb={validatePin} cbParams={[pin]}>
				<Form.Elements disabled={!isActive || isLoading} error={error}>
					<Form.InputGroup
						error={error}
						id="currentPin"
						inputType="text"
						isActive={isActive}
						label="Enter your current pin:"
						value={pin}
						valueSetter={setPin}
						testid="currentPinInput"
					/>
					<Form.Controls>
						<Form.Submit label="Submit PIN" testid="currentPinSubmit" />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</section>
	);
};

export const NewPinInput = () => {
	const { error, isActive, isLoading, setNewPin } = AuthStage.useSubmittingNewPin((pin) =>
		LocalPinService.setPin(pin)
	);
	const [pin, setPin] = React.useState("");

	return (
		<section className={classnames("auth-stage", { "auth-stage--active": isActive })}>
			<Form submitCb={setNewPin} cbParams={[pin]}>
				<Form.Elements disabled={!isActive || isLoading} error={error}>
					<Form.InputGroup
						error={error}
						id="newPin"
						inputType="text"
						isActive={isActive}
						label="Enter a new PIN:"
						value={pin}
						valueSetter={setPin}
						testid="newPinInput"
					/>
					<Form.Controls>
						<Form.Submit label="Submit new PIN" testid="newPinSubmit" />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</section>
	);
};

export const ValidatePinInput = () => {
	const { error, isActive, isLoading, validatePin } = AuthStage.useValidatingPin((pin) =>
		LocalPinService.checkPin(pin)
	);
	const [pin, setPin] = React.useState("");

	return (
		<section className={classnames("auth-stage", { "auth-stage--active": isActive })}>
			<Form submitCb={validatePin} cbParams={[pin]}>
				<Form.Elements disabled={!isActive || isLoading} error={error}>
					<Form.InputGroup
						error={error}
						id="currentPin"
						inputType="text"
						isActive={isActive}
						label="Enter your current pin:"
						value={pin}
						valueSetter={setPin}
						testid="currentPinInput"
					/>
					<Form.Controls>
						<Form.Submit label="Submit PIN" testid="currentPinSubmit" />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</section>
	);
};

export const ChangePinInput = () => {
	const { error, isActive, isLoading, changePin, cancelChangePin } = AuthStage.useChangingPin(
		(newPin) => LocalPinService.changePin(newPin)
	);
	const [oldPin, setOldPin] = React.useState("");
	const [newPin, setNewPin] = React.useState("");

	return (
		<section className={classnames("auth-stage", { "auth-stage--active": isActive })}>
			<Form submitCb={changePin} cbParams={[oldPin, newPin]}>
				<Form.Elements disabled={!isActive || isLoading} error={error}>
					<Form.InputGroup
						error={error}
						id="oldPinToChange"
						inputType="text"
						isActive={isActive}
						label="Enter your current PIN:"
						value={oldPin}
						valueSetter={setOldPin}
						testid="oldPinInput"
					/>
					<Form.InputGroup
						error={error}
						id="newPinToSet"
						inputType="text"
						isActive={isActive}
						label="Enter your new PIN:"
						value={newPin}
						valueSetter={setNewPin}
						testid="newPinSubmit"
					/>
					<Form.Controls>
						<Form.SecondaryAction
							label="Cancel PIN change!"
							actionCallback={cancelChangePin}
							testid="newPinCancel"
						/>
						<Form.Submit label="Change your PIN" testid="newPinSubmit" />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</section>
	);
};

export const Authenticated = () => {
	const { isActive, requestLogOut, requestPinChange } = AuthStage.useAuthenticated();

	return (
		<section className={classnames("auth-stage", { "auth-stage--active": isActive })}>
			<Form submitCb={requestLogOut}>
				<Form.Elements disabled={!isActive}>
					<Form.Controls>
						<Form.Submit label="I want to log out!" testid="AuthenticatedLogOutSubmit" />
					</Form.Controls>
				</Form.Elements>
			</Form>
			<Form submitCb={requestPinChange}>
				<Form.Elements disabled={!isActive}>
					<Form.Controls>
						<Form.Submit label="I want to change my PIN!" testid="AuthenticatedPinChangeSubmit" />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</section>
	);
};

export const LoggingOut = () => {
	const { error, isActive, isLoading, logOut, cancelLogOut } = AuthStage.useLoggingOut(() =>
		Auth.signOut()
	);

	return (
		<section className={classnames("auth-stage", { "auth-stage--active": isActive })}>
			<Form submitCb={logOut}>
				<Form.Elements disabled={!isActive || isLoading} error={error}>
					<Form.Controls>
						<Form.SecondaryAction
							label="Cancel logout!"
							actionCallback={cancelLogOut}
							testid="LoggingOutCancel"
						/>
						<Form.Submit label="I really do want to log out!" testid="LoggingOutSubmit" />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</section>
	);
};
