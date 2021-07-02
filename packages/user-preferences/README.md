# `@thingco/user-preferences`

## Overview

An React/React Native interface for storing user preferences ThingCo apps. Provides a provider (+ a hook for access/updating).

## Installation

Ensure your project is set up to allow pulling `@thingco/` namespaced packages from GitHub rather than NPM.

```
yarn add @thingco/user-preferences@0.1.0
```

It is necessary to provide a store implementation. You can build one yourself -- see the respective `user-preferences-store-` implementations as an example, they're very simple. But more likely
you will want to just use the web storage API or the React Native API. For web, you'll need React installed, then:

```
yarn add @thingco/user-preferences-store-web@0.1.0
```

For React native, you'll need React, React Native and AsyncStorage (`@react-native-async-storage/async-storage`) installed. Then:

```
yarn add @thingco/user-preferences-store-native@0.1.0
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

Then add the provider somewhere towards the very top of the component tree:

```jsx
{
	/* ...snip */
}
<UserPrefsProvider store={store}>
	{/* ...snip */}
	{children}
	{/* ...snip */}
</UserPrefsProvider>;
{
	/* ...snip */
}
```

You can now get and set the user preferences using the `usePrefs` hook.

## Usage

### Available preferences

> **I'm using Typescript. Why can't I change what the user preferences actually are (or, say, add to them)‽**
>
> The preferences are typed: they aren't freeform, you cannot just add arbitrary preference keys/values. This is by design.
>
> To amend them, go to `@thingco/shared-types` and do your adjustments there. This library doesn't care what the actual preferences are as long as they match what is defined in that package.
>
> **NOTE** that adding/removing/changing the preferences **will** require rebuilding of all dependent packages,
> followed by a version bump for each, followed by republishing.
>
> The reason the preferences are defined in a separate package is that they need to be available to:
>
> 1. This package, `@thingco/user-preferences`
> 2. The two preferences store packages, `@thingco/user-preferences-store-{native|web}`
> 3. The unit formatting package, `@thingco/unit-formatter`

```typescript
interface UserPreferences {
	/**
	 * Imperial or Si, so miles or kilometres (`"mi"` or `"km"`)
	 */
	distanceUnitPref: DistanceUnitPreference;
	/**
	 * The precision used to display distance units. Can be passed to formatting functions
	 * to round the displayed distance to the specified precision.
	 *
	 * Note that a precision of 0 will round to the nearest integer value.
	 */
	distanceUnitPrecisionPref: number;
	/**
	 * The locale used for formatting. Note that this is currently set as the Unicode
	 * organisation's BCP 47 scheme of language tags, using the "modern" set.
	 *
	 * Taken from https://github.com/unicode-org/cldr-json/blob/master/cldr-json/cldr-core/availableLocales.json
	 */
	localePref: LocalePreference;
	/**
	 * Whether to show time in 12 or 24 hour format, so "12" or "24". Note that this
	 * is a string -- it's a key, not a number.
	 */
	timeDisplayPref: TimeDisplayPreference;
}
```

### Hook

```typescript
function usePrefs(): {
	prefs: UserPreferences;
	setPref: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
};
```

The `usePrefs` hook returns an object with two properties: `prefs`, which is the `UserPreferences` object described above, and `setPref`, which is a function that accepts one of the object keys + a new value, and updates the value in the provider, saving it to the defined store as a side effect.

To _read_ preferences in components, the:

```jsx
const MyComponent = () => {
	const { prefs } = usePrefs();

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
	const { prefs, setPref } = usePrefs();

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
