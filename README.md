# README

TypeScript implementation for LIonWeb standards - currently: the LIonCore meta-metamodel (M3) in [`src/m3/types.ts`](src/m3/types.ts).


## Building

Run [`watch-tests.sh`](watch-tests.sh) to run all unit tests in watch mode.


### Dev dependencies

* [Deno](https://deno.land/): {Java|Type}Script runtime
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

