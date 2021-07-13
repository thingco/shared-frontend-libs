# ThingCo shared frontend libraries

## Overview

A set of shared libraries for use in frontend React/React Native-based applications

## Requirements

- **Node**. This is a hard requirement. Ideally use latest stable version. Some build scripting put in place for newer work requires ESModule and top-level await support, so Node v15+, ideally.
- **[Yarn](https://yarnpkg.com/getting-started/install)**. This is a hard requirement. The project uses features only available in Yarn.


## Regarding publication method + consuming of published packages

The packages are published on GitHub, using GitHub Packages. In this case they are all NPM modules, so they are published to GitHub's own NPM repo. The packages are also private, and are only accessible to consumers with an access token they have generated -- _ie_ in practice the only people who will be able to install (or publish) are the members of the `@thingco` organisation on GitHub.

To publish or consume the packages, you will need to generate a Personal Access Token with the correct permissions (`packages:read` for consumption, `packages:read` and `packages:write` and `repo` for publishing). So

1. Go to GitHub -> click on your profile -> Settings -> Developer Settings -> Generate Personal Access Token.
2. Set the correct permissions, and call it `GITHUB_PACKAGES_READ_WRITE_TOKEN`.
3. Copy the token and store it as an env var on your machine.
4. Authenticate with Github: run `yarn npm login --scope=@thingco --publish`. The flags specify _a_ the organisation scope, and _b_ say that you want to use the settings you use to publish packages in that scope (in this case, to GitHub's NPM registry).
5. This will ask for your username, followed by a request for a token: this is the PAT that you just created.
6. You should now be authorised and authenticated.

If you are _publishing_, you can now use `yarn npm publish --tolerateRepublish` to publish new package versions. Note that the `--tolerateRepublish` flag just says not to error out if you try to publish a version that already exists: this means we can safely `foreach` through all packages and publish them _en masse_; Yarn will try for each one and just carry on to the next one if it can't publish.

If you are _consuming_, there should be nothing else to do -- within another existing app (with configs set), you should be able to just `yarn add @thingco/some-package` or `npm install @thingco/some-package` without issues. In an app where config has _not_ been set up, you'll need to add this to the `.yarnrc` file if it isn't there:

```
npmScopes:
  thingco:
    npmAuthToken: "${GITHUB_PACKAGES_READ_WRITE_TOKEN}"
    npmRegistryServer: "https://npm.pkg.github.com
```

In npm apps, you'll need to adjust configs in an `npmrc` file afaik, so consult the GH packages & NPM docs -- I'm not as familiar with this as I am with Yarn workflows.



## Developing

To do an initial pull down of dependencies, then building packages (some of which are interdependent), then sanity check at end to make sure all set up:

```
yarn install
yarn packages:build-all
yarn
```

Libraries are in the `packages/` directory. Each library is aliased in the root `package.json`, so you can run commands (`build`, `start`, `test` _etc_) direct from root -- for example `yarn package:auth-flows build`. Detailed information for each library should be within its README, in theory. 

Libraries are published as GitHub packages, available to all members of the ThingCo organisation.



The `playground/` directory contains the shell of a basic React app -- feel free to adjust that as you want to test out the libraries whilst developing.
