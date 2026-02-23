# Changelog

## 0.8.0

(First release.)

* Expose `readFileAsJsonSync` and `writeJsonAsFileSync` functions that are the `readFileAsJson` and `writeJsonAsFileSync` – so without the `Sync` postfixes – from the `utilities` package.
  These are the same functions as in the `utilities package`, but those are going to be deprecated later on, so that the `utilities` package doesn’t need to rely on Node.js.

