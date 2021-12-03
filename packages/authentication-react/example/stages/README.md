# Example app authentication stages

The authentication stage components make up the core of the development test
application. The all follow a common structure to allow the components to be
used by both the test application and by the model tests:

- UI text used for the component, defined in [../ui-copy.ts], is extracted. That
  is used rather than hardcoding to make it easier to run assertions against
	the components, providing a single source of truth.
- The functional UI is defined as a dumb component that relies only on props
	rather than values taken from hooks and exported. This is used in the model tests.
- The component used in the test app, relying on hooks, renders the functional
	UI component.

So each file:

- imports UI copy, and extracts the parts needed.
- defines a type for the dumb component props based on the return types of the
	given hook.
- exports a dumb component that can be reused to base tests on.
- exports a smart component that will be used in the test app, that uses the
	given authentication hook and renders the dumb component.
