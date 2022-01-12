# `@thingco/shared-types`

## Overview

Contains shared type definitions to ensure consistency between certain packages within the shared frontend libraries repo. For example, we have `@thingco/user-preferences-react` and `@thingco/user-preferences-react-native` -- they both use a common interface, but the former leverages local storage whereas the latter leverages the React Native async storage lib.

## Usage

This library doesn't need any compilation step, and can just be imported into other packages within the repo.

In the respective `package.json`, add this to `"devDependencies"`:

```
"@thingco/shared-types": "workspace:0.1.0"
```
