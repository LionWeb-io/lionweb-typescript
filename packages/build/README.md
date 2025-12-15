# README

Explanation of select directories and files:

* `artifacts/`: various artifacts associated with LionWeb languages that are involved with building other packages.
* `src/`:
  * `code-reading/`: contains several Node.js/JavaScript “scripts” to read specific parts of our own codebases, and generate some meaningful output from that.
    These are meant to be executed from the root of this `build` package, as follows: `$ node src/code-reading/<script-name>.js`.
  * `deltas/`: contains the definition of the various deltas, as well as the generator to build parts of the `class-core` package from that definition.
  * `generate-for-*.ts`: several Node.js “scripts” that are invoked as part of the NPM `generate` task.
    * A specific mention for `generate-for-class-core`: this will obtain a `testLanguage.2023.1.json` file from either the [`lionweb-integration-testing` GitHub repository](https://raw.githubusercontent.com/LionWeb-io/lionweb-integration-testing/refs/heads/main/src/languages/testLanguage.2023.1.json),
        a clone of that located right next to this `lionweb-typescript` repository on the local filesystem, or use [that file located in the `artifacts/` directory](artifacts/testLanguage.2023.1.json) as-is.

