# Frontend System Architecture

## Overview

This is a detailed prospective overview of how the ThingCo frontend applications are structured, how they relate to one another, and how they are built.

ThingCo's frontend applications, along with the hardware, are a visible manifestation of the business.

1. From a _technical_ point of view, they must be reliable and error-free.
2. From a _usability_ point of view, they must function as expected and without causing confusion.
3. From a _design_ point of view, they must be highly polished.
4. From a _flexibility_ point of view, they must be configurable at a base level (_ie_ the particular set of keys required to access a particular client's systems) per-client, reflect the branding of the the client they belong to, and allow for features specific to the needs of that client.
5. From a _development_ point of view, there should ideally be only one way to do any one thing. There should be common coding conventions. Interfaces should be strongly defined. Tooling should be in place to prevent coding errors. Code reviews need to be given a higher priority. Decisions should be based on data rather than guesswork.

## Motivation

At the time of writing, some of the patterns discussed here exist in the current codebase. Some do not. And some exist only in a half-formed state.

Initially, this document aims to consolidate the ideas I've tried to implement and to provide a clear pathway toward a consolidated codebase. However, this is a living document: the ideas contained need to be reviewed and amended. Once what is discussed here is reified, the document should then always reflect the current state of ThingCo's frontend.

#### 1. Technical

This covers development, technology choice, project structure, development tooling and deployment strategies, and is the core focus of this document.

Note that the following assumes React-based JavaScript applications.

- The applications should have a common coding style and have tooling in place to prevent trivial coding errors.
- The applications should use only a small set of common, well understood external libraries. The number of these should be kept to a minimum.
- Common shared functionality that is under ThingCo control should be generalised and split out into small libraries. As much as possible these should be stateless collections of functions with no dependencies. _These need to be heavily unit tested and fully documented._
- Logic within the specific applications should [as much as is possible] be isolated into domain-specific internal dependencies. The applications themselves should be as dumb as possible.
- Each application is built multiple times with different configurations specific to different clients. The properties of these configurations are always identical; it is only the values that change. The process of manually writing these configurations is susceptible to human error. There should be a method of doing this for which the capacity for human error is reduced to a minimum.
- These configurations should be simple serializable JS objects that are imported where used, and exist in the app at build time.
- Where possible, configurations should be passed into the applications at a single point via a top-level provider that controls functionality for that specific configuration. This isolates the state associated with it and allows the functionality to be easily mocked.
- This pattern applies to most stateful logic -- where possible, isolate into individual providers, and keep the rest of the application components as dumb as possible.
- Component parts of the applications should rely as much as possible on components defined in a common shared library. Layouts will be specific to a given application, but otherwise development should involve plugging together preexisting components in a lego-like manner.
- The components should provide instrumentation hooks for testing (generally as simple as ensuring an ID must be provided for a test framework to locate).
- CI should build and test constantly, and this process should be debuggable.
- CI for mobile apps and the resultant app store distribution must work reliably, and be usefully debuggable. A custom docker container is likely something that will be necessary to speed up builds (if Expo is used, need the CLI + Turtle CLI).
- Error reporting/logging needs to be built in at ground level to provide immediate useful feedback.

#### 2. Usability

- Accessibility needs to be built in at ground level. This is not simply to allow for less-able users: maintaining accessibility standards will generally make the applications work better for all users.
- Analytics (and speaking directly to users) need to be leveraged to identify problem areas.
- The applications must work cross-browser (for web apps), and cross-platform (for mobile apps). The web applications should be responsive. A production deployment must work for all platforms.

#### 3. Design

- Design decisions should be based on data (analytics and speaking directly to users).
- There should be a common design language used for all applications.
- The component libraries need a Storybook-like test environment where they can be developed.

#### 4. Flexibility

- The applications must be constructed in a modular manner.
- The design must be able to have a specific set of values set to a client's preference -- essentially just specific colours + branding, but scope of this should be amenable to future expansion.
- The build configurations need a central place for defining them. This needs to be internally accessible to ThingCo developers.
- These build configurations then need to be included in each application as described in the technical section above.
- Features specific to a client/environment must be defined with the build configs. A feature provider should be used at the top level of a given application that accepts feature flags, then a feature component should be used on whichever areas of an application are affected. Note that this also opens up the possibility of things like a/b testing of features or time-delayed features (for example).
