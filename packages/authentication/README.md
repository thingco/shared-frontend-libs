# @thingco/auth-flow-react

## Overview

Hook-based authentication system for @thingco apps. Built on top the FSM library [XState](https://xstate.js.org). 

## Prerequisites

External peer dependencies are `react`, `xstate` and `@xstate/react`. Internal (as in thingco internal) peer dependencies are `@thingco/logger`.

## Installation and setup

In your React app, install the peer dependencies:

```
yarn add xstate @xstate/react
```

Then from the shared libraries:

```
yarn add @thingco/authentication @thingco/logger
```

And you will need the auth library being used:

```
yarn add @aws-amplify/auth
```

Configure the auth library as directed in the Amplify documentation. Then set up @thingco/authentication. At the entry point of the app:

```tsx
import { createAuthenticationSystem, AuthProvider } from @thingco/authentication;


const authSystem = createAuthenticationSystem({
	loginFlowType: "OTP" // this can be "OTP" or "USERNAME_PASSWORD", pull in value from app config
	deviceSecurityType: "PIN" // this can be "NONE" or "PIN", pull in value from app config
});

const MyApp = ({ children}: { children: React.ReactNode }) => (
	<AuthProvider authenticationSystem={authSystem}>
	  {children}
	</AuthProvider>
);
```

Now you have access to a set of hooks, one for each possible state in the authentication process. Build out a component for each one you are using and use the hook relating to it to access `isActive` and `isLoading` flags, submission methods, errors, validationErrors and any additional methods (`forgottenPassword`, for example).

Each hook accepts a callback function, which in the production app will be either one of the Amplify `Auth` methods or, for PIN flows, a method taken from a wrapper around secure storage layer. The library does _not_ know anything about how the callbacks work, only what shape the functions are to be. So for example

```
import { Auth } from "@aws-amplify/auth";
import React, {useState} from "react";
import { useAwaitingOtpInput } from "@thingco/authentication";

const AwaitingOtpUsernameInput = () => {
  const { error, isActive, isLoading, validateUsername } = useAwaitingOtpUsernameInput(Auth.signIn);
  const [username, setUsername] = useState("")

  if (!isActive) return null;

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      validateUsername(username)
    }>
      <fieldset disabled={isLoading}>
        <input type="text" onChange={(e) => setUsername(e.target.value)} value={username} />
        { error && <p>Error: {error}</p>}
        <button type="submit">Submit username</button>
      </fieldset>
    </form>
  );
};
```

## Developing

There is a fully-functional test application within the library: to run it, build:

```
yarn workspace @thingco/logger build
yarn workspace @thingco/authentication build
```

Then run it:

```
yarn workspace @thingco/authentication watch
```

It will build the code and serve it at localhost:3000.

