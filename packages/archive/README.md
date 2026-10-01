# README

[![license](https://img.shields.io/badge/License-Apache%202.0-green.svg?style=flat)
](./LICENSE)
[![CI](https://github.com/LionWeb-io/lionweb-typescript/actions/workflows/test.yaml/badge.svg)
](https://github.com/LionWeb-io/lionweb-typescript/actions/workflows/test.yaml)
[![npm](https://img.shields.io/npm/v/%40lionweb%2Fclass-core?label=%40lionweb%2Fclass-core)
](https://www.npmjs.com/package/@lionweb/class-core)

This NPM package provides support for loading and storing LionWeb archives.

The archives contains partitions and optionally languages and metadata. The format is intended to be efficient to load 
and save. It can be used to persist large repositories, save them and exchange them.

## Installation

Run the following command to add this package to an NPM-based project:

```shell
npm add @lionweb/archive
```

This adds this package as a dependency to your NPM-based project.

## Development

The TypeScript code in `src/proto/` is generated from the `.proto` files next to it, using 
[ts-proto](https://github.com/stephenh/ts-proto).
To regenerate it, run the following command from this package's directory, with `protoc` installed:

```shell
protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=. --ts_proto_opt=importSuffix=.js src/proto/Chunk.proto
```

(Make `protoc-gen-ts_proto` available by installing `ts-proto`, e.g. with `npm install --no-save ts-proto`.)
