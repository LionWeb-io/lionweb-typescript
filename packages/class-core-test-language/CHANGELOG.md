# Changelog

## 0.11.0 — not yet released


## 0.10

* Propagate expansion of TestLanguage:
  * Add a `containedNode` optional containment of `Node` to `TestAnnotation`.
  * Add a `RestrictedTestAnnotation` annotation that annotates `LinkTestConcept` (rather than `Node`).
  * Add a `otherContainment_0_1` optional containment of `LinkTestConcept` to `LinkTestConcept`.
* (Propagate changes to `class-core-generator`.)


## 0.9.0

* (Regenerate language implementation after changes to `class-core-generator`.)


## 0.8.0

* Regenerate with latest test language definition.
* Provide test helpers in the form of the `attachedDataTypeTestConcept` and `attachedLinkTestConcept` functions.


## 0.7.2

First release, created by deduplicating `TestLanguage` test language.

