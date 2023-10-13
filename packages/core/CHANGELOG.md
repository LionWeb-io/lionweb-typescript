# Changelog

## 0.5.0

* Add a type `DynamicINamed`, primarily for generation purposes.
* Expose a helper function `nameSorted`.
* Change names: `ReadModelAPI` &rarr; `ExtractionFacade`, `WriteModelAPI` &rarr; `InstantiationFacade`.
* Change name of `concept` fields to `classifier`, and their types (where applicable) to `Classifier`.
* Fix `license` field in `package.json` to `"Apache-2.0"`.
* Replace all occurrences of "LIon" (with uppercase 'I') with "Lion" (with lowercase 'i').
* Split the `ModelAPI` interface into a read- and write-part: `ReadModelAPI` vs. `WriteModelAPI`.
* Make fixes w.r.t. multi-language models.
* Migrate from Deno to Node.js.
* Implement import of enums in Ecore importer.

