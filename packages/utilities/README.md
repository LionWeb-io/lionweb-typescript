# The `utilities` package

[![license](https://img.shields.io/badge/License-Apache%202.0-green.svg?style=flat)
](./LICENSE)
[![CI](https://github.com/LionWeb-io/lionweb-typescript/actions/workflows/test.yaml/badge.svg)
](https://github.com/LionWeb-io/lionweb-typescript/actions/workflows/test.yaml)
[![npm](https://img.shields.io/npm/v/%40lionweb%2Futilities?label=%40lionweb%2Futilities)
](https://www.npmjs.com/package/@lionweb/utilities)

An NPM package that can be added to a Node.js/NPM codebase as follows:

```shell
$ npm add @lionweb/utilities
```
It contains utilities on top of the `core` package, such as:

* Diagram generation (PlantUML and Mermaid) from an M2.
* “Textualization”, i.e. render a serialization chunk as text.
* Sort the contents of a serialization chunk as much as possible, for the sake of comparing serialization chunks.
* An Ecore &rarr; M2 importer.


## Changelog

### 0.6.3

* Add a `inferLanguagesFromChunk` function that infers a language from a serialization chunk.
* Extend the functionality of the `measure` metrics function.
* Renaming for consistency and clarity:
  * `readChunk` &rarr; `readSerializationChunk`
  * `tryLoad[All]AsLanguages` &rarr; `tryRead[All]AsLanguages`
* `tryReadAllAsLanguages` combines all serialization chunks (that are the result of serializing `Language`s) into one before attempting to deserialize, in order to have cross-language references resolve.

### 0.6.2

* Add a function `measure` that computes metrics on a serialization chunk.

### 0.6.1

* Improve PlantUML and Mermaid diagram generation:
  * Primitive types now rendered as classes marked as "<<primitive type>>".
  * Concepts or Annotations that extend the "Node" concept built into LionCore don't show that.
  * Optional (single-valued) features are now shown with a question mark (`?`) directly after the type, instead of being marked as "<<optional>>".
  * Fix/add support for annotations.
* **Remove** all Ecore functionality (=[issue #121](https://github.com/LionWeb-io/lionweb-typescript/issues/121))

### 0.6.0

* Add support for annotations in diagram generation (PlantUML and Mermaid), and textualization.
* **Remove** the `shortenedSerializationChunk` function, as it isn't used, nor very useful compared to the sorting and textualization.
* _Breaking name changes_: rename `asText` &rarr; `languageAsText`, `shortenedSerialization` &rarr; `shortenedSerializationChunk`, `sortedSerialization` &rarr; `sortedSerializationChunk`.
* Expose an `isSerializedLanguages` function.
* Expose an `orderedSerializationChunk` function that aligns the JSON key-value pairs in a serialization chunk according to the specification of the serialization format. 
    That means that key-value pairs appear in precisely the same order as they do in the specification, and that missing key-value pairs are put in and get their default values.
* Expose a generic textual syntax for serialization chunks, through the `genericTreeAsText` function.
    This function is optionally language-aware: by providing an array of `Language`s as its second argument, it will try and look up `LanguageEntity` and `Feature` names instead of rendering their keys.

### 0.5.0

This is the first version corresponding to a release of LionWeb (version: 2023.1) as a whole.

* Update for the presence of annotations on a(ny) `Node`.
* Move the `readChunk` function from `@lionweb/cli` to `@lionweb/utilities`.
* Also generate TypeScript type definitions for `Annotation`s.
* Sort _everything_ in `sortedSerialization`.
* Extend textual syntax for "multi-linguality".
* Implement textual syntax for `Annotation`s.
* _Breaking change:_ Change ID generation to hashing (`hasher` function).
* (Make small, cosmetic fix in `asText` function.)
* Add a function `tsTypesForLanguage` that generates TypeScript types.
* Receive `asText` and ID checking from `@lionweb/core`.

No changelog has been kept for previous versions, regardless of whether these were published or not.


## Development

Build it from source as follows:

```
npm run build
```

