# The `artifacts` package

An NPM package that generates artifacts (serialization chunks, diagrams, JSON Schemas) from some of the models constructed in the `core` and `test` packages.
These artifacts are purely for introspection, development, and debugging purposes.
This package is not published.

Build it from source as follows:

```shell
$ ./build.sh
```

Generate the artifacts as follows:

```shell
$ npm run generate
```


## Chunks

The [`chunks/` directory](./chunks/) contains serialization chunks - i.e., serializations of models - in the LionWeb JSON format.
A split is made between [languages](./meta), and [instances](./instance) of those.


### Languages

Serializations of languages, i.e. instances of the `Language` (meta-)concept from LionCore.

* [`builtins.json`](./chunks/languages/builtins.json): the concepts and primitive types built into LionCore, constructed in the `@lionweb/core` package.
  This language is used to test whether enumerations work correctly.
* [`library.json`](./chunks/languages/library.json): the "library" language, constructed in the `@lionweb/test` package.
* [`lioncore.json`](./chunks/languages/lioncore.json): the self-definition of LionCore, constructed in the `@lionweb/core` package.
* [`multi.json`](./chunks/languages/multi.json): the "multi" language that extends the "library" language, constructed in the `@lionweb/test` package.
* [`with-enum.json`](./chunks/languages/with-enum.json): a language containing just an enumeration, constructed in the `@lionweb/test` package.


### Instances

* [`library.json`](./chunks/instances/library.json): a model of library conforming to the "library" language.
* [`multi.json`](./chunks/instances/multi.json): a model that uses two (different/separate) languages: the "library" language and a "multi" language that extends the "library" language.
  This language is used to test whether multi-language models work correctly.


## Diagrams

The [`diagrams/` directory](./diagrams/) contains generated PlantUML UML class diagrams which represent certain models:

* [`library-gen.puml`](./diagrams/library-gen.puml): the hand-crafted "library" metamodel.
* [`metametamodel-gen.puml`](./diagrams/metametamodel-gen.puml): the (self-defined) LionCore metametamodel (M3).
  This generated PlantUML file can then be compared with [this one](https://github.com/LionWeb-io/specification/blob/main/metametamodel/metametamodel.puml): they should have exactly the same contents apart from a couple of obvious differences.

All of these diagrams also have a corresponding MarkDown document with an embedded [Mermaid diagram](https://mermaid.js.org/).


## JSON Schemas

The [`schemas/` directory](./schemas/) contains JSON Schemas:

* [`generic-serialization.schema.json`](./schemas/generic-serialization.schema.json): schema that captures the LionWeb serialization JSON format _generically_.
* [`library.serialization.schema.json`](./schemas/library.serialization.schema.json): schema that captures the LionWeb serialization JSON format _specifically_ for serialized libraries (i.e., instances of the metamodel of the "library" language).
* [`lioncore.serialization.schema.json`](./schemas/lioncore.serialization.schema.json): schema that captures the LionWeb serialization JSON format _specifically_ for serialized languages (i.e., instances of LionCore).

**Note**: these schemas are currently unused, and are not updated/re-generated!

