# README

This directory contains serializations of models in the LIonWeb JSON format.
A split is made between [metamodels](./meta), and [instances](./instance).


## Metamodels

Serializations of metamodels, i.e. instances of LIonCore/M3.

* [`builtins.json`](./meta/builtins.json): the built-in primitive types.
* [`library.json`](./meta/library.json): "library" metamodel as [constructed here](../src/m3/test/library-meta.ts).
* [`lioncore.json`](./meta/lioncore.json): the [self-definition](../src/m3/self-definition.ts) of the LIonCore/M3.

