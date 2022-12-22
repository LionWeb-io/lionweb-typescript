# TODOs

* &#10003; Define the LIonCore/M3 as TypeScript types.
* &#10003; Define the same thing meta-circularly, using those types.
* &#10003; Implement a syntax checker, specifically: no `unresolved`s in (at most) single-valued references.
    * &#10003; Implement model walker (`flatMap`).
* &hellip; Implement constraints.
* &#10003; Implement derived features.
* &#10003; Implement a serializer and deserializer for LIonCore/M3 instances.
    * &#10003; Check (and document) how unresolved references are (de-)serialized.
    * [ ] Write unit tests.
* &#10003; Validate serialization against JSON Schemas (in unit tests).
    * &#10003; Generically - just general structure.
    * &#10003; Specifically, with a JSON Schema generated from a LIonCore/M3 instance.
* &#10003; Implement the definition of the `library` metamodel from `lioncore-java`.
* &hellip; Implement an Ecore importer.
* [ ] Implement a generic serializer and deserializer that's reflective in given types?
* [ ] Implement a generic serializer and deserializer parametrized in a LIonCore/M3 instance.
* Generate type definitions from a LIonCore/M3 instance?
* Think about how to improve API of M3 w.r.t. containment:
    * Is it necessary to have the “parallel hierarchy” due to containment + namespaces?
    * Can't we have qualified names as a derived feature defined post-facto _on top_ of the LIonCore/M3?

