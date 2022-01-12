# `@theo/component-library`

**THIS [PURPOSELY] HASN'T BEEN SET UP TO COMPILE TO A LIBRARY AT THE MINUTE, DON'T TRY TO USE IT**

To run the styleguide, run `yarn workspace @theo/component-library styleguide`. Then
got to http://localhost:6060/ once it compiles.

## Overview

TODO

## How do I create a new component?

TODO

## Peer Dependencies

`@theo/component-library` requires the following packages be present in your application:

- [`react`](https://www.npmjs.com/package/react)
- [`react-dom`](https://www.npmjs.com/package/react-dom)
- [`shortid`](https://www.npmjs.com/package/shortid)
- [`@theme-ui/core`]
- [`@theme-ui/components`]
- [`@theme-ui/css`]

These are non-optional -- it is a React component library, so React/ReactDOM are necessary. Shortid is used for generating `key` props on `map`ped arrays of subcomponents (**TODO**: replace with Nanoid, which has no dependencies?)
