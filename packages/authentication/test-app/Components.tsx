/* eslint-disable @typescript-eslint/no-explicit-any */
import classnames from "classnames";
import React from "react";

import { AuthStateId } from "core/enums";
import uiText from "./ui-copy";

export const AuthStageSection = ({
	isActive,
	children,
}: {
	isActive: boolean;
	children: React.ReactNode;
}) => (
	<section className={classnames("auth-stage", { "auth-stage--inactive": !isActive })}>
		{children}
	</section>
);

const AuthStageSectionOverview = ({
	description,
	errorMsg = "",
	isLoading,
	stageId,
}: {
	description: string;
	errorMsg: string;
	isLoading: boolean;
	stageId: AuthStateId;
}) => (
	<header
		className="auth-stage__header"
		aria-labelledby={`stage${stageId}`}
		aria-describedby={`stage${stageId}Desc`}
	>
		<h1 className="auth-stage__header__title" id={`stage${stageId}`}>
			State: {stageId}
		</h1>
		<dl className="auth-stage__header__meta metalist">
			<div className="metalist__property">
				<dt className="metalist__property-key" role="term">
					{uiText.authStages.common.meta.term.isLoading}
				</dt>
				<dd className="metalist__property-value" role="definition">
					{isLoading.toString()}
				</dd>
			</div>
			<div className="metalist__property">
				<dt className="metalist__property-key" role="term">
					{uiText.authStages.common.meta.term.error}
				</dt>
				<dd className="metalist__property-value" role="definition">
					{errorMsg || "n/a"}
				</dd>
			</div>
		</dl>
		<p className="auth-stage__header__description" id={`stage${stageId}Desc`}>
			{description}
		</p>
	</header>
);

AuthStageSection.Overview = AuthStageSectionOverview;

const FormElements = ({
	children,
	disabled,
	error,
}: {
	children: React.ReactNode;
	disabled: boolean;
	error?: null | string;
}) => (
	<fieldset
		className={classnames("form-elements", { "form-elements--error": !!error })}
		disabled={disabled}
	>
		{children}
	</fieldset>
);

const FormControls = ({ children }: { children: React.ReactNode }) => (
	<div className="form-controls">{children}</div>
);

const FormSubmit = ({ label }: { label: string }) => (
	<button className="button button--primary" type="submit">
		{label}
	</button>
);

const FormSecondaryAction = ({
	actionCallback,
	label,
}: {
	actionCallback: () => void;
	label: string;
}) => (
	<button className="button button--secondary" type="button" onClick={() => actionCallback()}>
		{label}
	</button>
);

const InputGroup = ({
	id,
	inputType,
	isActive,
	label,
	validationErrors = [],
	value,
	valueSetter,
}: {
	id: string;
	inputType: string;
	isActive: boolean;
	label: string;
	validationErrors: string[];
	value: string;
	valueSetter: (v: string) => void;
}) => (
	<div className="input-group">
		<label className="input-group__label" htmlFor={id}>
			{label}
		</label>
		<input
			className={classnames("input-group__input", {
				"input-group__input--error": validationErrors.length > 0 && isActive,
			})}
			id={id}
			name={id}
			type={inputType}
			value={value}
			onChange={(e) => valueSetter(e.target.value)}
			required={true}
		/>
		<ul>
			{validationErrors.map((err) => (
				<li key={err} className="input-group__validation-error">
					{err}
				</li>
			))}
		</ul>
	</div>
);

const FormError = ({ error }: { error: null | string }) => <p className="form__error">{error}</p>;

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

Form.Elements = FormElements;
Form.Error = FormError;
Form.Controls = FormControls;
Form.Submit = FormSubmit;
Form.SecondaryAction = FormSecondaryAction;
Form.InputGroup = InputGroup;

export { Form };
