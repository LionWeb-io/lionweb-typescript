# The `test` package

An NPM package that contains the (unit) tests for the `core` and `utilities` packages.

Build it from source as follows:

```shell
$ ./build.sh
```

Run all tests as follows:

```shell
$ npm test
```

Tests are located in files with names ending in `.test.ts`.
Any such file tests the file under the same path in the `src/` directory of either the `core` or `utilities` package that has the same name minus the `.test` part.

