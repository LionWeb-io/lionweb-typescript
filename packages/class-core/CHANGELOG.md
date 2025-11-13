# Changelog

## 0.7.2

* Implement a `propertyValueSerializerWith` function that produces a `PropertyValueSerializer` instance to serialize properties’ values with, properly dealing with enumerations as well.
* Ensure that deltas w.r.t. features of a node are only emitted when that node is not “free-floating”, i.e. is not a partition itself, or (in-/)directly contained by a partition.
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

