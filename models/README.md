# README

This directory contains serializations of models in the LIonWeb JSON format.
A split is made between [metamodels/languages](./meta), and [instances](./instance) of those.


## Metamodels/languages

Serializations of metamodels, i.e. instances of LIonCore/M3.

* [`builtins.json`](./meta/builtins.json): the concepts and primitive types built into LIonCore, as [constructed here](../src-pkg/m3/builtins.ts).
* [`lioncore.json`](./meta/lioncore.json): the [self-definition](../src-pkg/m3/lioncore.ts) of the LIonCore/M3.
* [`library.json`](./meta/library.json): "library" metamodel/language as [constructed here](../src-test/m3/library-language.ts).


## Instances

* [`library.json`](./instance/library.json): a model of library conforming to the "library" language.

