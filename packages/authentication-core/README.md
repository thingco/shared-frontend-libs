# @thingco/authentication-core

## Overview

[XState](https://xstate.js.org)-powered authentication flow.

## Installation

This package contains only the state machine used to sequence authentication plus
the [Typescript] types. To use it in a React/React Native application, this
needs to be coupled with [@thingco/authentication-react](../authentication-react/README.md);
The library on its own will not do anything. It requires this companion to
initialise the state machine and send messages to it. It is however a peer of
the React library, so must be installed.

Because it is published to GitHub Packages, you will require a token to authenticate.
Follow the steps outlined in the given app -- they will specify the name of an
environment variable you will need to store the token under. Once done, can just

```
yarn add @thingco/authentication-core@{VERSION}
```

or

```
npm install @thingco/authentication-core@{VERSION}
```

**Note that the version must be included when installing, otherwise the package
manager will attempt to install from NPM's registry and fail. This is a specific
requirement of packages published to registries that are not NPM's own.**

## Remarks

The authentication process for ThingCo apps is not completely straightforward.

All being well, it runs:

1. User opens app, we check if they have a session.
2. They do?
		2.1 They are authenticated.
3. They do not?
		3.1 They enter and submit a username.
		3.2 We email them a one-time password (OTP).
		3.3 They enter and submit that OTP.
		3.4 They have a session, go to 2

In reality, it runs:

1. User opens app, we check if they have a session.
2. We set a flag denoting that login sequence has been completed to `false`.
2. They have a session?
		2.1 Go to 3.3
3. They do not have a session?
		3.1 They enter and submit a username.
		3.2 Username is valid?
			3.2.1 We email them a one-time password (OTP).
			3.2.1 They enter and submit that OTP.
			3.2.3 OTP is valid?
				3.2.3.1 Set the login sequence flag to `true`
				3.2.3.2 Go to 4
			3.2.4 OTP is invalid?
				3.2.4.1 Have they exceeded the number of allowed attempts?
					3.2.4.1.1 Display an error
					3.2.4.1.2 Go to 3.1
				3.2.4.2 Have they still got tries remaining?
					3.2.4.2.1 Display an error
					3.2.4.2.2 Go to 3.2.1
		3.2 Username is invalid?
			3.2.1 Display an error
			3.2.2 Go to 3.1
		3.3 We check whether they have a PIN
		3.4 They have a PIN?
			3.4.1 Check the login sequence completed flag.
			3.4.2 It is `true`?
				3.4.2.1 Go to 4
			3.4.3 It is `false`?
			  3.4.3.1 ...enter their current PIN, cue more conditional logic
		3.5 They do not have a PIN?
			3.5.1 ...set up a new PIN, cue more conditional logic
4. User is authenticated.
5. They wish to log out?
6. ...and so on

So, just writing this down is quite complicated. And much more complexity
hasn't been included -- for example, users may be using a different type of
authentication flow (username/password).

It could be programmed via a sequence of conditionals, but that becomes
incredibly difficult to manage. Instead, the system is modelled as a state
machine, using the XState library.

With this, the user can be in one (and only one) state at a time --
`SubmittingOTP`, or `Authenticated`. When in that state, the app can send a
message to the machine based on a user action (`SUBMIT_OTP` or `REQUEST_LOG_OUT`).
The state machine may then switch to a different state.

## Code structure

The state machine definition is in `src/auth-system.ts`. Enums have been used
for the state names rather than strings to cut down on typing errors.

The state machine definition is an object with a `states` property [natch] used
to define the states. Each state has a number of allowed `events`. When in a
state, if the machine is sent an event with an ID matching that of one of those
allowed events, it will execute a transition.

The state machine has a `context` property, which is an object where arbitrary
values may be stored. This is required to allow responses from the auth API
(username, the user object populated by Cognito responses, error messages) to
be held for use in other stages. The `actions` properties are used to assign/clear
values from the context.

The library exposes a factory function as its main entry point, which allows the
state machine to be created with a set of preconfigured context values. These
are provided at build time on a per-client basis, and specify which auth flow
to use, whether PIN security is to be used, the PIN length required, and how many
retries are allowed on OTP entry before a user is kicked back.

## Developing and publishing

The library is written in Typescript, and there is no build step: because it is
for internal consumption, we can currently guarantee it will be used in a
Typescript app, so it is safe to simply publish the raw Typescript code.

TODO: publishing

Model testing is used -- XState provides a library that generates every possible
path through a given machine, and each stage of each path can have assertions
to verify the expected state and context.

The test models are also XState machines, but are not the same as the core
machine itself -- they are designed to emulate a user's various paths through
the auth system. If changes are made to  the system, then when adding tests,
try to add states that describe what user would encounter at a specific point
in the auth flow.
