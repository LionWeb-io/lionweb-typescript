# README

This repository contains a TypeScript implementation for (parts of) the [LionWeb specification](https://lionweb-io.github.io/specification/) – specifically: release version **2023.1** of the LionWeb specification.

_Note_ that this repo doesn't implement the specification completely.
In particular:

* Not all constraints on the LionCore M3 have been implemented.
* The functionality in the `utilities` and `validation` packages is provided “as-is”.

The implementation of the JSON serialization format, serialization from in-memory representations to that format, and vice versa, are all pretty solid.


## Repo org

The implementation is divided up in a number of NPM packages in the directory [`packages`](./packages) (in order of importance):

- `core`
  The "core stuff" such as: base types, the LionCore M3 (including the `builtins` language), and (de-)serialization.
- `utilities`
  Utilities on top of the `core` packages that might be broadly useful, but should not go into the `core` package.
- `validation`
  Validators that validate a JSON serialization.
- `test`
  A package containing (unit) tests for the packages above.
- `cli`
  A package with an executable to trigger some of the functionality in `utilities` through a commandline interface (CLI), i.e. from the commandline.
- `artifacts`
  A package that generates artifacts (serialization chunks, diagrams, JSON Schemas) from some of the models constructed in the `core` and `test` packages.

Each of these packages have their own `README.md`.
The `core`, `utilities`, `cli`, and `validation` packages are published in the scope of [the `lionweb[package.json](package.json)` organization](https://www.npmjs.com/org/lionweb), meaning that they're all prefixed with `@lionweb/`.
The other packages are for internal use only.
All these packages declare the same NPM semver identification, which isn't directly related to the release version of the LionWeb specification.


## Environment dependencies

This repo relies on the following tools being installed:

- [Node.js](https://nodejs.org/): JavaScript runtime, version (at least) v18.18.0 (the LTS version as of 2023-09-29)
  - NPM (bundled with Node.js): version (at least) 9.6.7
- (optional) [PlantUML](https://plantuml.com/).
  An IDE plugin such as the one [for IntelliJ IDEA](https://plugins.jetbrains.com/plugin/7017-plantuml-integration) also does the trick.

Note that development tends to be done with the latest Node.js and NPM versions.
Currently, these are v19.9.0 and 9.8.1.


## Development

### Commands

Run the following command to **build** each of the packages:

```shell
# Build the project
./build-all.sh
```

This includes cleaning up and installing any NPM (dev) dependencies.

The previous command includes running the following command to statically _style_-check the source code in all the packages:

```shell
# Run lint
npm run lint
```

Note that this does not catch TypeScript compilation errors.

Run the following command to run the tests:

```shell
cd packages/test

# Run the tests
npm run test
```

<br />

The output should look similar to this:
<br />
<br />
<img src="./documentation/images/test-output.png" alt="test" width="50%"/>

You can test more thoroughly as follows:

```shell
./test-all.sh
```

You can run the following command to quickly build and test all packages:

```shell
./quick-build-and-test-all.sh
```

This does the same as running the `build-all.sh` and `test-all.sh` scripts, except for that it doesn't clean up and (re-)install the NPM (dev) dependencies, which is usually the costliest step.


### Code style

All the code in this repository is written in TypeScript, with the following code style conventions:

* Indentation is: **4 spaces**.

* **No semicolons** (`;`s).
    This is slightly controversial, but I (=Meinte Boersma) simply hate semicolons as a statement separator that's virtually always unnecessary.
    The TypeScript compiler simply adds them back in the appropriate places when transpiling to JavaScript.

* Use **"FP-lite"**, meaning using `Array.map` and such functions over more imperative ways to compute results.


### Containerized development environment

If you prefer not to install the development dependencies on your machine, you can use our containerized development environment for the LionCore TypeScript project. This environment provides a consistent and isolated development environment that is easy to set up and use. To get started, follow the instructions in our [containerized development environment guide](./documentation/dev-environment.md). However, you can streamline the process by running the following command:

```sh
docker run -it --rm --net host --name working-container -v ${PWD}:/work indamutsa/lionweb-devenv:v1.0.0 /bin/zsh
```

- `docker run`: Initiates a new container.
- `-it`: Enables interactive mode with a pseudo-TTY.
- `--rm`: Removes container after exit.
- `--net host`: Shares the host's network.
- `--name working-container`: Names the container.
- `-v ${PWD}:/work`: Maps host's current directory to `/work` in the container.
- `indamutsa/lionweb-devenv:v1.0.0`: Specifies the Docker image.
- `/bin/zsh`: Starts a Zsh shell inside the container.


## Contributing

We're happy to receive feedback in the form of

* Issues – see the [issue tracker](https://github.com/LionWeb-io/lionweb-typescript/issues).
* Pull Requests.
    We generally prefer to _squash-merge_ PRs, because PRs tend to be a bit of a "wandering journey".
    If all commits in a PR are essentially "atomic" (in a sense that's at the discretion of the repo's maintainers), then we can consider merging by _fast-forwarding_.
* Join the [LionWeb Slack](https://join.slack.com/t/lionweb/shared_invite/zt-1zltq8eqv-QJmtsZA8_oscCrO8HOp3FA)!

