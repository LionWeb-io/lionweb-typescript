# The `core` package

[![license](https://img.shields.io/badge/License-Apache%202.0-green.svg?style=flat)
](./LICENSE)
[![CI](https://github.com/LionWeb-io/lionweb-typescript/actions/workflows/test.yaml/badge.svg)
](https://github.com/LionWeb-io/lionweb-typescript/actions/workflows/test.yaml)
[![npm](https://img.shields.io/npm/v/%40lionweb%2Fcore?label=%40lionweb%2Fcore)
](https://www.npmjs.com/package/@lionweb/core)

An NPM package that can be added to a Node.js/NPM codebase as follows:

```shell
$ npm add @lionweb/core
```
It contains:

* several base types
* the LionCore M3, including the `builtins` language
* functions for (de-)serialization


## Starting points

The following is a list of links to potential starting points:

* Implementation of the LionCore metametamodel (M3): see the [specific README](src/m3/README.md).
* Metamodel-generic/-aspecific code regarding:
  * [TypeScript type definitions](src/types.ts).
  * Representation of [references](src/references.ts).
  * [Serialization](src/serialization.ts).


## Changelog

### 0.6.9 - not yet released

* Improve deserialization:
  * Produce more meaningful messages for problems
  * Configure how problems are reported through an instance of a `SimplisticHandler`, calling a new function `deserializeLanguagesWithHandler`.
    The default value for the handler is `defaultSimplisticHandler` which just reports the problem to the JavaScript console (using `console.log`).
  * Pass dependent languages also _as languages_ from languages deserializer to regular deserializer, not just as referable data (which is only useful for the built-ins)

### 0.6.8

* With respect to deserialization:
  * Relax deserialization to just skip serialized nodes for which the corresponding M2 data can't be found.
  * Fix a bug w.r.t. enumeration literals — deserializing changed the keys of enumeration literals in the language's definition.
  * Deserialization doesn't throw on unresolvable references, but warns on the console and returns `null` (which means “unresolved”).
* Export `byIdMap` function, which computes a map id &rarr; thing from an array of things with an `id`, from the package.
* Made `SerializedProperty.value` `null`-able, to align with the specification.


### 0.6.7

* Fix cycle in imports that some bundlers were having trouble with.


### 0.6.6

* The serializer now also serializes annotations.
* Add support for custom primitive types.
  Specifically:
    * A new interface type `PrimitiveTypeSerializer`.
    * A default implementation `DefaultPrimitiveTypeSerializer` of that that's aware of the LionCore built-in primitive types.
    * `serializeNodes` has an additional argument of type `PrimitiveTypeSerializer` with as default value an instance of `DefaultPrimitiveTypeSerializer`.


### 0.6.5

* Add support for custom primitive types.
    Specifically:
  * A new interface type `PrimitiveTypeDeserializer`.
  * A default implementation `DefaultPrimitiveTypeDeserializer` of that that's aware of the LionCore built-in primitive types.
  * `deserializeSerializationChunk` has an additional argument of type `PrimitiveTypeDeserializer` with as default value an instance of `DefaultPrimitiveTypeDeserializer`.
* Expose function `inheritsFrom`.

### 0.6.4

* Add functions `mapValues` and `instantiableClassifiers`.
* Add a method `SymbolTable.languageMatching` to look up a language.

### 0.6.3

* The deserializer now deserializes all nodes in the serialization chunk, not just the root nodes (identified as having `parent` set to `null`).
  (This fixes [issue #145](https://github.com/LionWeb-io/lionweb-typescript/issues/145).)
  * Also: `deserializeChunk` is renamed to `deserializeSerializationChunk` for naming consistency, although `deserializeChunk` is retained as an alias.
* Add a method `metaType` to M3 types, to deduce classifiers' names from.
  (That fixes [issue #143](https://github.com/LionWeb-io/lionweb-typescript/issues/143).)

### 0.6.2

* Add a method `Classifier.metaPointer`.

### 0.6.1

* Introduce a `isBuiltinNodeConcept` function that checks whether a classifier happens to be the `Node` concept built into LionCore.
* Add a reference `annotates` to `Annotation`.

### 0.6.0

* Introduce a type `SymbolTable` to encapsulate lookup of languages' entities and their features.
  * Provide a naive and a memoising implementation of the `SymbolTable` abstraction, and use the latter in the deserializer to make that (a bit) more performant.

### 0.5.0

This is the first version corresponding to a release of LionWeb (version: 2023.1) as a whole.

* Remove JSON Schema generation functionality – this wasn't up-to-date at all.
* Implement persistence of annotations on `Node`s, including (de-)serialization.
* Added an optional field `resolveInfoFor` to the `ExtractionFacade` type, to compute the field `resolveInfo` field of a serialized reference target.
  The default used is to check whether a node instance implements `INamed` and takes the value of the `name` field.
* _Breaking change:_ `serializeLanguage` and `deserializeLanguage` are now "multi-lingual" in the sense that a serialization chunk can contain multiple `Language`s.
  As a result, these functions have been renamed to (the plural) `serializeLanguages` (with varargs), and `deserializeLanguages` (returning `Language[]`).
* (Bugfix:) Deserialize `Annotation`s.
* _Breaking change:_ Rework ID and key generation in the LionCore `LanguageFactory`.
  As part of that:
  * Add `String[s]Mapper` types, a `StringsMapper` instance `last`, and functions `concatenator` and `chain` to produce instances of them.
  * Remove `M3Node.keyed` and the "awkward" key generation in the `InstantiationFacade` for the LionCore language.
  * Remove types `IdGenerator`, and `KeyGenerator` and everything related to that.
  * Expose keys (instead of qualified names) for LionCore M3 and the LionCore built-ins.
* Add a type `DynamicINamed` and an M3-function `conceptsOf`, primarily for generation purposes.
* Move `asText` and ID checking to `@lionweb/utilities`.
* Expose a helper function `nameSorted`.
* Rename `ConceptInterface` &rarr; `Interface`.
* Change names: `ReadModelAPI` &rarr; `ExtractionFacade`, `WriteModelAPI` &rarr; `InstantiationFacade`.
* Change name of `concept` fields to `classifier`, and their types (where applicable) to `Classifier`.
* Fix `license` field in `package.json` to `"Apache-2.0"`.
* Replace all occurrences of "LIon" (with uppercase 'I') with "Lion" (with lowercase 'i').
* Split the `ModelAPI` interface into a read- and write-part: `ReadModelAPI` vs. `WriteModelAPI`.
* Make fixes w.r.t. multi-language models.
* Migrate from Deno to Node.js.
* Implement import of enums in Ecore importer.

No changelog has been kept for previous versions, regardless of whether these were published or not.


## Development

Build it from source as follows:

```shell
npm run build
```

