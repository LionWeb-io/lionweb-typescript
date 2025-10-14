# The `delta-protocol-common` package

[![license](https://img.shields.io/badge/License-Apache%202.0-green.svg?style=flat)
](./LICENSE)

An NPM package that can be added to a Node.js/NPM codebase as follows:

```shell
$ npm add @lionweb/delta-protocol-common
```

It contains the (production part of the) implementation of the delta protocol in TypeScript that’s not tied to any specific message transport protocol.
We’d typically use WebSockets for this, but browser and Node.js have slightly different implementations, so we chose to split the parts of the implementation that are message transport protocol-specific into separate packages.
This package therefore contains “common” stuff used by the downstream `delta-protocol-*` packages.




## Repository

The TypeScript implementation of a repository that complies with the LionWeb delta protocol – in the form of the `LionWebRepository` class – in this package is ***entirely incomplete***.
It mainly serves as a way to be able to run and test the TypeScript implementation of the LionWeb client, at least to the extent that a client can send queries and commands and get responses that are somewhat plausible.
The C# implementation *is* complete and should be used for actual use.


## Development

Build this package from source as follows:

```shell
npm run build
```

