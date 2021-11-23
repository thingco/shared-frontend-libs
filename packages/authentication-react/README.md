# @thingco/authentication-react

## Overview

React bindings for the [XState](https://xstate.js.org)-powered
[@thingco/authentication-core](../authentication-core/README.md) package.

It exports a provider (`AuthProvider`) that initialises the state machine, based
on an initial configuration, plus a hook for each state being used. The hooks
are used to send messages to the state machine -- they are passed a callback
(for example AWS Amplify's `Auth.currentSession`), and they execute that callback
and message the machine based on the response.

## Installation

This requires `react`, `@xstate/react`, `xstate` and `@thingco/authentication-core`
to be available as peer dependencies. So assuming it's a React/React Native app
and React is already installed:

```
yarn add xstate @xstate/react @thingco/authentication-core@{VERSION} @thingco/authentication-react@{VERSION}
```

```
npm install xstate @xstate/react @thingco/authentication-core@{VERSION} @thingco/authentication-react@{VERSION}
```
