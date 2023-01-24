# README

This directory contains serializations of models in various formats, m.n. the LIonWeb JSON and Ecore XML formats:

* [`library.ecore`](./library.ecore): Ecore XML file with the “library” Ecore metamodel - copied from [here in the `lioncore-java` repository](https://github.com/LIonWeb-org/lioncore-java/blob/master/emf/src/test/resources/library.ecore).
* [`library.ecore.json`](./library.ecore.json): a serialization in JSON format of the result of parsing the `library.ecore` using Deno's XML functionality.
  (This file is not committed to/tracked by Git.)
* [`library.json`](./library.json): the serialization of the "library" metamodel as [constructed here](../src/m3/test/library.ts).
* [`library-imported-from-ecore.json`](./library-imported-from-ecore.json): serialization of the "library" metamodel as imported from the Ecore XML.
  This file should be identical to the previous one - this is asserted by a [test in this file](../src/m3/test/library.test.ts).
* [`lioncore.json`](./lioncore.json): the serialization of the LIonCore/M3 metamodel from its [self-definition](../src/m3/self-definition.ts).
* [`builtins.json`](./builtins.json): the serialization of the LIonCore/M3 metamodel containing the built-in primitive types.

