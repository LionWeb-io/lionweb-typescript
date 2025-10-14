# The `delta-protocol-client` package

[![license](https://img.shields.io/badge/License-Apache%202.0-green.svg?style=flat)
](./LICENSE)

An NPM package that can be added to a Node.js/NPM codebase as follows:

```shell
$ npm add @lionweb/delta-protocol-client
```

This package implements client that complies with the LionWeb delta protocol is implemented as the `LionWebClient` class.
It *does not* take care of the message transport protocol!
It implements the API specification as found [here](https://github.com/LionWeb-io/specification/blob/main/delta/delta-api.adoc).

A LionWeb client manages exactly one “model”, meaning a forest of nodes with root nodes having `Concept`s marked as partitions as their classifiers.
“To manage” means the following things:

1. Adding to and deleting partitions from the model.
2. Taking care that changes (AKA “deltas”) to the model are propagated as commands to a LionWeb delta protocol-compliant repository.
3. Taking care that incoming events are applied to the model.

**Note** that no conflict resolution is implemented at any level.
Concretely, this means:

* Changes to the model are assumed to be conflict-free with any other changes that may have been concurrently through the connected repository.
  This means, in particular, that any change is assumed to directly lead to an event (coming from the connected repository) that corresponds *exactly* to the change.
* Any events coming from the connected repository correspond to a change that’s either already made to the model, or can be applied directly and entirely conflict-free to the model.

The client connects with the repository through a WebSocket connection.
The details of this connection are entirely encapsulated in two `LowLevelClient` and `LowLevelServer` classes.
These are quite generic (through type parameters for payload types, and configured callback functions), and not at all specific to the LionWeb delta protocol, which makes unit testing these classes quite simple.


## Setting up a client

A client can be instantiated as follows:

```typescript
import { LionWebClient } from "@lionweb/delta-protocol-client"

const lionWebClient = await LionWebClient.create({
    <parameter object>
})
```

The properties of the `<parameter object>` are as follows:

* `clientId`: (required) a string containing the client’s ID, unique within the scope of the repository it connects to.
  It’s also exposed as a field on the client object.
* `url`: (required) a string containing the URL of the WebSocket exposed by the LionWeb delta protocol-compliant repository.
  (The `wsLocalhostUrl` function may be convenient to use — especially in test contexts.)
* `languageBases`: (required) an array containing the implementations of `ILanguageBase` for the languages of the model managed by the client.
* `serializationChunk`: (optional) a `LionWebJsonChunk` that represents the initial state of the model managed by the client.
  If no serialization chunk is provided, the model’s initial state is *empty* — i.e., no roots/partitions.
* `instantiateDeltaReceiverForwardingTo`: (optional) a function that, given a (so-called) “downstream” delta receiver, returns an “upstream/forwarding” delta receiver that forwards deltas (that result from changes to the managed model) to that downstream delta receiver.
  This mechanism is used to intercept changes (as deltas) to the model for purposes other than turning these directly into commands to the LionWeb repository.
  The “upstream/forwarding” delta receiver has the obligations to (eventually) forward all deltas it receives as commands to the LionWeb repository.
* `semanticLogger`: (optional) a `SemanticLogger` instance that accepts semantic log items (`ISemanticLogItem`), to be able to provide verbosity on what’s going on.
  (This is predominantly useful for testing.)
* `lowLevelClientInstantiator`: (optional) a function that instantiates a `LowLevelClient`, given a client ID, an URL, and a `receiveMessageOnClient` function that handles incoming messages.
  This is intended solely for testing purposes, to implement a mock implementation of a LionWeb repository, without needing an actual, working repository implementation, nor even a WebSocket connection.

During creation of the client, a WebSocket connection with the LionWeb repository is set up, and if a serialization chunk is given, it gets deserialized as the model.
After creation of the client, it exposes the following data:

* `.clientId`: the client’s ID.
* `.model`: the managed model, as an array of nodes of `Concept`s that are marked as partition.
* `.createNode`: a factory function that instantiates a node having the given classifier and ID.
  The client ensures that that node is wired-up with an appropriate delta receiver that intercepts changes and propagates these as commands to the connected LionWeb repository.
* `.participationId`: defined after establishing a participation – see below.

The first thing to do before manipulating the model, is to establish a **participation**, which is done as follows:

```typescript
await lionWebClient.signOn(<query ID>)
```

Before a participation has been established, the client can’t send any commands to the LionWeb repository, nor receive any events.
Provided this call succeeds, the ID of the established participation can be retrieved as `lionWebClient.participationId`.

After having established a participation through signing on, the model available through `lionWebClient.model` can be manipulated.
Adding and deleting partitions is done through the `.addPartition(<partition>)` and `.deletePartition(<partition>)` methods.
Changes made to the model are propagated to the effective delta receiver – see the explanation of `instantiateDeltaReceiverForwardingTo` above –, and eventually to the LionWeb repository, as commands.

When you are finished with a client, you can disconnect it from the repository as follows:

```typescript
await lionWebClient.disconnect()
```

After this, the client can’t send any queries nor commands, nor receive any events anymore.


## Hooking up an undo stack

```typescript
import { DeltaCompositor, deltaReceiverForwardingTo, IDelta } from "@lionweb/class-core"
import { LionWebClient } from "@lionweb/delta-protocol-client"

const deltas: IDelta[] = []
let compositorToCreate: DeltaCompositor
const lionWebClient = await LionWebClient.create({
    // ...other parameters...
    instantiateDeltaReceiverForwardingTo: (commandSender) => {
        compositorToCreate = new DeltaCompositor(deltaReceiverForwardingTo(
            (delta) => {
                deltas.push(delta)
            },
            commandSender
        ))
        return compositorToCreate.upstreamReceiveDelta
    }
})
const compositor = compositorToCreate!
```

Now composites can be opened and closed as follows:

```typescript
compositor.openComposite()
// ...change the model...
compositor.closeComposite()
```

The model changes emanating from the statements between `compositor.{open|close}Composite()` are emitted as the `parts` commands of a `CompositeCommand`.

***TODO***


## Development

Build this package from source as follows:

```shell
npm run build
```

