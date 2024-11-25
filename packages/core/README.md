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


## Development

Build it from source as follows:

```shell
npm run build
```

