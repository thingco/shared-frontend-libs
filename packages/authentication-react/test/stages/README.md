# Test authentication stages

The authentication stage components make up the core of the development test
application, and the UI is reused for the tests to allow for one source of truth.
They all follow a common structure:

- UI text used for the component, defined in [test-app/ui-copy.ts], is extracted. That
  is used rather than hardcoding to make it easier to run assertions against
	the components, providing a single source of truth.
- The functional UI, a dumb component, is imported from the test app.
- The component used in the tests, relying on hooks, renders the functional
	UI component.
- Assertions and input events specific to the component are defined alongside.

So each file:

- imports UI copy, and extracts the parts needed.
- imports a dumb UI component.
- imports callback stubs.
- exports a smart component that will be used in the test that uses the
	given authentication hook and renders the dumb component.
- exports any assertion/event functions specific to the component.

The callback implementations are all test doubles, so within the tests can have
their return values defined.
