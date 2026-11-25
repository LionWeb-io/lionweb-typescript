# Changelog

## 0.11.0 — not yet released

* Put proper `override` markers on `get{Property|Containment|Reference}ValueManager` methods on classes generated for concrete classifiers.
* Support structured data types.
* Provide a new `sortByName` property of the `GeneratorOptions` type, with default `false`, that determines whether to sort language entities and classifier features alphabetically first and then topologically, to stabilize generated code as much possible.
* **Breaking change!** Clean up the generated APIs w.r.t. move methods — this is [issue #343](https://github.com/LionWeb-io/lionweb-typescript/issues/343):
  * Don’t generate the non-offset-based `move` methods, and generate the offset-based move methods without the `OffsetBased` infix.
* Add a `semicolons` flag to the `GeneratorOptions` type that determines whether to generate semicolons or not — with default `true`.


## 0.10.0

* Use a literal of `ConceptModifier` for the 5th of `new Concept(...)` in generated code.
* Expose `move[AndReplace]<Name of containment>OffsetBased` methods for all multi-valued containments in generated code.
* Parametrize generator with `lionWebVersion` argument of type `LionWebVersion`: `generateLanguage`, `generateApiFromLanguages`, `generateApiFromLanguagesJson`.
  The new argument is inserted at position 3, before the optional `maybeOptions` argument.


## 0.9.0

* Avoid name collisions between types in generated code and types imported from LionWeb itself.
  * Make every property of `GeneratorOptions` optional.


## 0.8.0

* Improve dealing with unresolved references.
  * Clear up an unnecessarily difficult piece of generator code while doing so.
  * Fix that concepts extending the built-in `Node` concept generates classes that extend `NodeBase` (rather than `Node`).
* Reference targets can now be any `Node`, not just `INodeBase`.


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

