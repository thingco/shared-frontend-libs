# `@thingco/data-transformers`

## Overview

Locale-aware and configurable data transformations for ThingCo frontends. The library includes:

- string formatter functions
- calculation functions for dealing with business-specific values
- calculation functions for turning arrays of values into graph coordinates

The library functions are designed to react opaquely in-app to user preference changes: for example
if a user changes their preferred units from imperial to metric, then the string formatters for distance
and speed will reflect that automatically. This is the main reason for this library existing.
