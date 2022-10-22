# README

TypeScript implementation for LIonWeb standards - currently: the `lioncore` meta-metamodel in [`src/m3/types.ts`](./src/m3/types.ts).


## Building

Run [`watch-check-meta-circularity.sh`](./watch-check-meta-circularity.sh) to generate a PlantUML file [`plantUML/metametamodel-gen.puml`](./plantUML/metametamodel-gen.puml) from the meta-circular definition of `lioncore` in [`src/m3/meta-circularity.ts`](./src/m3/meta-circularity.ts).
This generated PlantUML file can then be compared with [this one](https://github.com/LIonWeb-org/organization/blob/main/lioncore/metametamodel.puml): they should have exactly the same contents apart from some a couple of obvious differences.


## Dev dependencies

* [Deno](https://deno.land/): {Java|Type}Script runtime
* (optional) [PlantUML](https://plantuml.com/)

