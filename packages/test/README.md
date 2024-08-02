# The `test` package

An NPM package that contains the (unit) tests for the `core` and `utilities` packages.


## Development

Build it (cleanly) from source as follows:

```shell
npm run build
```

Run all tests as follows:

```shell
npm run test
```

Remarks:

* Tests are (only) located in files with names ending in `.test.ts`.
* Tests for files located under the `src/` directory of either the `core` or `utilities` package, are located in a directory with the same path, and with the same name but replacing the `.ts` suffix with `.test.ts.
* In addition, the `languages/` directory contains languages defined using the LionCore M3, and `instances/` directory contains instances of those.
    Tests that assert (de-)serialization of these languages and their instances are located at the top-level.
* The `test` script also compiles the TypeScript code in this package.

