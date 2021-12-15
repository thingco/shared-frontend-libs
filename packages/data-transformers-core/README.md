# `@thingco/data-transformers`

## Overview

Locale-aware and configurable data transformations for ThingCo frontends.
The library includes:

- conversion functions used internally but made available as exports
- math functions used internally but made available as exports
- string formatter functions
- calculation functions for dealing with business-specific values

The library functions are designed to react opaquely in-app to user preference
changes: for example if a user changes their preferred units from imperial to
metric, then the string formatters for distance and speed should reflect that
automatically.

So each formatter is a factory that returns the actual formater function itself.
By passing altered preferences to the factory, a new formatter is created.

## Installation

```
yarn add @thingco/data-transformers@{version}
```

> **NOTE** this library makes use of the browser `Intl` API. This is not an
> issue on web or on iOS, but the JS Core version used by React Native on
> Android does not include the API, and will need a polyfill.

## Testing and locales

 Tests are run using the "en-GB" locale. This *must* be set on the Docker
 container on the CI server, otherwise all date-based tests will fail
