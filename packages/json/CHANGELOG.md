# Changelog

## 0.8.0 — not yet released

* Make `reference` field of `LionWebJsonReferenceTarget` type `null`able, and ensure that not both fields are `null`.
* Deprecate usage of the `currentSerializationFormatVersion` constant, and propagate throughout the entire codebase.
    Use `defaultLionWebVersion.serializationFormatVersion` with `defaultLionWebVersion` coming from the `core` package.


## 0.7.2

(No changes)


## 0.7.1

(The 0.7.0 release was deprecated because its `validation` package was faulty.)

Initial creation and publication of this package, as an extraction and de-duplication from `@lionweb/core` and `@lionweb/validation`.

