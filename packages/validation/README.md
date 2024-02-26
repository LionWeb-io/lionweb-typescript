# The `validation` package

The code in this package implements validators that check serialization chunks against the [serialization specification](https://github.com/LionWeb-io/specification/blob/main/2023.1/serialization/serialization.adoc).
This package is intentionally kept very lightweight, e.g. it uses types instead of classes and has zero dependencies on external libraries/packages.

It's tested by running the validators against the [test set in `lionweb-integration-testing/testset`](https://github.com/LionWeb-io/lionweb-integration-testing/tree/main/testset).

To make the testset available in this propject, run
```
npm run setup
```
To build from soure:
```
npm run build
```
To run the tests:
```
npm run test
```

This will run the tests in the respective folders in the `testset/` folder of `lionweb-integration-testing`.

The commands `npm run publish-local` and `npm run unpublish-local` are used to do a release on a _local_ npm registry (in our case `verdaccio`), for use in other local projects. This ensures that we do not have to do contineous releases when we develop two packages depending on aech other.

The test runner runs tests at various levels similar (but probably not quite) as described in the [model correctness document](https://github.com/LionWeb-io/specification/blob/meinte/correctness/documentation/correctness.adoc).
These two should converge in the future.


## Changelog

### 0.6.2

* Don't rely on the JavaScript features – import assertions – that are still marked as experimental.
    (This necessitates explicitly copying the relevant JSON files.)

(For earlier versions no changelog was maintained.)

