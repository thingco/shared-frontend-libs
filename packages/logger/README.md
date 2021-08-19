# `@thingco/logger`

## Overview

Logging for frontend apps.

## Prerequisites

- [react](https://github.com/facebook/react)

## Installation

If not already installed, then:

```
yarn add react
```

Then the library

```
yarn add @thingco/logger
```

## Usage

The package exports two functions: the `useLogger` hook just uses the default logging implementation, `console`, and provides `info`, `log`, `warn` and `error` functions. The implementation:

```ts
type LoggerImplementation = {
	info: (...args: any[]) => void;
	log: (...args: any[]) => void;
	warn: (...args: any[]) => void;
	error: (...args: any[]) => void;
};
```

And the usage:

```tsx
import React, { useEffect } from "react";
import { useLogger } from "@thingco/logger";

const ComponentUsingLogging = () => {
	const logger = useLogger();

	useEffect(() => {
		logger.info("some info");
		logger.log("a log");
		logger.warn("a warning");
		logger.error("oh noes!");
	}, []);

	return <p>Hello!</p>;
};
```

`createLogger` takes an implementation, allowing you to specify your own functionality for the four funcitons, and returns a function that allows access to them. It is a factory for creating your own `useLogger` hook:

```tsx
import React, { useEffect } from "react";
import { mySuperLoggingLibrary } from "super-duper-log";
import { createLogger } from "@thingco/logger";

const useLogger = createLogger({
	info: mySuperLoggingLibrary.info,
	log: mySuperLoggingLibrary.log,
	warn: mySuperLoggingLibrary.warn,
	error: mySuperLoggingLibrary.error,
});

const ComponentUsingCustomLogging = () => {
	const logger = useLogger();

	useEffect(() => {
		logger.info("some info");
		logger.log("a log");
		logger.warn("a warning");
		logger.error("oh noes!");
	}, []);

	return <p>Hello!</p>;
};
```
