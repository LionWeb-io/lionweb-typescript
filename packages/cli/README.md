# The `cli` package

[![license](https://img.shields.io/badge/License-Apache%202.0-green.svg?style=flat)
](./LICENSE)
[![CI](https://github.com/LionWeb-io/lionweb-typescript/actions/workflows/test.yaml/badge.svg)
](https://github.com/LionWeb-io/lionweb-typescript/actions/workflows/test.yaml)
[![npm](https://img.shields.io/npm/v/%40lionweb%2Fcli?label=%40lionweb%2Fcli)
](https://www.npmjs.com/package/@lionweb/cli)

This package exposes an executable for use with a CLI.
It can be used as follows:

```shell
$ npx @lionweb/cli <command> <arguments>
```

Just running

```shell
$ npx @lionweb/cli
```

produces information about which commands are available.

This CLI utility does not perform any explicit validation apart from the file at the given path existing and being valid JSON.
It does some implicit validation as it can error out on incorrect serializations.


## Sorting a serialization chunk

Run the following command to sort a serialization chunk (e.g.):

```shell
npx @lionweb/cli sort ../artifacts/chunks/languages/lioncore.json
```

Sorting a serialization chunk means the following:

* All nodes sorted by ID.
* For all nodes, their properties, containments, and references sorted by key (from the meta-pointer),
* All containments and references sorted by ID.

The sorting produces a serialization chunk that's also aligned on JSON-level with the specification.
That means that key-value pairs appear in precisely the same order as they do in the specification, and that missing key-value pairs are put in and get their default values.


## Development

Build the executable from source as follows:

```shell
$ npm run build
```

