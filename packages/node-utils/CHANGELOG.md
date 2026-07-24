# Changelog

## 0.10.0 — not yet released

* Add a 3rd, optional argument to the `writeJsonAsFileSync` function: the number of spaces per indentation, defaulting to 4.
* Add a `getFromHttps` function to retrieve the textual contents from a URL, also taking care of errors.


## 0.9.0

(No changes)


## 0.8.0

(First release.)

* Expose `readFileAsJsonSync` and `writeJsonAsFileSync` functions that are the `readFileAsJson` and `writeJsonAsFileSync` – so without the `Sync` postfixes – from the `utilities` package.
  These are the same functions as in the `utilities package`, but those are going to be deprecated later on, so that the `utilities` package doesn’t need to rely on Node.js.

