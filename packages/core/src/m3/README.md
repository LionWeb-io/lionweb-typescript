# LionCore M3 metametamodel


## Aspects

* [TypeScript type definitions](./types.ts)
* [Factory](./factory.ts) for conveniently creating M3 instances
* [Classifiers built in (`LionCore-builtins`) to LionCore](./builtins.ts)
* [A reader and writer specific for M3 instances](reading-writing.ts)
* Persistence: [serializer](./serializer.ts) and [deserializer](./deserializer.ts)
* [Constraints checker](./constraints.ts)
* Convenience/helper [functions](./functions.ts) defined on M3 concepts
* ([Reference checker](./reference-checker.ts))

An interesting place to start might be the [self-definition](./lioncore.ts) of LionCore (`LionCore-M3`) using its own [TypeScript type definitions](./types.ts).

