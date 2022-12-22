# TODOs

* &#10003; Define the LIonCore/M3 as TypeScript types.
* &#10003; Define the same thing meta-circularly, using those types.
* &#10003; Implement a syntax checker, specifically: no `unresolved`s in (at most) single-valued references.
    * &#10003; Implement model walker (`flatMap`).
* &hellip; Implement constraints.
* &#10003; Implement derived features.
* &#10003; Implement a serializer and deserializer for LIonCore/M3 instances.
    * Write unit tests.
    * Check (and document) how unresolved references are (de-)serialized.
      (Answer: as `null`s.)
* Implement the definition of the `library` metamodel from `lioncore-java`.
* &hellip; Validate serialization against JSON Schemas.
    * &#10003; Generically - just general structure.
    * &hellip; Specifically, with a JSON Schema generated from a LIonCore/M3 instance.
* &hellip; Implement an Ecore importer.
* Implement a generic serializer and deserializer that's reflective in given types?
* Implement a generic serializer and deserializer parametrized in a LIonCore/M3 instance.
* Generate type definitions from a LIonCore/M3 instance?
* Think about how to improve API of M3 w.r.t. containment:
    * Is it necessary to have the “parallel hierarchy” due to containment + namespaces?
    * Can't we have qualified names as a derived feature defined post-facto _on top_ of the LIonCore/M3?

