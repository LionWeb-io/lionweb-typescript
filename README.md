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

* [Deno](https://deno.land/): {Java|Type}Script runtime, version (at least) 1.30.0
* (optional) [PlantUML](https://plantuml.com/).
  An IDE plugin such as the one [for IntelliJ IDEA](https://plugins.jetbrains.com/plugin/7017-plantuml-integration) also does the trick.


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
* [Source](src/) - all TypeScript source.
  Tests are located in files with names ending with `.test.ts` which are located in sub directories named `test`.

**TODO**  elaborate


## Serialization format

The value of a _link_-feature (either a _containment_ or a _reference_) is always serialized as an array, even if the link is optional and singular - i.e., `optional = true`, and `multiple = false`.
Each item in the array is either the ID of the target of the link, or `null` to indicate an unresolved reference.

**TODO**  finish


## Considerations

The following are considerations or concerns that bubbled up during implementation, but are not solid enough to become proper TODOs:

* Generate type definitions from a LIonCore/M3 instance?
* Think about how to improve API of M3 w.r.t. containment:
  * Is it necessary to have the “parallel hierarchy” due to containment + namespaces?
  * Can't we have qualified names as a derived feature defined post-facto _on top_ of the LIonCore/M3?
* What happens during deserialization if things don't match the provided M2?
  Just error out, or return `(model', issues*)`?

