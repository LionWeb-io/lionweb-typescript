# The `utilities` package

[![license](https://img.shields.io/badge/License-Apache%202.0-green.svg?style=flat)
](./LICENSE)
[![CI](https://github.com/LionWeb-io/lionweb-typescript/actions/workflows/test.yaml/badge.svg)
](https://github.com/LionWeb-io/lionweb-typescript/actions/workflows/test.yaml)
[![npm](https://img.shields.io/npm/v/%40lionweb%2Futilities?label=%40lionweb%2Futilities)
](https://www.npmjs.com/package/@lionweb/utilities)

This NPM package can be added to a TypeScript codebase as follows:

```shell
$ npm add @lionweb/utilities
```

It contains utilities on top of the `core` package, such as:

* Diagram generation (PlantUML and Mermaid) from an M2.
* “Textualization”, i.e. render a serialization chunk as text.
* Sort the contents of a serialization chunk as much as possible, for the sake of comparing serialization chunks.
* Compute metrics for a serialization chunk (also relative to a given M2).
* Infer a (partial) M2 from a serialization chunk.
* Generation of TypeScript type definitions from an M2.

Note that this package implicitly relies on Node.js, so effectively on the `@types/node` package, without stating that explicitly as a (production) dependency in `package.json`.
This enables using this package in browsers, as long as you don’t use the `readFileAsJson` and `writeJsonAsFile` functions.


## Development

Build it from source as follows:

```shell
npm run build
```

