# The `utilities` package

An NPM package that can be added to a Node.js/NPM codebase as follows:

```shell
$ npm add @lionweb/utilities
```
It contains utilities on top of the `core` package, such as:

* diagram generation (PlantUML and Mermaid) from an M2
* an Ecore &rarr; M2 importer
* functions to sort or shorten a serialization to make introspection easier


## Changelog

### 0.5.0

This is the first version corresponding to a release of LionWeb (version: 2023.1) as a whole.

* Extend textual syntax for "multi-linguality".
* Implement textual syntax for `Annotation`s.
* _Breaking change:_ Change ID generation to hashing (`hasher` function).
* (Make small, cosmetic fix in `asText` function.)
* Add a function `tsTypesForLanguage` that generates TypeScript types.
* Receive `asText` and ID checking from `@lionweb/core`.

No changelog has been kept for previous versions, regardless of whether these were published or not.


## Development

Build it from source as follows:

```shell
$ ./build.sh
```

