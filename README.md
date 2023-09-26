# README

This repository contains TypeScript implementations for parts of the LionWeb standard/specification.
Those are contained in a number of NPM packages in the directory [`packages`](./packages) (in order of importance):

* `core`
  The "core stuff" such as: base types, the LionCore M3 (including the `builtins` language), and (de-)serialization.
* `utilities`
  Utilities on top of the `core` packages that might be broadly useful, but should not go into the `core` package.
* `test`
  A package containing (unit) tests for the packages above.
* `cli`
  A package with an executable to trigger some of the functionality in `utilities` through a commandline interface (CLI), i.e. from the commandline.
* `artifacts`
  A package that generates artifacts (serialization chunks, diagrams, JSON Schemas) from some of the models constructed in the `core` and `test` packages.

The `core`, `utilities`, and `cli` packages are published in the scope of [the `lionweb[package.json](package.json)` organization](https://www.npmjs.com/org/lionweb), meaning that they're all prefixed with `@lionweb/`.
The other packages are for internal use only.

Each of these packages have their own `README.md`.


## Development dependencies

* [Node.js](https://nodejs.org/): JavaScript runtime, version (at least) v18.17.1 (the latest LTS version)
  * NPM (bundled with Node.js): version (at least) 9.6.7
* (optional) [PlantUML](https://plantuml.com/).
  An IDE plugin such as the one [for IntelliJ IDEA](https://plugins.jetbrains.com/plugin/7017-plantuml-integration) also does the trick.

Note that development tends to be done with the latest Node.js and NPM versions.
Currently, these are v19.9.0 and 9.8.1.


## Installation

Run the following command to build each of the packages:

```shell
$ ./build.sh
```

This includes installing any NPM (dev) dependencies.

Run the following command to statically _style_-check the source code  in all the packages:

```shell
$ npm run lint
```

Note that this does not catch TypeScript compilation errors.

