# Changelog

## 0.8.0 — not yet released

* Tie the language explicitly to LionWeb version 2023.1 — see the [README.md](./README.md#lionweb-version) for more details.
* Internal definition of the language is now read from [`meta/io.lionweb.mps.specific.json`] instead of being constructed programmatically.
  *Note* that the `import <id> from "<path>.json" with { type: "json" }` syntax is used for this, also after transpilation to JavaScript!
  Not all runtime and web bundlers understand this yet – see [this table](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#browser_compatibility), so code depending on this package might not run.


## 0.7.2

(No changes)


## 0.7.1

(The 0.7.0 release was deprecated because its `validation` package was faulty.)

* (first version)

