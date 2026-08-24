# Changelog

## 0.10.0 — not yet released

* Add “`old*`” properties to `Move[AndReplace]{Child|Annotation}*Command`s, and propagate to delta&rarr;command translator.
* Implement splittable messages.
* Implement types for custom messages: `CustomMessageKind`, `Custom{Command|Event|Query{Response|Request}}`.
  * Implement a `isValidCustomMessageKind` function to check validity of a custom message kind — usable as a type guard for `CustomMessageKind`.
* Update to latest spec. of delta protocol, specifically:
  * Make all move[+replace] child in same containment and move[+replace] annotation in same parent commands and corresponding events offset-based.
  * Update translators for that.
  * Change message kind of `NoOpEvent` &rarr; `"NoOpEvent"`.
  * Uppercase prefix for message kinds of custom messages: `custom_` &rarr; `Custom_`.
* Add `deletedDescendants` property to the `PartitionDeletedEvent` type (and propagate to downstream packages as well).
* Add a `lionWebVersion` property – which defaults to v2023.1 – to the `DeltaToEventTranslatorConfiguration` configuration.
* Add a `lionWebVersion` parameter – which defaults to v2023.1 – as *1st* parameter to the `deltaToCommandTranslator` function.


## 0.9.0

* Update to latest spec. of delta protocol:
  * Implement missing query types.
  * Update `Reconnect*` types.
  * Change/replace delta protocol version 2025.1 &rarr; 2026.1.
  * Update references to delta protocol specification document.
  * Annotate query types with paragraph in specification.


## 0.8.0

* Remove all reference-related event and command types, except for the ones associated with adding, changing, and deleting a reference.
  *Note* that this is a **breaking change**, due to a [change to the protocol specification](https://github.com/LionWeb-io/specification/issues/431), without providing backward compatibility e.g. by only deprecating those classes.
  * Also remove all cross-translation code relating to those.
* Propagate the change to the `ResolveInfoDeducer` type from the `core` package.
* Make all message parameters that are declared with **`?`** postfix optional, i.e.: the corresponding key doesn’t need to be present in the JSON.
* Adjust the `Reference{Added|Changed|Deleted}Event` and `{Add|Change|Delete}ReferenceCommand` types, replacing “target” with “reference”, and propagate these changes to the entire codebase.
  *Note* that this is a **breaking change**, due to a [change to the protocol specification](https://github.com/LionWeb-io/specification/issues/414), without providing backward compatibility e.g. by only deprecating those classes.
* Rename “protocol message” (in all its shapes) to “additional info”, most notably: the property `protocolMessages: ProtocolMessage[]` &rarr; `additionalInfos: AdditionalInfo[]`.
  This is propagated to the entire codebase.
  *Note* that this is a **breaking change**, due to a [change to the protocol specification](https://github.com/LionWeb-io/specification/issues/430), without providing backward compatibility e.g. by only deprecating those classes.


## 0.7.2

* Use the `propertyValueSerializerWith` function from the `class-core` package for the `deltaToCommandTranslator` and `deltaToEventTranslator` functions.
* Rename `CommandOrigin` &rarr; `CommandSource` to align with the official JSON Schema, and other implementations.
* Parametrize the `deltaToEventTranslator` function with generator functions for the `originCommands` and `protocolMessages` part of an event.
  * Use a configuration object (with defaults) instead of separate arguments.
  * Expose appropriate types for that configuration object.


## 0.7.1

(The 0.7.0 release was deprecated because its `validation` package was faulty.)

Initial creation and publication of this package.

