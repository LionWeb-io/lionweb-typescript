# The `delta-protocol-test-cli` package

[![license](https://img.shields.io/badge/License-Apache%202.0-green.svg?style=flat)
](./LICENSE)

An NPM package that can be added to a Node.js/NPM codebase as follows:

```shell
$ npm add @lionweb/delta-protocol-test-cli
```
It contains CLI programs for a client and repository that implement the delta protocol (using the `delta-protocol-impl` package), and that can be used for testing purposes.

## CLI Repository

After installing the package, the CLI client can be started (as a Node.js program) as follows:

```shell
$ npx cli-repository <port>
```

The one (required) argument is `<port>`: the number of the WebSocket port where the LionWeb delta protocol repository is going to run.


## CLI client

After installing the package, the CLI client can be started (as a Node.js program) as follows:

```shell
$ npx cli-client <port> <clientID> <partitionConcept> [tasks]
```

The arguments are as follows:

- `<port>`: The port of the WebSocket where the LionWeb delta protocol repository is running on `localhost`.
- `<clientID>`: The ID that the client identifies itself with at the repository.
- `<participationConcept>`: The name of a partition concept that gets instantiated as the model's primary partition.
  Run `npx cli-cient` with less 3 arguments to have the help text shown with the recognized names of partition concepts.
- `[tasks]` (optional — the rest of the arguments are required): a comma-separated list of tasks.
  Run `npx cli-cient` with less 4 arguments to have the help text shown with the recognized task names.

***Note*** that it's assumed that the initial (states of the models) on client(s) and repository are identical!


## Development

Build it from source as follows:

```shell
npm run build
```

