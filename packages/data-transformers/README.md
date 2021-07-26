# `@thingco/data-transformers`

## Overview

Locale-aware and configurable data transformations for ThingCo frontends. The library includes:

- string formatter functions
- calculation functions for dealing with business-specific values
- calculation functions for turning arrays of values into graph coordinates

The library functions are designed to react opaquely in-app to user preference changes: for example
if a user changes their preferred units from imperial to metric, then the string formatters for distance
and speed will reflect that automatically. This is the main reason for this library existing.

## Installation

The library requires that [`@thingco/application-configuration`](../application-configuration/README.md) be installed and set up. It makes direct
use of the `usePreferences` and `useConfig` hooks, so without those available it will break when used. See that library's readme for instructions.

```
yarn add @thingco/data-transformers
```

> **NOTE** this library makes use of the browser `Intl` API. This is not an issue on web or on iOS, but the JS Core version used by React Native on Android does not include the API, and will need a polyfill.

## Usage (formatters)

The `useFormatter()` hook returns a collection of formatter functions. Just give them a string or number and they will return a locale- and config-aware formatted string.

```typescript
function useFormatter(): {
	/**
	 * speed in kmph or mph depending on user preference.
	 */
	averageSpeed: (distanceInMetres: string | number, durationInSeconds: string | number) => string;
	/**
	 * returns a time in the form HH:MM (12 or 24 hr depending on user preference)
	 */
	compactDuration: (durationInSeconds: string | number) => string;
	date: (timestamp: string | number) => string;
	dateTime: (timestamp: string | number) => string;
	/**
	 * distance in km or mi depending on user preference.
	 */
	distance: (distanceInMetres: string | number) => string;
	/**
	 * the remaining distance on a block in km or mi depending on user preference.
	 */
	distanceUntilScored: (distanceCompletedInMetres: string | number) => string;
	expandedDuration: (durationInSeconds: string | number) => string;
	speed: (speedInKmph: string | number) => string;
	time: (timestamp: string | number) => string;
};
```
