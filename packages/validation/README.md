# The `validation` package

The code in this package implements the checks to run the tests in `lionweb-integration-testing/testset`.

This package is intentionally kept very lightweight, e.g. it uses type instead of classes and has zero dependencies on external libraries/packages.

It assumes that Node.js 18 is used, but will probably work with other versions as well.

To run the tests checkout the `lionweb-integration-testing` project in next to the `lionweb-typescript` project, and run:

```shell
# install ts-node
npm install

# run the tests
npm run testValid
npm run testInvalid
npm run testValidWithLanguage
npm run testInvalidWithLanguage
```

This will run the tests in the respective folders in the `testset` folder in `lionweb-integration-testing`.

Notes:
- Testing with enums is not implemented yet.
- All tests in the testset with duplicates (which used to be considered invalid), are not invalid anymore, as decided in the meeting on 23-08-2023.
    They should be moved to valid.

The testrunner runs tests at various levels similar (but probably not quite) as described in the [model correctness document](https://github.com/LionWeb-io/specification/blob/meinte/correctness/documentation/correctness.adoc).
These two should converge in the near future.  

