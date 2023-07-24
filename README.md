# README

A TypeScript implementation for LIonWeb standards - currently: the LIonCore meta-metamodel (M3) in [`src/m3/types.ts`](src/m3/types.ts).


## Developing

Run the following command to run all unit tests:

```
$ deno task run-tests
```

The same in watch mode:

```
$ deno task watch-tests
```

Run the following command to statically _style_-check the source code:

```
$ deno task lint
```

Note that this does not catch TypeScript compilation errors.
See https://lint.deno.land/ for more details.


### Dev dependencies

* [Deno](https://deno.land/): {Java|Type}Script runtime, version (at least) 1.30.3
* (optional) [PlantUML](https://plantuml.com/).
  An IDE plugin such as the one [for IntelliJ IDEA](https://plugins.jetbrains.com/plugin/7017-plantuml-integration) also does the trick.

All of the dependencies of code in this codebase on external code (pulled in by Deno through `import {&hellip;} from "https://..."`), are listed explicitly in the file [`src/deps.ts`](src/deps.ts).
The [Deno lockfile](deno.lock) can be re-derived by running:

```
$ deno task lock-deps
```

This also reloads the cache.


## Getting started

The following is a list of links to potential starting points:

* Implementation of the LIonCore meta-metamodel (M3): see the [specific README](src/m3/README.md).
* Metamodel-generic/-aspecific code regarding:
  * [TypeScript type definitions](src/types.ts).
  * Representation of [references](src/references.ts).
  * [Serialization](src/serialization.ts).
  * [Generation of IDs](src/id-generation.ts).


## Repository organization

* [Diagrams](diagrams/) - various diagrams.
  The PlantUML file [`diagrams/metametamodel-gen.puml`](diagrams/metametamodel-gen.puml) is generated from the meta-circular definition of `lioncore` in [`src/m3/test/self-definition.ts`](src/m3/test/self-definition.ts)
  This generated PlantUML file can then be compared with [this one](https://github.com/LIonWeb-org/organization/blob/main/lioncore/metametamodel.puml): they should have exactly the same contents apart from a couple of obvious differences.
* [Models](models/) - various models in their serialized formats (the LIonWeb JSON format, or Ecore XML); see the [specific README](models/README.md).
* [Schemas](schemas/) - various JSON Schema files for validating models serialized in the LIonWeb JSON format against; see the [specific README](schemas/README.md).
* [Source](src/) - all TypeScript source to be exported as part of the NPM/Deno package.
* [Auxiliary](src-aux/) - all TypeScript source that's not core to the NPM/Deno package but still useful, e.g. for testing.
* [Scripts](src-build) - a `build-npm.ts` Deno script to package the source as an NPM package using [`dnt`](https://github.com/denoland/dnt).
* [Test sources](src-test/) - all TypeScript sources with/for (unit) tests.
  Tests are located in files with names ending with `.test.ts`.
  Any such file tests the file under the same path in `src/` that has the same name minus the `.test` part.

**TODO**  elaborate


## Serialization format

The value of a _link_-feature (either a _containment_ or a _reference_) is always serialized as an array, even if the link is optional and singular - i.e., `optional = true`, and `multiple = false`.
Each item in the array is either the ID of the target of the link, or `null` to indicate an unresolved reference.

**TODO**  finish


## Considerations

The following are considerations or concerns that bubbled up during implementation, but are not solid enough to become proper TODOs:

* Generate type definitions from a LIonCore/M3 instance?
* Think about how to improve API of M3 w.r.t. containment:
  * Can't we have qualified names as a computed feature defined post-facto _on top_ of the LIonCore/M3?
* What happens during deserialization if things don't match the provided M2?
  Just error out, or return `(model', issues*)`?


## Building an NPM Package

Run

```shell
deno run -A src-build/build-npm.ts x.y.z
```

where x.y.z is the version of the package we're building. This will create a package in the `npm` directory.

Then, we can build an archive with

```shell
pushd npm; npm pack; popd
```

We can use the compressed package as a dependency of local projects, for testing, with e.g.

```json
"dependencies": {
    ...
    "lioncore-typescript": "file:...<relative path>.../lioncore-typescript/npm/lioncore-0.2.0.tgz"
    ...
},
```

Or, we can publish the package to the NPM registry with

```shell
pushd npm; npm publish; popd
```


## Extracting essential information from a serialization

Run

```shell
deno task compile-cli
```

to produce a binary executable `lib/extract-serialization` for your platform.

This you can then call to make "extractions" from a serialization ("chunk"), as follows (e.g.):

```shell
lib/extract-serialization models/meta/lioncore.json
```

This is meant as a way to inspect, reason about, and compare serialization because the format is rather verbose.
These extractions are:

* A "sorted" JSON with:
  * all nodes sorted by ID,
  * for all nodes, their properties, containments, and references sorted by key (from the meta-pointer),
  * and all containments and references sorted by ID.
* A "shortened" JSON where keys are used as key names.
* If the serialization represents a language - i.e.: a LIonCore model - then a textual version is generated as well.

This CLI utility does not perform any explicit validation apart from the file at the given path existing and being valid JSON.
It does some implicit validation as it can error out on incorrect serializations.

