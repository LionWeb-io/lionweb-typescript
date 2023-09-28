# The `core` package

An NPM package that can be added to a Node.js/NPM codebase as follows:

```shell
$ npm add @lionweb/core
```
It contains:

* several base types
* the LionCore M3, including the `builtins` language
* functions for (de-)serialization

Build it from source as follows:

```shell
$ ./build.sh
```

Consult the [changelog](./CHANGELOG.md) to see what changed from version to version.


## Starting points

The following is a list of links to potential starting points:

* Implementation of the LionCore metametamodel (M3): see the [specific README](src/m3/README.md).
* Metamodel-generic/-aspecific code regarding:
    * [TypeScript type definitions](src/types.ts).
    * Representation of [references](src/references.ts).
    * [Serialization](src/serialization.ts).
    * [Generation of IDs](src/id-generation.ts).


## API

**TODO**  describe

