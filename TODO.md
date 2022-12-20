# TODOs

1. &#10003; Define the LIonCore/M3 as TypeScript types.
2. &#10003; Define the same thing meta-circularly, using those types.
3. &#10003; Implement a syntax checker, specifically: no `unresolved`s in (at most) single-valued references.
    * &#10003; Implement model walker (`flatMap`).
4. &hellip; Implement constraints.
5. &#10003; Implement derived features.
6. &#10003; Implement a serializer and deserializer for LIonCore/M3 instances.
    * Write unit tests.
      * Check how unresolved references are (de-)serialized.
7. Validate serialization against JSON Schemas.
    * Generically - just general structure.
    * Specifically, with a JSON Schema generated from a LIonCore/M3 instance.
8. Implement a generic serializer and deserializer that's reflective in given types?
9. Implement a generic serializer and deserializer parametrized in a LIonCore/M3 instance.
10. Generate type definitions from a LIonCore/M3 instance?
11. Think about how to improve API of M3 w.r.t. containment:
    * Is it necessary to have the “parallel hierarchy” due to containment + namespaces?
    * Can't we have qualified names as a derived feature defined post-facto _on top_ of the LIonCore/M3?

