# README

This NPM package holds the generic, language-**a**specific base layer for generated TypeScript APIs.
This base layer includes reflectivity, support for the **delta protocol** and observability through [the MobX framework](https://mobx.js.org/README.html).
In addition, it contains functions that provide (de-)serialization and some convenience.


## Installation

Run the following command to add this package to an NPM-based project:

```shell
npm add @lionweb/class-core
```

This adds this package as a dependency to your NPM-based project.

*Note* that this package is typically a direct dependency of API packages, and possibly re-exported from those to avoid having to add it as a separate dependency.


## Direct usage

The following top-level members of this package are suitable and intended to be used directly.

* `allNodesFrom` — Computes all descendant nodes from the given node, including that node itself.

* `deepClonerFor` — Given `ILanguageBase`s and an optional `DeltaHandler`, it returns a function that clones the given nodes, *without* altering the IDs.

* `deepCopierFor` — Given `ILanguageBase`s and an optional `DeltaHandler`, it returns a function that clones the given nodes, generating new IDs for all the duplicated nodes.

* `incomingReferences` — Finds all references coming into the given target node or any of the given target nodes, within the given search scope.

* `nodeBaseDeserializerWithIdMapping` — Returns a `Deserializer` function for the given languages (given as `ILanguageBase`s) that, given a serialization chunk, returns an object with the `roots` of the model (as `INodeBase`s) and an instance `idMapping` of the `IdMapping` class (see below).

* `nodeBaseDeserializer` — Returns a `Deserializer` function for the given languages (given as `ILanguageBase`s) that, given a serialization chunk, returns the roots of the model (as `INodeBase`s).

* `serializeNodeBases` — Returns a serialization of the given nodes (of type `INodeBase`) as a `LionWebJsonChunk`.

* A version of the LionCore builtins language, compatible with the `class-core` base types:
  * `LionCore_builtinsBase` reflective class – implements `ILanguageBase`,
  * the abstract `Node` class (corresponding to the `Node` interface, unfortunately of the same name),
  * the `INamed` interface,
  * and the `String`, `Boolean`, `Integer`, and `JSON` (*) primitive types.
    *) To be deprecated in version 2024.1 of LionWeb.

The `IdMapping` class should not be used directly but is exposed (as a type) because an instance of it is returned by the `nodeBaseDeserializerWithIdMapping` function.

### Specifically for deltas and changes

The list above does not contain the top-level members of this package specifically pertain to the implementation of the delta protocol:

* All deltas implement the `IDelta` interface.

* The `DeltaHandler` type represents functions that handles a delta.
  Such a function has to be passed to invocations `<concrete classifier>.create(<id>, <handleDelta>)` and various other places, in order to “hook up” to the delta protocol.
  Such a place is recognizable from the presence of an argument `handleDelta?: DeltaHandler`.

* Deltas can be applied to a model state using the `applyDelta[s]` and `applyDelta[s]applyDeltaWithLookup` functions.
    The functions with plural `Deltas` in their names apply the given array of `IDelta`s in that order.
    The functions with the `WithLookup` postfix in their names take an additional `IdMapping` instance, and apply the given delta(s) to the nodes managed by that ID mapping.

* The `invertDelta` function *inverts* a given `IDelta` instance, in the sense that it undoes that delta after it has been applied.

* The `deltaDeserializer` function deserializes previously-serialized deltas (of type `SerializedDelta`)

* The `serializeDelta` function serializes a given `IDelta` as a `SerializedDelta`.


## Architecture

### Base types

The starting point of this package is the `INodeBase` interface, which is a specialization (extension) of the `Node` interface from `@lionweb/core`.
The abstract class `NodeBase` is its implementation which is used exclusively to extend from by classes corresponding to LionWeb classifiers.
Everywhere else, you'll see `INodeBase` being referenced.
A node object represented as an `INodeBase` has (at least) the following characteristics:

1. It knows whether and how it's contained by a parent.
2. It knows what its classifier is.
3. It manages the values of its features through *value managers* (see below) that are wired up for observability (according to the MobX framework) and emission of deltas according to the delta protocol.

An implementation of the `ILanguageBase` interface captures three base aspects of a language:

1. Its language definition of type `Language` as a static member `INSTANCE`.
2. A `factory` method that – given an optional `DeltaHandler` produces a `NodeBaseFactory`, which (in turn) is a function that, given a `Classifier` instance, produces the appropriate `INodeBase` instance with the provided `id`, `classifier`, and `handleDelta` arguments.
3. A `enumLiteralFrom` method that produces a runtime representation of a given `EnumerationLiteral`.

### Value managers

A value manager is an object that manages either the value on a node object of a specific feature of a classifier (a feature value manager), or the annotations on a node object (an annotations value manager).
Every feature value manager is a subclass of `FeatureValueManager`.
A concrete implementation exists for every (combination of) feature meta kind (property, containment, reference) and cardinality, as determined by the `optional` flag of a feature, and the `multiple` flag of a *link* – i.e.: containment or reference – feature.
(A flag is a boolean field.)

The following table explains the notation we use from here on for cardinalities:

| *notation* | optional | multiple (link only) |
|------------|----------|----------------------|
| 1          | false    | false                |
| 0..1       | true     | false                |
| 1..*       | false    | true                 |
| 0..*       | true     | true                 |

(This notation for cardinality is aligned with MPS.)

All value managers provide the following members:

* A `property`, `containment`, or `reference` getter that returns the `Feature` (of the corresponding subtype) this instance manages the values for.
* An `isSet` method that returns whether the feature managed has a value set.

Beyond this, all value managers expose various (and varying) methods to access the managed values, and to manipulate them.
These methods come in two varieties:

* *With* a `Directly` postfix:
  These only update the underlying managed and observable value(s), including updating ***parentage*** – i.e.: the way that node members of the value are contained by their parent node – for children and annotation, and MobX gets notified about the change.
  **Note** that the current implementation doesn't follow the rule that these `Directly` methods also update parentage everywhere yet.
* *Without* that postfix:
  These methods first check against the cardinality of the feature, throwing an appropriate `Error` if the managed value or its intended state change doesn't match the cardinality.
  If they don't throw an error, they proceed to call the corresponding method with `Directly` postfix, and also emit the appropriate delta.

There are two value manager classes for properties, for cardinalities `1` and `0..1`.
Both expose 2x2 methods: `get[Directly]`, and `set[Directly]`.
These do the obvious things.

All link – i.e.: containment and reference – value managers expose the following methods:

* `get[Directly]` — Returns the managed value whose type is directly dependent on the details of the feature.
* `set[Directly]` — Sets the managed value of a single-valued link feature.
* `add[Directly]` — Adds the given value to the managed value.
  For a single-valued link, an `Error` is thrown when a value was already present.
  The `addDirectly` method is specifically used by the deserializer and deep-cloner/-copier.

All multi-valued link value managers also expose the following methods:

* `insertAtIndex[Directly]` — Inserts the given node at the specified index, shifting all already-present nodes “to the right” – i.e.: incrementing their indices.
  (It throws if the specified index is invalid.)
* `removeDirectly[Directly]` — Removes the given node from the nodes in the managed value.
  If the given node is not present, nothing happens.
  If the given node is present more than once, only the first one gets removed.
* `move[Directly]` — Moves the node at the given old index to the new index, shifting any remaining nodes accordingly.

There's only one class for annotation: `AnnotationsValueManager`.
It exposes the following API:

* `get` — Returns the annotations.
  (There's no `getDirectly` here.)
* `add[Directly]` — Appends the given annotation to the end of the array of annotations.
* `insertAtIndex[Directly]` — Inserts the given annotation at the specified index, shifting all already-present annotations “to the right” – i.e.: incrementing their indices.
  (It throws if the specified index is invalid.)
* `move[Directly]` — Moves the annotation at the given “old” index to the “new” index.
  (It throws if either of the specified indices are invalid.)
* `replaceAtIndex[Directly]` - Replaces the annotation at the specified index with the given annotation.
  (It throws if the specified index is invalid.)
* `remove[Directly]` — Removes the given annotation from the managed annotations.
  If the given annotation is not present, nothing happens.
  If the given annotation is present more than once, only the first one gets removed.

