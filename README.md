# ThingCo shared frontend libraries

## Overview

A set of shared libraries for use in frontend React/React Native-based applications

## Requirements

- **Node**. This is a hard requirement. Ideally use latest stable version, but shouldn't matter too much. (_NOTE_ there seem to be some issues around Node 15.x. If you are getting build issues and they seem to be Node-related, downgrade to 14.x).
- **[Yarn](https://yarnpkg.com/getting-started/install)**. This is a hard requirement. The project uses features only available in Yarn.

## Developing

Libraries are in the `packages/` directory. Each library is aliased in the root `package.json`, so you can run commands (`build`, `start`, `test` _etc_) direct from root -- for example `yarn package:auth-flows build`. Detailed information for each library is within its README.

Libraries are published as GitHub packages, available to all members of the ThingCo organisation.

> NOTE that they are published as CommonJS rather than ESModules; this is specifically to allow Jest (or any other Node-based test runner) to work as expected in the project consuming the package/s.

| Alias                                  | Library                            | Description                                                                |
| -------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------- |
| `yarn package:auth-flows`              | `@thingco/auth-flows`              | Drop-in React-based authorization flows, each with a configurable Provider |
| `yarn package:graphviz`                | `@thingco/graphviz`                | Static SVG-based chart/graph components for React/React Native             |
| `yarn package:react-component-library` | `@thingco/react-component-library` | Component library for React web apps                                       |
| `yarn package:unit-formatter`          | `@thingco/unit-formatter`          | Unit formatting functions packaged with a React provider                   |

The `playground/` directory contains the shell of a basic React app -- feel free to adjust that as you want to test out the libraries whilst developing.
