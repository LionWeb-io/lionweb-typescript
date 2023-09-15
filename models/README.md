# README

This directory contains serializations of models in the LionWeb JSON format.
A split is made between [languages](./meta), and [instances](./instance) of those.


## Languages

Serializations of languages, i.e. instances of the `Language` (meta-)concept from LIonCore/M3.

* [`builtins.json`](./meta/builtins.json): the concepts and primitive types built into LIonCore, as [constructed here](../src-pkg/m3/builtins.ts).
* [`with-enum.json`](./meta/with-enum.json): a language containing just an enumeration.
  This language is used to test whether enumerations work correctly.
* [`library.json`](./meta/library.json): the "library" language as [constructed here](../src-test/m3/library-language.ts).
* [`lioncore.json`](./meta/lioncore.json): the [self-definition](../src-pkg/m3/lioncore.ts) of the LIonCore/M3.
* [`multi.json`](./meta/multi-language.json): the "multi" language that extends the "library" language, as [constructed here](../src-test/multi.ts).


## Instances

* [`library.json`](./instance/library.json): a model of library conforming to the "library" language.
* [`multi.json`](./instance/multi.json): a model that uses two (different/separate) languages: the "library" language and a "multi" language that extends the "library" language.
  This language is used to test whether multi-language models work correctly.

