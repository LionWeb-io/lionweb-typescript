# The `test` package

An NPM package that contains the (unit) tests for the published NPM packages.


## Development

Run all tests as follows:

```shell
npm run test
```

This also compiles the TypeScript code in this package, by depending on the `run` script.


## Conventions

* Tests for any of the published packages are located in a top-level directory within `src/` with the same name as the package, so `core`, `ts-utils`, etc.
* Tests are (only) located in files with names ending in `.test.ts`.
* The `languages/` directory contains languages defined using the LionCore M3, and `instances/` directory contains instances of those.

