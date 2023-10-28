# Changelog

## 0.5.0

* _Breaking change:_ Rework ID and key generation in the LionCore `LanguageFactory`.
    As part of that:
    * Add `String[s]Mapper` types, a `StringsMapper` instance `last`, and functions `concatenator` and `chain` to produce instances of them.
    * Remove `M3Node.keyed` and the "awkward" key generation in the `InstantiationFacade` for the LionCore language.
    * Remove types `IdGenerator`, and `KeyGenerator` and everything related to that.
    * Expose keys (instead of qualified names) for LionCore M3 and the LionCore built-ins.
* Add a type `DynamicINamed` and an M3-function `conceptsOf`, primarily for generation purposes.
* Move `asText` and ID checking to `@lionweb/utilities`.
* Expose a helper function `nameSorted`.
* Rename `ConceptInterface` &rarr; `Interface`.
* Change names: `ReadModelAPI` &rarr; `ExtractionFacade`, `WriteModelAPI` &rarr; `InstantiationFacade`.
* Change name of `concept` fields to `classifier`, and their types (where applicable) to `Classifier`.
* Fix `license` field in `package.json` to `"Apache-2.0"`.
* Replace all occurrences of "LIon" (with uppercase 'I') with "Lion" (with lowercase 'i').
* Split the `ModelAPI` interface into a read- and write-part: `ReadModelAPI` vs. `WriteModelAPI`.
* Make fixes w.r.t. multi-language models.
* Migrate from Deno to Node.js.
* Implement import of enums in Ecore importer.

