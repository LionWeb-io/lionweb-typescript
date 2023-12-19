# The `cli` package

This package exposes an executable for use with a CLI.
It can be used as follows:

```shell
$ npx @lionweb/cli <command> <arguments>
```

Just running

```shell
$ npx @lionweb/cli
```

produces information about which commands are available.


## Extracting essential information from a serialization chunk

Run the following command to make "extractions" from a serialization chunk (e.g.):

```shell
npx @lionweb/cli extract ../artifacts/chunks/languages/lioncore.json
```

This is meant as a way to inspect, reason about, and compare serialization because the format is rather verbose.
These extractions are:

* A "sorted" JSON with:
    * all nodes sorted by ID,
    * for all nodes, their properties, containments, and references sorted by key (from the meta-pointer),
    * and all containments and references sorted by ID.
* A "shortened" JSON where keys are used as key names.
* If the serialization represents a language - i.e.: a LionCore model - then a textual version is generated as well.

This CLI utility does not perform any explicit validation apart from the file at the given path existing and being valid JSON.
It does some implicit validation as it can error out on incorrect serializations.


## Changelog

### 0.6.0

* Add a `repair` command that aligns a JSON serialization chunk with the specification.


### 0.5.0

This is the first version corresponding to a release of LionWeb (version: 2023.1) as a whole.

* Make language-related functionality "multi-lingual", i.e. a serialization chunk can contain multiple `Language`s.
  * (Languages will be sorted by name.)
* Improve extraction functionality: only catch JSON-parsing exceptions.
* Configure single entrypoint named `lionweb-cli`.

No changelog has been kept for previous versions, regardless of whether these were published or not.


## Development

Build the executable from source as follows:

```shell
$ ./build.sh
```

