# LIonCore M3 meta-metamodel


## Aspects

* [TypeScript type definitions](./types.ts)
* [Factory](./factory.ts) for conveniently creating M3 instances
* [Built-in (`builtins`) to LIonCore](./builtins.ts)
* [A model API specific for M3 instances](./api.ts)
* Persistence: [serializer](./serializer.ts) and [deserializer](./deserializer.ts)
* [Constraints checker](./constraints.ts)
* Convenience/helper [functions](./functions.ts) defined on M3 concepts
* Rendering an M3 instance in [textual syntax](./textual-syntax.ts)
* ([Reference checker](./reference-checker.ts))
* [Generation of keys](./key-generation.ts)

An interesting place to start might be the [self-definition of LIonCore/M3](./lioncore.ts) using its own [TypeScript type definitions](./types.ts).

