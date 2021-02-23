# UI

- All text **must** be passed in as props or children. This allows I18n functionality to be added at the app level where it belongs.
- CSS Grid layouts **must not** be used. All components in the library need to be easily ported to React Native, React Native's implementation of [a subset of] CSS does not include grid, ispo facto no grid in this lib.
