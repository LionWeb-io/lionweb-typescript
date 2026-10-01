# The `archive` package

[![license](https://img.shields.io/badge/License-Apache%202.0-green.svg?style=flat)
](./LICENSE)
[![CI](https://github.com/LionWeb-io/lionweb-typescript/actions/workflows/test.yaml/badge.svg)
](https://github.com/LionWeb-io/lionweb-typescript/actions/workflows/test.yaml)
[![npm](https://img.shields.io/npm/v/%40lionweb%2Farchive?label=%40lionweb%2Farchive)
](https://www.npmjs.com/package/@lionweb/archive)

This NPM package can be added to a TypeScript codebase as follows:

```shell
$ npm add @lionweb/archive
```

It provides support for loading and storing LionWeb archives.
An archive contains partitions, and optionally languages and metadata.
The format is intended to be efficient to load and save, so that large repositories can be persisted and exchanged.


## Archives

An archive is a ZIP file holding LionWeb serialization chunks, one per partition, each stored either as JSON (`.json`) or in the protobuf format (`.binpb`, see [`src/proto/Chunk.proto`](./src/proto/Chunk.proto)).
This package supports two layouts of archives:

* `lwa` — a *LionWeb Archive*, as also supported by [LionWeb Java](https://github.com/LionWeb-io/lionweb-java), typically with the `.lwa` extension.
  It contains a `metadata/metadata.properties` file holding the LionWeb version (as the `LionWeb-Version` property), the languages under `languages/`, and the partitions under `partitions/`, all in the protobuf format.

* `snapshot` — this is the older version of the archive: every chunk in it, wherever it is, is a partition.
  It can hold other files as well, such as a README.

Both LionWeb versions 2023.1 and 2024.1 are supported.


## Usage

The following top-level members of this package are suitable and intended to be used directly.

* `loadArchive` — Loads an archive from its bytes (an `ArrayBuffer`, `Uint8Array`, or `Blob`), recognizing its layout, and returns a `LoadedArchive` with the languages, partitions, other files, and the diagnostics of entries that could not be read.

* `saveArchive` — Saves partitions (and languages) as an archive in either layout, returning its bytes as a `Uint8Array` or a `Blob`.
  Partitions obtained from `loadArchive` that were not changed can be copied as they are stored, which is much faster than encoding them again.

* `encodeChunk` and `decodeChunk` — Encode a serialization chunk in the protobuf format, and decode it.

* `validateChunk` — Checks that a value has the structure of a serialization chunk.

For example, the following code loads an archive, changes a partition, and saves it again:

```typescript
import { loadArchive, saveArchive } from "@lionweb/archive"

const archive = await loadArchive(bytes)
const [changed, ...unchanged] = archive.partitions
// ...change changed.chunk...
const saved = await saveArchive({
    partitions: [changed, ...unchanged.map(partition => ({ copy: partition }))],
    carryOtherFilesFrom: [archive],
    type: "uint8array"
})
```

When saving as a LionWeb Archive (`layout: "lwa"`), this package behaves as LionWeb Java does: it doesn't compress the entries, and it omits features without values (properties set to `null`, containments without children, references without targets).
Both behaviors can be changed through the `compression` and `omitEmptyFeatures` options.


## Development

Build it from source as follows:

```shell
npm run build
```

The tests for this package are located in the [`test` package](../test), in `src/archive/`.

The TypeScript code in `src/proto/` is generated from the `.proto` file next to it, using [ts-proto](https://github.com/stephenh/ts-proto), and should not be edited by hand.
To regenerate it, run the following command from this package's directory, with `protoc` installed, and `ts-proto` made available (e.g. with `npm install --no-save ts-proto`):

```shell
protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto --ts_proto_out=. --ts_proto_opt=importSuffix=.js src/proto/Chunk.proto
```
