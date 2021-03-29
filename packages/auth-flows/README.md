# @thingco/auth-flow-react

## Overview

XState-powered auth flow providers for React. Bring-your-own auth functions.

## Prerequisites

- [xstate](https://xstate.js.org/)
- [react/react-dom](https://github.com/facebook/react)
- the SDK/library for whichever authentication provider is being used. **REVIEW** _(just use an interface?)_ This then needs the functions required for the flow to be wrapped as an implementation of the abstract `Auth` class (types exported by this lib).

## Installation

```
yarn add xstate react react-dom @thingco/auth-flow-react
```
