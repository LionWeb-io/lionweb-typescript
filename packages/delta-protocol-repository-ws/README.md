# The `delta-protocol-repository-ws` package

[![license](https://img.shields.io/badge/License-Apache%202.0-green.svg?style=flat)
](./LICENSE)

An NPM package that can be added to a Node.js/NPM codebase as follows:

```shell
$ npm add @lionweb/delta-protocol-repository-ws
```

The TypeScript implementation of a repository that complies with the LionWeb delta protocol – in the form of the `LionWebRepository` class – in this package is ***entirely incomplete***.
It mainly serves as a way to be able to run and test the TypeScript implementation of the LionWeb client, at least to the extent that a client can send queries and commands and get responses that are somewhat plausible.
The C# implementation *is* complete and should be used for actual use.


## Development

Build this package from source as follows:

```shell
npm run build
```

