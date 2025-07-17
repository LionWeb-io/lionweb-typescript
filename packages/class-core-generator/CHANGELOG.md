# Changelog

## 0.7.0

* Move `dependenciesThroughDirectInheritanceOf` and `verboseDependencies` functions from `class-core-generator` to `utilities` package.
* Remove everything specific to annotations coming from the `io.lionweb.mps.specific` language, in favor of using the types and functionality provided by the `@lionweb/io-lionweb-mps-specific` package.
  **Note**: this slightly breaks the API of the generator, but in such a trivial way (because of the use of defaults) that it doesn't warrant an increment in major version, IOHO.
* Partition concepts are now marked as such in their `ILanguageBase` implementation.
* Constructors of abstract concepts are now declared `protected` instead of `public`.

