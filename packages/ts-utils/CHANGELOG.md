# Changelog

## 0.10.0 — not yet released

* Implement a small library for lexicographically comparisons (of strings, mainly): `Comparer` type, `{regular|locale}StringComparer` constants, and `mappedComparer`, `lexiComparer`, and `mappedLexiComparer` functions.
* Expose a `Sorter` type, and `sorterWith` function for sorting.
* Deprecate `StringSorter` type, `sortByStringKey` function, and replace its uses.
* Implement moving an item, as well moving an item and replacing an item in one specific list —
  offset-based, and according to [§ 3.8.2 of the delta protocol specification](https://github.com/LionWeb-io/specification/blob/main/delta/description.adoc#characteristics-of-manipulation-of-a-list).
  * `move[AndReplace]WithOffset` functions;
  * `invertedMove[AndReplace]WithOffset` functions to be able to invert the effects of `move[AndReplace]WithOffset`.


## 0.9.0

* Add `sumOfNumbers` function.
* Add a `stringifyPropertiesOf` function for verbosity/debugging purposes.


## 0.8.0

(No changes)


## 0.7.2

(No changes)


## 0.8.0, 0.7.2

(No changes)


## 0.7.1

(The 0.7.0 release was deprecated because its `validation` package was faulty.)

* Initial creation and publication of this package, as an extraction and de-duplication from `@lionweb/core`, `@lionweb/utilities`, `@lionweb/class-core`, and `@lionweb/validation`.
* Add a `mapFrom` function that maps an array to a map, using given key and value functions.
* Introduce explicit types for `nested{1,2,3}Mapper` functions.
* Package `src/` again (— i.e., don't ignore for NPM packaging.)

