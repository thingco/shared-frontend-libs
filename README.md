# ThingCo shared frontend libraries

## Overview

A set of shared libraries for use in frontend React/React Native-based applications

## Requirements

- **Node**. This is a hard requirement. Ideally use latest stable version, but shouldn't matter too much. (_NOTE_ there seem to be some issues around Node 15.x. If you are getting build issues and they seem to be Node-related, downgrade to 14.x).
- **[Yarn](https://yarnpkg.com/getting-started/install)**. This is a hard requirement. The project uses features only available in Yarn.

## Developing

Libraries are in the `packages/` directory. Each library is aliased in the root `package.json`, so you can run commands (`build`, `start`, `test` _etc_) direct from root -- for example `yarn auth-flows build`. Detailed information for each library is within its README.

Libraries are published as GitHub packages, available to all members of the ThingCo organisation.

| Library               | Description                                                                |
| --------------------- | -------------------------------------------------------------------------- |
| `@thingco/auth-flows` | Drop-in React-based authorization flows, each with a configurable Provider |
| `@thingco/graphviz`   | Static SVG-based chart/graph components for React/React Native             |

The `playground/` directory contains the shell of a basic React app -- feel free to adjust that as you want to test out the libraries whilst developing.
