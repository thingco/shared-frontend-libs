# @thingco/auth-flow-react

## Overview

> NOTE this is just the PR for the branch that contains this ATM, turn this into a REAME

- [ ] model tests for pin flow
- [ ] naming in auth system: change the extremely verbose `AuthenticationSystemFoo` to `AuthFoo`, as it is extremely onerous to type
- [ ] naming of internal typings of events in auth system (`TEvent`) and the inferred typing of events (from `EventsFrom<typeof model>`), latter use above convention (`AuthEvent`), use better naming for internal types
- [ ] Errors: currently there is a union type of errors. Ideally would be something like `AuthError<"ERROR_NAME">` and I'd get inference, but that's not going to happen so change this to an enum to stop accidentally writing the wrong error code when the codes are similar.
- [ ] Errors: once in enum, make the naming better -- currently a lot of them are just the name of the type, which would be fine (could just use `error: true|false` in the context) except that the incorrect OTP error (which includes the number of remaining tries and has to be dynamic, using a template literal type) messes up everything (and assumption would be the remaining tries would also need to be active for the reset password code as well).
- [ ] Several events have a REVIEW flag on them, where I want to see if we can be more specific about the type of error. This would help to _a_ indicate better what the auth system should do and _b_ allow for more informative errors for end users.

So

- Add a new package (`@thingco/authentication`) to prevent stepping on the existing package.
- This has a much simpler system: no async requests, very little config for the provider. The system simply says which state the user is in, and the user sends messages to change the state.
- This has a much more complex React implmentation: each state has a corresponding hook. That hook accepts a callback function. That hook exposes:
  1.  a function to make use of the callback and send appropriate messages
  2.  an `isLoading` flag for when the callback is processing
  3.  an `isActive` flag to say whether the state is actually currently active
  4.  an `error`, which is either null or one of AuthenticationSystemError string literal types
  5.  optionally, other callbacks that allow for extra messages to be sent (request a new password, or go back to previous state)
- The hooks are tested to ensure that each exposed state has a corresponding hook, and that each hook can send all events specified for that state in the system.
- The system is tested using model tests to ensure that a path to every state exists if the expected messages are sent, and that the system context contains the correct values at any one time.

So:

- external peer dependencies are `react`, `xstate` and `@xstate/react`
- internal (as in thingco internal) peer dependencies are `@thingco/logger`
- exports are
  1. the `createAuthenticationSystem` constructor function, which accepts a config object specifying the `loginFlowType` ("OTP" or "USERNAME_PASSWORD") and the `deviceSecurityType` ("NONE", "PIN" or "BIOMETRIC", though the latter has no implementations and probably needs to be dropped for now)
  2. the `AuthenticationSystemProvider`, which accepts the result of `createAuthenticationSystem` as a prop.
  3. a hook for each state, _eg_ `useAwaitingOtpInput`

The library does _not_ know anything about how the callbacks work, only what shape the functions are to be. So for example

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
