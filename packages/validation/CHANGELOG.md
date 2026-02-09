# Changelog

## 0.8.0 — not yet released

* New way to define the structure of the LionWeb JSON format.
* Add delta format definitions.
* Propagate `reference` field of `LionWebJsonReferenceTarget` type now being `null`able.
* Remove all definitions for reference-related events and commands, except for the ones associated with adding, changing, and deleting a reference.
* Remove the `CompositeCommand` and `CompositeEvent` types entirely.
  *Note* that this is a **breaking change**, due to a [change to the protocol specification](https://github.com/LionWeb-io/specification/issues/420), without providing backward compatibility e.g. by only deprecating those classes.


## 0.7.2

(No changes)


## 0.7.1

(The 0.7.0 release was deprecated because its `validation` package was faulty.)

* Refactor validation schema to enable generation ot TypeScript types with discriminator.


## 0.6.3

* Make validation aware that the `value` field of a property serialization is allowed to be `null`.


## 0.6.2

* Don't rely on the JavaScript features – import assertions – that are still marked as experimental.
  (This necessitates explicitly copying the relevant JSON files.)


## Prior versions

No changelog has been kept for previous versions, regardless of whether these were published or not.

