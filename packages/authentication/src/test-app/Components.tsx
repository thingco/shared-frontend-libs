import classnames from "classnames";
import React from "react";

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

const FormSubmit = ({ label, testid }: { label: string; testid: string }) => (
	<button className="button button--primary" type="submit" data-testid={testid}>
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
	error,
	id,
	inputType,
	isActive,
	label,
	validationErrors,
	value,
	valueSetter,
}: {
	error: null | string;
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
				"input-group__input--error": !!error && isActive,
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
