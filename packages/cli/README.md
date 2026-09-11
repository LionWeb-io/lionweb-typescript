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

Run the following command to sort one or more serialization chunks (e.g.):

```shell
npx @lionweb/cli sort ../build/artifacts/core/v2023_1/lioncore.json
```

Sorting a serialization chunk means the following:

* All nodes sorted by ID.
* For all nodes, their properties, containments, and references are sorted lexicographically by the tuple (language-key, feature-key, language-version) — essentially, by the meta-pointer.
* If the `--sort-connections` flag is given as one (or more) of the arguments, then for every node, all containments, references, and contained annotations are sorted by ID.
* All key-value pairs in the objects in the JSON produced, appear according to the specification of the LionWeb serialization format, with missing key-value pairs put in with their default values.

Sorted serialization chunks lean themselves well to being compared as text files.
Setting the `--sort-connections` flag usually changes the meaning of the serialization chunk, but makes it easy to find out whether a list of items appearing in a containment, a reference, or the annotations of a node merely appear in a different order, or really differ.


## Development

Build the executable from source as follows:

```shell
$ npm run build
```

