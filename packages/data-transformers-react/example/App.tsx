import React, { createContext, useState, useContext, Dispatch, ReactNode, SetStateAction } from "react";
import { useFormatter, FormatterHookOverrides  } from "@thingco/data-transformers-react"
import { ClockFormat, DateDisplayFormat, DistanceUnit, Locale } from "@thingco/data-transformers-core";

type PreferencesReadContextValue = FormatterHookOverrides
type PreferencesWriteContextValue = { [K in keyof FormatterHookOverrides as `set${Capitalize<K>}`]: Dispatch<SetStateAction<FormatterHookOverrides[K]>> }

const PreferencesReadContext = createContext<PreferencesReadContextValue | null>(null);
const PreferencesWriteContext = createContext<PreferencesWriteContextValue | null>(null);


const Preferences = ({ children }: { children: ReactNode }) => {
	const [locale, setLocale] = useState<Locale | undefined>("en-GB");
	const [clockFormat, setClockFormat] = useState<ClockFormat | undefined>("24");
	const [dateDisplayFormat, setDateDisplayFormat] = useState<DateDisplayFormat | undefined>("compact");
	const [distanceUnit, setDistanceUnit] = useState<DistanceUnit | undefined>("km");
	const [distanceUntilScored, setDistanceUntilScored] = useState<number | undefined>();
	const [precision, setPrecision] = useState<number | undefined>(0);
	const [showSeconds, setShowSeconds] = useState<boolean | undefined>(false);

	return (
		<PreferencesWriteContext.Provider value={{
			setLocale,
			setClockFormat,
			setDateDisplayFormat,
			setDistanceUnit,
			setDistanceUntilScored,
			setPrecision,
			setShowSeconds,
		}}>
			<PreferencesReadContext.Provider value={{
				locale,
				clockFormat,
				dateDisplayFormat,
				distanceUnit,
				distanceUntilScored,
				precision,
				showSeconds,
			}}>
				{children}
			</PreferencesReadContext.Provider>
		</PreferencesWriteContext.Provider>
	);
}

function useReadPreferences(): PreferencesReadContextValue {
	const prefContext = useContext(PreferencesReadContext);
	if (prefContext == null) {
		throw new Error("useReadPreferences can only be used within the scope of the preferences provider.")
	}
	return prefContext
}
function useWritePreferences(): PreferencesWriteContextValue {
	const prefContext = useContext(PreferencesWriteContext);
	if (prefContext == null) {
		throw new Error("useWritePreferences can only be used within the scope of the preferences provider.")
	}
	return prefContext
}

function useConfiguredFormatter(overrides: FormatterHookOverrides) {
	const prefs = useReadPreferences();
	const formatters = useFormatter(prefs)
	return formatters;
}

const AppHeader = () => {
	return (
		<header
			role="banner"
			aria-labelledby="bannerTitle"
			aria-describedby="bannerMeta"
			className="app__header"
		>
			<h1 id="bannerTitle" className="app__header__title">
				Data Formatters/Transformers
			</h1>
		</header>
	);
}

const FormatterExample = ({ children }: { children: ReactNode}) => {
	<section className="formatter-example">
		{ children }
	</section>
}

const FormatterExampleOverview = ({
	formatterId,
	description,
}: {
	formatterId: string;
	description: string;
}) => (
	<header
		className="auth-stage__header"
		aria-labelledby={`${formatterId}Example`}
		aria-describedby={`${formatterId}ExampleDesc`}
	>
		<h1 className="auth-stage__header__title" id={`${formatterId}Example`}>
			Example: {formatterId}
		</h1>
		<p className="auth-stage__header__description" id={`${formatterId}ExampleDesc`}>
			{description}
		</p>
	</header>
);

FormatterExample.Overview = FormatterExampleOverview;


export const App = () => {

	return (
		<Preferences>
			<div className="app">
				<AppHeader />
				<main className="formatter-examples">

				</main>
			</div>
		</Preferences>
	);
}
