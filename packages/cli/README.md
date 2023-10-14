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

Build the executable from source as follows:

```shell
$ ./build.sh
```


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

