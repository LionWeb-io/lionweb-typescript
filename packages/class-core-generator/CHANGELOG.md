# Changelog

## 0.7.2

* Generate `MultiRef<T>` instead of `SingleRef<T>[]`.


## 0.7.1

(The 0.7.0 release was deprecated because its `validation` package was faulty.)

* Move `dependenciesThroughDirectInheritanceOf` and `verboseDependencies` functions from `class-core-generator` to `utilities` package.
* Remove everything specific to annotations coming from the `io.lionweb.mps.specific` language, in favor of using the types and functionality provided by the `@lionweb/io-lionweb-mps-specific` package.
  **Note**: this slightly breaks the API of the generator, but in such a trivial way (because of the use of defaults) that it doesn't warrant an increment in major version, IOHO.
* Partition concepts are now marked as such in their `ILanguageBase` implementation.
* Constructors of abstract concepts are now declared `protected` instead of `public`.
* Make `console.log` verbosity of the generator calls `generateApiFromLanguages[Json]` (for language**s**) configurable, through an extra property `verbose` of the `GeneratorOptions` which defaults to `true`.
* Add `replace<1-containment>With` and `replace<*-containment>AtIndex` methods.
* Turn dev-dependencies into real ones — (as they're all used in shipped code).
* Rename `DeltaHandler` &rarr; `DeltaReceiver`, `handleDelta` &rarr; `receiveDelta` to be more in line with the C# implementation.

