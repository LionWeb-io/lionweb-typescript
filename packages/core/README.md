# The `core` package

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

### 0.5.0

This is the first version corresponding to a release of LionWeb (version: 2023.1) as a whole.

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
$ ./build.sh
```

