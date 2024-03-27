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


## Changelog

### 0.6.4 - unreleased

* Add a command `infer-language` that infers a language from the given serialization chunk.

### 0.6.3

* Add a command `measure` that computes metrics.

### 0.6.2

* Expose diffing functionality from `@lionweb/validation`

### 0.6.1

* Fix that `@lionweb/validation` was not specified as a (non-dev) dependency.

### 0.6.0

* Change the `diagram` command to output PlantUML and Mermaid diagram files _per language_.
* Add a `validation` commmand to validate JSON files as serialization chunks.
* Remove the shortening functionality from `extract`.
* Rename the `extract` command &rarr; `sort`, and remove the textualization for chunks that are the serialization of languages.
* Textualizing a serialization chunk of languages will use the LionCore/M3-specific syntax _unless_ the flag `--languagesAsRegular` is an argument.
* Add a `repair` command.
* Add a `textualize` command – that's optionally language-aware – to render a JSON serialization chunk as pure text.

### 0.5.0

This is the first version corresponding to a release of LionWeb (version: 2023.1) as a whole.

* Make language-related functionality "multi-lingual", i.e. a serialization chunk can contain multiple `Language`s.
    * (Languages will be sorted by name.)
* Improve extraction functionality: only catch JSON-parsing exceptions.
* Configure single entrypoint named `lionweb-cli`.

No changelog has been kept for previous versions, regardless of whether these were published or not.

## Development

Build the executable from source as follows:

```shell
$ npm run build
```
