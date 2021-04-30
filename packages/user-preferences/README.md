# `@thingco/user-preferences`

## Overview

An React/React Native interface for storing user preferences ThingCo apps. Provides a provider (+ a hook for access/updating).

## I'm using Typescript. Why can't I change what the user preferences actually are (or, say, add to them)‽

You're in the wrong place. Go to `@thingco/shared-types` and do your adjustments there. This library doesn't care what the actual preferences are as long as they match what is defined in that package. If you're trying to set a preference to something that isn't defined there I'm afraid you're probably going to have a bad time.

## Installation

Ensure your project is set up to allow pulling `@thingco/` namespaced packages from GitHub rather than NPM.

```
yarn add @thingco/user-preferences@0.1.0
```

It is necessary to provide a store implementation. You can build one yourself -- see the respective `user-preferences-store-` implementations as an example, they're very simple. But more likely
you will want to just use the web storage API or the React Native API. For web, you'll need React installed, then:

```
yarn add @thingco/user-preferences-store-web@0.1.0
```

For React native, you'll need React, React Native and AsyncStorage (`@react-native-async-storage/async-storage`) installed. Then:

```
yarn add @thingco/user-preferences-store-native@0.1.0
```

## Usage

TODO
