# Changelog

## 0.8.0 — not yet released

* Receive the `IdOrUnresolved` type from the `core` package, and export that and the `idFrom` function.
* Improve the API surface of the `nodeBaseDeserializer[WithIdMapping]` functions:
    * Expose a `DeserializerConfiguration` type, which encompasses the (partially optional) parameters that are likely unchanging per invocation of the deserializer.
    * Use that type to as the single parameter to the `nodeBaseDeserializer[WithIdMapping]` functions.
      The original signature is also still valid, but deprecated.
    * Move the `propertyValueDeserializer` and `problem[s]Handler` parameters of the `Deserializer` type to the `DeserializerConfiguration` type.
      *Note* that this is a **breaking change**, but these parameters weren’t used outside of tests anyway.
* Simplify `Deserializer` type, by removing the `dependentNodes` parameter: (only) pass an appropriate instance of `IdMapping` instead.
  *Note* that this is a **breaking change**, but either parameter is optional and carries the same information, so this should avoid confusion and misuse.
* Add a `Forest` class that encapsulates a “forest” of partitions, together with their ID mapping, a factory, a deserializer – also deserializing into the forest –, and methods to apply deltas.
    * Add a `ObservableForest` class that is Mobx-observable.
* Propagate `reference` field of `LionWebJsonReferenceTarget` type now being `null`able.
* Fix that the annotations value manager always tries to detach an annotation to remove, even if it isn’t contained through the value manager’s container.
* Rename the `problemsHandler` property of the `DeserializerConfiguration` to `problemReporter` (also using the renamed type), keeping an alias for backward compatibility.
* Rename the `IdOrUnresolved` type to `IdOrNull`, without keeping an alias because this type is essentially for internal use only.
* Improve textualization: “none” for empty multi-valued links, and “not set” for unset single-valued links, instead of “nothing” in both cases.
* Remove all reference-related deltas, except for `Reference{Added|Changed|Deleted}Delta`.
  *Note* that this is a **breaking change**, due to a [change to the protocol specification](https://github.com/LionWeb-io/specification/issues/431), without providing backward compatibility e.g. by only deprecating those classes.
* Propagate the change to the `ResolveInfoDeducer` type from the `core` package.
* Expose the `nodeBaseReader` function that’s already used by packages downstream.
* Adjust the `Reference{Added|Changed|Deleted}Delta` delta types, replacing “target” with “reference”, and propagate that change to the entire codebase.
  *Note* that this is a **breaking change**, due to a [change to the protocol specification](https://github.com/LionWeb-io/specification/issues/414), without providing backward compatibility e.g. by only deprecating those classes.
* Remove the `CompositeDelta` and `Compositor` classes entirely.
  *Note* that this is a **breaking change**, due to a [change to the protocol specification](https://github.com/LionWeb-io/specification/issues/420), without providing backward compatibility e.g. by only deprecating those classes.


## 0.7.2

* Implement a `propertyValueSerializerWith` function that produces a `PropertyValueSerializer` instance to serialize properties’ values with, properly dealing with enumerations as well.
* Ensure that deltas w.r.t. features of a node are only emitted when that node is *attached*, i.e. it is a partition itself, or (in-/)directly contained by a partition.
* (Use the modified `MultiRef<T>` type instead of `SingleRef<T>[]` — this is an idempotent change.)


## 0.7.1

(The 0.7.0 release was deprecated because its `validation` package was faulty.)

* Replace util functions with ones from `ts-utils`.
* For the `IdMapping` class:
  * Add a method `tryFromId` that returns `undefined` on an unknown ID, rather than throwing an error.
  * Add `reinitializeWith` and `mergeIn` methods.
  * (Plus: add documentation to existing methods.)
* Add a method `combinedFactoryFor` to combine(/“compose”) (at runtime) the factories from multiple languages (represented by their `ILanguageBase` implementations) into one factory.
* Add multiple deltas – in all their aspects: types, (de-)serializers, appliers, inverters – that correspond to events from the delta protocol specification.
* Expand value managers with methods:
  * annotations: `moveAndReplaceAtIndex[Directly]`
  * containments: `replace{With|AtIndex}`
  * references: `removeAtIndexDirectly`, `moveAndReplaceDirectly`
* Add a `deltaReceiverForwardingTo` function that returns a delta receiver function that forwards received deltas to the given delta receivers.
* Add a `Compositor` class that can be used to gather deltas into composite deltas.
* Rename `DeltaHandler`, `handleDelta`, etc. to `DeltaReceiver`, `receiveDelta`, etc. to be more in line with C# implementation — keeping the previous names as legacy aliases.
  (And: `latching` &rarr; `latchingDeltaReceiverFrom`.)
* Improve performance of deserializer a little bit (— potentially).
* Implement inverters for all deltas.
* Fix single-containment and -reference value managers.
* (Fix a small cosmetic thing in `asTreeTextWith`: unset properties’ values now get shown as “`<not set>`” instead of as “`$<not set>`” — note the removed `$`.)
* Dependent nodes can now be passed to a deserializer as an `IdMapping` instance as well.


## 0.6.13

* Add a getter `referenceTargets` to `INodeBase` that – like the `children` getter for containments – returns an array of all nodes targeted by reference features (direct and inherited) of the classifier of the node.
    *Note* that these getters are (in principle) meant *for internal use only*!

