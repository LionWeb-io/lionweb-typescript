# README

Explanation of select directories and files:

* `artifacts/`: various artifacts associated with LionWeb languages that are involved with building other packages.
* `src/`:
  * `code-reading/`: contains several Node.js/JavaScript “scripts” to read specific parts of our own code bases, and generate some meaningful output from that.
    These are meant to be executed from the root of this `build` package, as follows: `$ node src/code-reading/<script-name>.js`.
  * `deltas/`: contains the definition of the various deltas, as well as the generator to build parts of the `class-core` package from that definition.
  * `generate-for-*.ts`: several Node.js “scripts” that are invoked as part of the NPM `generate` task.

