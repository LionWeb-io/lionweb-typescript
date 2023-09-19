# README

A TypeScript implementation for LionWeb standards: the serialization JSON format, and the LionCore metametamodel (M3).
This implementation is published as the `lioncore-typescript` NPM package.
This repository also contains documentation, additional artifacts, and utilities.


## Developing

Run the following command to run all unit tests:

```shell
$ npm test
```

(A watch mode is to be configured, still.)
This command also builds all the source, which can be done separately as follows:

```shell
$ npm run build
```

Run the following command to statically _style_-check the source code:

```shell
$ npm run lint
```

Note that this does not catch TypeScript compilation errors.


### Dev dependencies

* [Node.js](https://nodejs.org/): JavaScript runtime, version (at least) v18.17.1 (the latest LTS version)
  * NPM (bundled with Node.js): version (at least) 9.6.7
* (optional) [PlantUML](https://plantuml.com/).
  An IDE plugin such as the one [for IntelliJ IDEA](https://plugins.jetbrains.com/plugin/7017-plantuml-integration) also does the trick.

Note that development tends to be done with the latest Node.js and NPM versions.
Currently, these are v19.9.0 and 9.8.1.


## Getting started

The following is a list of links to potential starting points:

* Implementation of the LionCore metametamodel (M3): see the [specific README](src/m3/README.md).
* Metamodel-generic/-aspecific code regarding:
  * [TypeScript type definitions](src/types.ts).
  * Representation of [references](src/references.ts).
  * [Serialization](src/serialization.ts).
  * [Generation of IDs](src/id-generation.ts).


## Repository organization

* [Diagrams](diagrams/) - various generated diagrams.
  The PlantUML file [`diagrams/metametamodel-gen.puml`](diagrams/metametamodel-gen.puml) is generated from the meta-circular [self-definition of `lioncore`](src-pkg/m3/lioncore.ts).
  This generated PlantUML file can then be compared with [this one](https://github.com/LionWeb-org/organization/blob/main/metametamodel/metametamodel.puml): they should have exactly the same contents apart from a couple of obvious differences.
* [Models](models/) - various models in their serialized formats (the LionWeb JSON format); see the [specific README](models/README.md).
* [Schemas](schemas/) - various JSON Schema files for validating models serialized in the LionWeb JSON format against; see the [specific README](schemas/README.md).
* [Build source](src-build) - TypeScript source that (re-)generates the artifacts in the `diagrams/` and `models/` directories.
  This can be run through the CLI command `npm run generate-artifacts`.
* [Command-line interface](src-cli/) - TypeScript source that implements a single-entrypoint CLI for utilities around the LionCore functionality, such as: JSON Schema and diagram generation, textual syntax, extractors for the deserialization format, Ecore import, etc.
* [Package source](src-pkg/) - all TypeScript source that - transpiled to JavaScript - makes up the NPM package `lioncore-typescript`.
* [Test sources](src-test/) - all TypeScript sources with/for (unit) tests.
  Tests are located in files with names ending with `.test.ts`.
  Any such file tests the file under the same path in `src/` that has the same name minus the `.test` part.
* [Utilities](src-utils/) - TypeScript source that implements utilities around LionCore, but should not go in the NPM package.


## Extracting essential information from a serialization

Run the following command to make "extractions" from a serialization chunk (e.g.):

```shell
node dist/src-cli/lioncore-cli.js extract models/meta/lioncore.json
```

This is meant as a way to inspect, reason about, and compare serialization because the format is rather verbose.
These extractions are:

* A "sorted" JSON with:
  * all nodes sorted by ID,
  * for all nodes, their properties, containments, and references sorted by key (from the meta-pointer),
  * and all containments and references sorted by ID.
* A "shortened" JSON where keys are used as key names.
* If the serialization represents a language - i.e.: a LionCore model - then a textual version is generated as well.

This CLI utility does not perform any explicit validation apart from the file at the given path existing and being valid JSON.
It does some implicit validation as it can error out on incorrect serializations.

