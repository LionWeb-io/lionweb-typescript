# The `validation` package

The code in this package implements validators that check serialization chunks against the [serialization specification](https://github.com/LionWeb-io/specification/blob/main/2023.1/serialization/serialization.adoc).
This package is intentionally kept very lightweight, e.g. it uses types instead of classes and has zero dependencies on external libraries/packages.

It's tested by running the validators against the [test set in `lionweb-integration-testing/testset`](https://github.com/LionWeb-io/lionweb-integration-testing/tree/main/testset).

To run the tests, checkout the `lionweb-integration-testing` project in next to the `lionweb-typescript` project, and run:

```shell
# install dependencies and build source:
./build.sh

# run the tests in the test set:
npm run testValid
npm run testInvalid
npm run testValidWithLanguage
npm run testInvalidWithLanguage
```

This will run the tests in the respective folders in the `testset/` folder in `lionweb-integration-testing`.

Notes:
- Testing with enums is not implemented yet.
- All tests in the test set with duplicates (which used to be considered invalid), are not invalid anymore, as decided in the meeting on 23-08-2023.
    They should be moved to valid.

The test runner runs tests at various levels similar (but probably not quite) as described in the [model correctness document](https://github.com/LionWeb-io/specification/blob/meinte/correctness/documentation/correctness.adoc).
These two should converge in the future.

