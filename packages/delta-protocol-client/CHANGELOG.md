# Changelog

## 0.10.0 — not yet released

* Implement splittable messages.
  * Handle `ErrorResponse` for queries.
* Expose a `LionWebDeltaProtocolLowLevelClientInstantiator` convenience type.


## 0.9.0

* Update the `LionWebClient` class to latest spec. of delta protocol:
  * Pass explicit repo ID to its constructor (default="myRepo" to match e.g. integration tests), through an instance of the `LionWebClientParameters` type.
  * Implement missing query methods.
  * Update signatures of `reconnect` and `listPartitions` methods.
  * Change/replace delta protocol version 2025.1 &rarr; 2026.1.


## 0.8.0

* Rework the `LionWebClient` class to use the new `Forest` class from the `class-core` package.


## 0.7.1

(The 0.7.0 release was deprecated because its `validation` package was faulty.)

Initial creation and publication of this package.

