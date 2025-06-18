# The `io-lionweb-mps-specific` package

[![license](https://img.shields.io/badge/License-Apache%202.0-green.svg?style=flat)
](./LICENSE)
[![CI](https://github.com/LionWeb-io/lionweb-typescript/actions/workflows/test.yaml/badge.svg)
](https://github.com/LionWeb-io/lionweb-typescript/actions/workflows/test.yaml)
[![npm](https://img.shields.io/npm/v/%40lionweb%2Fio-lionweb-mps-specific?label=%40lionweb%2Fio-lionweb-mps-specific)
](https://www.npmjs.com/package/@lionweb/io-lionweb-mps-specific)

This NPM package contains an implementation of the `io.lionweb.mps.specific` language.
The MPS implementation of that language is part of [the `lionweb-mps` plug-in](https://github.com/LionWeb-io/lionweb-mps/tree/mps2021.3).
The annotations in this language are used to export MPS-specific language (structure) metadata as part of LionWeb language exports from MPS (in the LionCore M3 format).
More specifically, this pertains to metadata like the *alias*, *short description*, *documentation*, etc., of a language concept.

It can be added to a TypeScript codebase as follows:

```shell
$ npm add @lionweb/io-lionweb-mps-specific
```

## API

The API consists of the following things exported from this package:

* The _implementation_ of the language consists of the following classes: `ConceptDescription`, `Deprecated`, `KeyedDescription`, `ShortDescription`, `VirtualPackage`.
    Also see [this PlantUml diagram](meta/io.lionweb.mps.specific.puml) for some more information.
* The language is _defined_ through the constant `ioLionWebMpsSpecificLanguage` (of type `Language`).
    Its classifiers are exported separately through the `ioLionWebMpsSpecificClassifiers` dictionary.
* The `deserializeLanguagesWithIoLionWebMpsSpecific` function deserializes a LionWeb serialization chunk as an array of `Language`s, potentially being annotated with instances of annotations from the `io.lionweb.mps.specific` language.
* The `ioLionWebMpsSpecificAnnotationsFrom` function returns the (instances of the) `io.lionweb.mps.specific` language's annotations that annotate the given language element (of type `M3Concept`).
* The `textualizationOfAnnotationsIn` function renders an textualization of all instances of `io.lionweb.mps.specific` annotations, in the given languages' tree structure.
    **Note**: only language elements having annotations (at any nesting depth) are rendered.
    This is useful to get a quick overview of the annotations.

