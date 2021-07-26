# `@thingco/application-configuration`

## Overview

An React/React Native interface for storing application config and user preferences for ThingCo apps.

Provides a provider and two hooks:

`ApplicationConfigProvider` stores both build-time configs that we need to access within the app
(there are read-only), and user preferences, which modifiable and are persisted to device/browser storage.

```
<ApplicationConfigProvider configs={...buildTimeConfigs} store={userPreferencesStorageInterface}>
  ...rest of app
</ApplicationConfigProvider>
```

Because of what it contains, it needs to sit at the top of the app, everything else
feeds off it.

`useConfiguration` is a hook that allows access to configuration values -- it returns a plain object with
primitives for all values.

`usePreferences` is a hook that allows read and write access to persisted user preferences -- it returns an
object with two properties: the preferences themselves are a plain object under the key `prefs`, and the `setPref` method takes the key of a specific preference + new value and sets it both locally an in persisted
storage.

## Why use a provider for this?

There are three reasons:

1. `usePreferences` functionality is already in the app -- this package simply moves that API into this package -- and is required for reading/writing user preferences.
2. `useConfiguration` functionality moves configs into one single place in the app: this means that there is one place to write them to at build time, rather that multiple places. Following on from this:
3. It becomes easier to test, as there is a single provider to mock to inject configuration values into integration tests -- any components making use of configurations can just use a mock version of this provider, rather than having to fiddle around mocking disparate imports.

## Installation

Ensure your project is set up to allow pulling `@thingco/` namespaced packages from GitHub rather than NPM.

```
yarn add @thingco/config-provider
```

It is necessary to provide a store implementation. You can build one yourself -- see the respective `user-preferences-store-` implementations as an example, they're very simple. But more likely
you will want to just use the web storage API or the React Native API. For web, you'll need React installed, then:

```
yarn add @thingco/user-preferences-store-web
```

For React native, you'll need React, React Native and AsyncStorage (`@react-native-async-storage/async-storage`) installed. Then:

```
yarn add @thingco/user-preferences-store-native
```

## Setup

Import both the provider and the store. **Note** if you are on native, install AsyncStorage: it is required as a peer dependency.

```javascript
import { UserPrefsProvider } from "@thingco/user-preferences";
import { createPrefStore } from "@thingco/user-preferences-store-{native|web}";
```

Create the store. This will leverage localStorage on the web and AsyncStorage on native:

```javascript
const store = createPrefStore({
	distanceUnitPref: "km",
	distanceUnitPrecisionPref: 1,
	localePref: "en-GB",
	timeDisplayPref: "24",
});
```

You need to pass specific values for the config: like the preferences, these are typed, so
arbitrary values cannot be passed:

```javascript
const configs = {
	distanceUntilScored: 160934,
};
```

Then add the provider at the very top of the component tree:

```jsx
<ApplicationConfigProvider configs={configs} store={store}>
	{/* ...snip */}
	{children}
	{/* ...snip */}
</UserPrefsProvider>
```

You can now get and set the user preferences using the `usePreferences` hook, and get the configs by using the `useConfig` hook.

## Usage

### Available preferences

> **I'm using Typescript. Why can't I change what the user preferences actually are (or, say, add to them)‽**
>
> The preferences are typed: they aren't freeform, you cannot just add arbitrary preference keys/values. This is by design.
>
> To amend them, go to the `types` file in this repo and make your adjustments there. This library doesn't care what the actual preferences are as long as they match what is defined in that package.
>
> **NOTE** that adding/removing/changing the preferences **will** require rebuilding of all dependent packages,
> followed by a version bump for each, followed by republishing. Packages affected are:
>
> 1. This package, `@thingco/application-configuration`
> 2. The auth package, `@thingco/auth-flows`
> 3. The two preferences store packages, `@thingco/user-preferences-store-{native|web}`
> 4. The data transformations package, `@thingco/data-transformers`

### Hooks

#### `useConfig`

##### Interface

```typescript
interface ApplicationConfiguration {
	/**
	 * A distance (in metres) that represents the distance travelled will trigger
	 * creation of a new block. By default this will be 160934, _ie_ one mile in metres
	 */
	distanceUntilScored: number;
}
```

##### Usage

```typescript
function useConfig(): ApplcationConfig;
```

The `useConfig` hook returns an object containing all properties passed into the provider in the first place.

To _read_ the configs in components:

```typescript
const MyComponent = () => {
	const { distanceUntilScored } = useConfig();

	return (
		<dl>
			<dt>The distance in metres until a block score is complete and a score can be calculated:</dt>
			<dd>{distanceUntilScored}</dd>
		</dl>
	);
};
```

---

#### `usePreferences`

##### Interface

```typescript
interface UserPreferences {
	/**
	 * Imperial or Si, so miles or kilometres (`"mi"` or `"km"`)
	 */
	distanceUnit: DistanceUnitPreference;
	/**
	 * The precision used to display distance units. Can be passed to formatting functions
	 * to round the displayed distance to the specified precision.
	 *
	 * Note that a precision of 0 will round to the nearest integer value.
	 */
	distanceUnitPrecision: number;
	/**
	 * The locale used for formatting. Note that this is currently set as the Unicode
	 * organisation's BCP 47 scheme of language tags, using the "modern" set.
	 *
	 * Taken from https://github.com/unicode-org/cldr-json/blob/master/cldr-json/cldr-core/availableLocales.json
	 */
	locale: LocalePreference;
	/**
	 * Whether to show time in 12 or 24 hour format, so "12" or "24". Note that this
	 * is a string -- it's a key, not a number.
	 */
	timeDisplay: TimeDisplayPreference;
}
```

##### Usage

```typescript
function usePreferences(): {
	prefs: UserPreferences;
	setPref: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
};
```

The `usePrefs` hook returns an object with two properties: `prefs`, which is the `UserPreferences` object described above, and `setPref`, which is a function that accepts one of the object keys + a new value, and updates the value in the provider, saving it to the defined store as a side effect.

To _read_ preferences in components:

```jsx
const MyComponent = () => {
	const { prefs } = usePreferences();

	return (
		<dl>
			<dt>Distance unit:</dt>
			<dd>{prefs.distanceUnitPref}</dd>

			<dt>Distance unit precision:</dt>
			<dd>{prefs.distanceUnitPrecisionPref}</dd>

			<dt>Locale:</dt>
			<dd>{prefs.localePref}</dd>

			<dt>Time display (12 or 24 hour):</dt>
			<dd>{prefs.timeDisplayPref}</dd>
		</dl>
	);
};
```

To _write_ a preference:

```jsx
const MyComponent = () => {
	const { prefs, setPref } = usePreferences();

	const toggleDistancePref = () => {
		const currentPref = prefs.distanceUnitPref;
		setPref("distanceUnitPref", currentPref === "km" ? "mi" : "km");
	};

	return (
		<div>
			<p>Unit for distance is {prefs.distanceUnitPref}</p>
			<button onClick={toggleDistancePref}>Toggle pref</button>
		</div>
	);
};
```
