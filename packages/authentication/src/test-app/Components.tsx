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

const FormSubmit = ({ label }: { label: string }) => (
	<button className="button button--primary" type="submit">
		{label}
	</button>
);

const FormSecondaryAction = ({
	label,
	actionCallback,
}: {
	label: string;
	actionCallback: () => void;
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
	value,
	valueSetter,
}: {
	error: null | string;
	id: string;
	inputType: string;
	isActive: boolean;
	label: string;
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
		{error && isActive && <p className="input-group__error">{error}</p>}
	</div>
);

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
Form.Controls = FormControls;
Form.Submit = FormSubmit;
Form.SecondaryAction = FormSecondaryAction;
Form.InputGroup = InputGroup;

export { Form };
