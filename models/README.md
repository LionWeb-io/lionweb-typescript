# README

This directory contains serializations of models in various formats, m.n. the LIonWeb JSON and Ecore XML formats:

* [`builtins.json`](./builtins.json): the serialization of the LIonCore/M3 metamodel containing the built-in primitive types.
* [`library.ecore`](./library.ecore): Ecore XML file with the “library” Ecore metamodel - copied from [here in the `lioncore-java` repository](https://github.com/LIonWeb-org/lioncore-java/blob/master/emf/src/test/resources/library.ecore).
* [`library.json`](./library.json): the serialization of the "library" metamodel as [constructed here](../src/m3/test/library.ts).
* [`lioncore.json`](./lioncore.json): the serialization of the LIonCore/M3 metamodel from its [self-definition](../src/m3/self-definition.ts).

