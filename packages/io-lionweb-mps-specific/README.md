# The `io-lionweb-mps-specific` package

[![license](https://img.shields.io/badge/License-Apache%202.0-green.svg?style=flat)
](./LICENSE)
[![CI](https://github.com/LionWeb-io/lionweb-typescript/actions/workflows/test.yaml/badge.svg)
](https://github.com/LionWeb-io/lionweb-typescript/actions/workflows/test.yaml)
[![npm](https://img.shields.io/npm/v/%40lionweb%2Fio-lionweb-mps-specific?label=%40lionweb%2Fio-lionweb-mps-specific)
](https://www.npmjs.com/package/@lionweb/io-lionweb-mps-specific)

This NPM package contains an implementation of the `io.lionweb.mps.specific` language.
The MPS implementation of that language is part of the `lionweb-mps` plug-in.
It's used to export MPS-specific language (structure) metadata as part of LionWeb language exports from MPS (in the LionCore M3 format).
More specifically, this pertains to metadata like the *alias*, *short description*, *documentation*, etc., of a language concept.

It can be added to a TypeScript codebase as follows:

```shell
$ npm add @lionweb/io-lionweb-mps-specific
```

