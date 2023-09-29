# @lionweb/validation

The code in this package implements the checks to run the tests in `lionweb-integration-testing/testset`.

This package is intentionally kept very lightweigt, e.g. it uses type instead of classes and has has zero dependencies on external libraries/packages.

It assumes that node.js 18 is used, but will propably work with other versions as well.

To run the tests checkout the `lionweb-integration-testing` project in next to the `lionore-typescript` project
and run

    # install ts-node
    yarn

    # run the tests
    yarn testValid
    yarn testInvalid
    yarn testValidWithLanguage
    yarn testInvalidWithLanguage

This will run the tests in the respective folders in the `testset` folder in `lionweb-integration-testing`.

Notes:
- testing with enums is not implemented yet
- all tests in the testset with duplicates are defined as invalid, are not invalid anymore, as decided in the meeting from 23-08-2023. They should be moved to valid.

The testrunner runs tests at various levels similar (but probably not quite) as described in
the model-correctness document (link).
These two should converge in the near future.  


