# Changelog

## 0.11.0 — not yet released

* Extract message-related client state into a separate `MessageRelatedClientState` class.
  * Fix [bug #384](https://github.com/LionWeb-io/lionweb-typescript/issues/384): events from a different client instance (with a different participation ID) but a command ID registered with this client instance, were ignored.
  * Issue a warning when an event is received that’s supposedly self-originating but for which a command ID wasn’t registered with this client instance.
  * Expose `MessageReceivers` type.
  * Replace or remove occurrences of logging directly to `console`.


## 0.10.0

* Implement splittable messages.
  * Handle `ErrorResponse` for queries.
* Expose a `LionWebDeltaProtocolLowLevelClientInstantiator` convenience type.
* `LionWebClient` now expects first event-to-receive to have sequence number 1 (instead of 0).


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

