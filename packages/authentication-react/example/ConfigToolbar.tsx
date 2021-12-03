import React from "react"
import classnames from "classnames";
import type { Dispatch, ReactNode } from "react";
import { CONFIG_STORAGE_KEY, useConfigUpdate } from "./ConfigInjector";

/**
 * Toolbar components to support the {@link ConfigInjector | `ConfigInjector` React context provider}.
 */

/**
 * The top-level toolbar container component, used as a namespace.
 *
 * @remarks
 * It is expected that the end user will want to hide the toolbar when is not not in use,
 * so a flag denoting this is available as a prop.
 */
const ConfigToolbar = ({
	children,
	toolbarOpen,
}: {
	children: ReactNode;
	toolbarOpen: boolean;
}) => (
	<section
		className={classnames("config-toolbar__wrapper", {
			"config-toolbar__wrapper--expanded": toolbarOpen,
		})}
	>
		{children}
	</section>
);

/**
 * The container for the actual toolbar itself.
 *
 * @remarks
 * The toolbar is a `<menu>`, but is wrapped in a `<div>` to make it easier to apply show/hide login via CSS.
 * The `active` prop allows for aria-related attributes + styling to be applied conditionally.
 */
const ConfigToolbarMenu = ({
	active,
	children,
}: {
	children: ReactNode;
	active: boolean;
}) => (
	<div className="config-toolbar__frame">
		<menu className="config-toolbar" id="configToolbar" role="toolbar" hidden={!active}>
			{children}
		</menu>
	</div>
);

/**
 * A button to control the state of the toolbar.
 *
 * @remarks
 * If the toolbar has show/hide logic applied, this control will be required to trigger the logic.
 */
const ConfigToolbarMenuControl = ({
	setToolbarOpen,
	toolbarOpen,
}: {
	toolbarOpen: boolean;
	setToolbarOpen: Dispatch<boolean>;
}) => (
	<button
		className={classnames("config-toolbar__control", {
			"config-toolbar__control--expanded": toolbarOpen,
		})}
		type="button"
		aria-controls="configToolbar"
		aria-expanded={toolbarOpen}
		aria-labelledby="configToolbarControlLabel"
		onClick={() => setToolbarOpen(!toolbarOpen)}
	>
		<span className="config-toolbar__control__icon" role="presentation">
			{toolbarOpen ? "✕" : "☰"}
		</span>
		<span id="configToolbarControlLabel" className="config-toolbar__control__label">
			{toolbarOpen ? "Close" : "Config"}
		</span>
	</button>
);

/**
 * An individual menu item for the toolbar, with a label and description.
 *
 * @remarks
 * The child of this component will always be one of the controls defined below.
 */
const ConfigToolbarMenuItem = ({
	children,
	description,
	label,
}: {
	children: ReactNode;
	description: string;
	label: string;
}) => (
	<li className="config-toolbar__item">
		<h2 className="config-toolbar__item__title">{label}</h2>
		<p className="config-toolbar__item__description">{description}</p>
		{children}
	</li>
);

/**
 * A collection of radio buttons that enable change to a config value controlled by `React.useState`.
 */
function ConfigToolbarStateSwitchInput<T extends string>({
	label,
	options,
	value,
	callback,
}: {
	label: string;
	options: T[];
	value: T;
	callback: Dispatch<T>;
}) {
	return (
		<fieldset className="radio-input-group">
			{options.map((option) => (
				<label
					className={classnames("radio-input", { "radio-input--active": option === value })}
					key={option}
				>
					<input
						type="radio"
						className="radio-input__control"
						name={label}
						value={option}
						checked={option === value}
						onChange={(e) => {
							const ok = window.confirm(
								`Are you sure you want to change the "${label}" setting to "${option}"?`
							);
							return ok ? callback((e.target as HTMLInputElement).value as T) : void 0;
						}}
					/>
					<span className="radio-input__label">{option}</span>
				</label>
			))}
		</fieldset>
	);
}

/**
 * A collection of radio buttons that enable change to a config value that makes use of the destructive
 * {@link UpdateCoreConfig | `updateCoreConfig()` function}.
 *
 * @remarks
 * Identical to the {@link Config.StateSwitchInput | `<Config.StateSwitchInput>` component}, but swaps
 * out the `callback` prop (there is one common function for all core config updates) for a `storageKey`
 * prop (the core configs are read from & stored in local storage).
 */
function ConfigToolbarCoreConfigSwitchInput<T extends string>({
	label,
	options,
	storageKey,
	value,
}: {
	label: string;
	options: T[];
	storageKey: CONFIG_STORAGE_KEY;
	value: T;
}) {
	const { updateCoreConfig } = useConfigUpdate();

	return (
		<fieldset className="radio-input-group">
			{options.map((option) => (
				<label
					className={classnames("radio-input", { "radio-input--active": option === value })}
					key={option}
				>
					<input
						type="radio"
						className="radio-input__control"
						name={label}
						value={option}
						checked={option === value}
						onChange={(e) => {
							updateCoreConfig(label, storageKey, (e.target as HTMLInputElement).value as T);
						}}
					/>
					<span className="radio-input__label">{option}</span>
				</label>
			))}
		</fieldset>
	);
}

/**
 * A checkbox input that toggles a boolean config value controlled by `React.useState`
 */
function ConfigToolbarCoreConfigToggleInput<T extends string>({
	label,
	storageKey,
	on,
	off,
	value,
}: {
	label: string;
	storageKey: CONFIG_STORAGE_KEY;
	on: T;
	off: T;
	value: T;
}) {
	const { updateCoreConfig } = useConfigUpdate();

	return (
		<fieldset className="toggle-input-group">
			<label className="toggle-input">
				<input
					type="checkbox"
					className="toggle-input__control"
					name={label}
					checked={value === on}
					onChange={() => {
						updateCoreConfig(label, storageKey, value === on ? off : on);
					}}
				/>
				<span className="toggle-input__label">{label}</span>
			</label>
		</fieldset>
	);
}

/**
 * References an action that can be executed with a single button (for example, nuking the local storage).
 */
const ConfigToolbarButtonAction = ({
	label,
	action,
	actionArgs = [],
}: {
	label: string;
	action: Function;
	actionArgs?: any[];
}) => (
	<div className="button-action-input-group">
		<button className="button button--primary" type="button" onClick={() => action(...actionArgs)}>
			{label}
		</button>
	</div>
);

ConfigToolbar.Menu = ConfigToolbarMenu;
ConfigToolbar.MenuItem = ConfigToolbarMenuItem;
ConfigToolbar.MenuControl = ConfigToolbarMenuControl;
ConfigToolbar.CoreConfigSwitchInput = ConfigToolbarCoreConfigSwitchInput;
ConfigToolbar.StateSwitchInput = ConfigToolbarStateSwitchInput;
ConfigToolbar.CoreConfigToggleInput = ConfigToolbarCoreConfigToggleInput;
ConfigToolbar.ButtonAction = ConfigToolbarButtonAction;

export { ConfigToolbar };
