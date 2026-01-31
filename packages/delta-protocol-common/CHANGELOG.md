# Changelog

## 0.8.0 — not yet released

* Remove all reference-related event and command types, except for the ones associated with adding, changing, and deleting a reference.
  * Also remove all cross-translation code relating to those.
* Propagate the change to the `ResolveInfoDeducer` type from the `core` package.
* Make all message parameters that are declared with **`?`** postfix optional, i.e.: the corresponding key doesn’t need to be present in the JSON.


## 0.7.2

* Use the `propertyValueSerializerWith` function from the `class-core` package for the `deltaToCommandTranslator` and `deltaToEventTranslator` functions.
* Rename `CommandOrigin` &rarr; `CommandSource` to align with the official JSON Schema, and other implementations.
* Parametrize the `deltaToEventTranslator` function with generator functions for the `originCommands` and `protocolMessages` part of an event.
  * Use a configuration object (with defaults) instead of separate arguments.
  * Expose appropriate types for that configuration object.


## 0.7.1

(The 0.7.0 release was deprecated because its `validation` package was faulty.)

Initial creation and publication of this package.

