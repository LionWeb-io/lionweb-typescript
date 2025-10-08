// Copyright 2025 TRUMPF Laser SE and other contributors
//
// Licensed under the Apache License, Version 2.0 (the "License")
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// SPDX-FileCopyrightText: 2025 TRUMPF Laser SE and other contributors
// SPDX-License-Identifier: Apache-2.0

import {
    allNodesFrom,
    applyDelta,
    combinedFactoryFor,
    DeltaReceiver,
    IdMapping,
    ILanguageBase,
    INodeBase,
    nodeBaseDeserializer,
    NodeBaseFactory,
    PartitionAddedDelta,
    PartitionDeletedDelta,
    serializeDelta
} from "@lionweb/class-core"
import { Concept } from "@lionweb/core"
import { LionWebId, LionWebJsonChunk } from "@lionweb/json"
import { byIdMap } from "@lionweb/ts-utils"

import {
    ansi,
    ClientAppliedEvent,
    ClientDidNotApplyEventFromOwnCommand,
    ClientHadProblem,
    ClientReceivedMessage,
    ClientSentMessage,
    Command,
    deltaAsCommand,
    DeltaOccurredOnClient,
    Event,
    eventToDeltaTranslator,
    isEvent,
    isQueryResponse,
    QueryMessage,
    ReconnectRequest,
    ReconnectResponse,
    SemanticLogger,
    semanticLoggerFunctionFrom,
    SignOffRequest,
    SignOnRequest,
    SignOnResponse,
    SubscribeToChangingPartitionsRequest,
    SubscribeToPartitionChangesParameters,
    SubscribeToPartitionContentsRequest,
    SubscribeToPartitionContentsResponse,
    UnsubscribeFromPartitionContentsRequest
} from "@lionweb/delta-protocol-common"
import { LowLevelClient, LowLevelClientInstantiator } from "./low-level-client.js"
import { priorityQueueAcceptor } from "./priority-queue.js"

const { clientWarning } = ansi


/**
 * Type def. for parameters – required and optional – for instantiating a {@link LionWebClient LionWeb delta protocol client}.
 */
export type LionWebClientParameters = {
    clientId: LionWebId
    url: string
    languageBases: ILanguageBase[]
    lowLevelClientInstantiator: LowLevelClientInstantiator<Event | QueryMessage, Command | QueryMessage>
    serializationChunk?: LionWebJsonChunk
    instantiateDeltaReceiverForwardingTo?: (commandSender: DeltaReceiver) => DeltaReceiver
    semanticLogger?: SemanticLogger
}


/**
 * Implementation of a LionWeb delta protocol client.
 */
export class LionWebClient {

    private _participationId?: LionWebId // !== undefined => signed on

    get participationId() {
        return this._participationId
    }

    private signedOff = false

    private lastReceivedSequenceNumber = -1
    // TODO  could also get this from the priority queue (which would need to be adapted for that)

    private constructor(
        public readonly clientId: LionWebId,
        public model: INodeBase[],
        public readonly idMapping: IdMapping,
        public readonly createNode: NodeBaseFactory,
        private readonly effectiveReceiveDelta: DeltaReceiver,
        private readonly lowLevelClient: LowLevelClient<Command | QueryMessage>
    ) {}

    private readonly queryResolveById: { [queryId: string]: (value: QueryMessage) => void } = {}

    private static readonly nodesByIdFrom = (model: INodeBase[]) =>
        byIdMap(model.flatMap(allNodesFrom))

    static async create({clientId, url, languageBases, instantiateDeltaReceiverForwardingTo, serializationChunk, semanticLogger, lowLevelClientInstantiator}: LionWebClientParameters): Promise<LionWebClient> {
        const log = semanticLoggerFunctionFrom(semanticLogger)

        let loading = true
        let commandNumber = 0
        const issuedCommandIds: string[] = []
        const commandSender: DeltaReceiver = (delta) => {
            try {
                const serializedDelta = serializeDelta(delta)
                log(new DeltaOccurredOnClient(clientId, serializedDelta))
                if (!loading) {
                    const commandId = `cmd-${++commandNumber}`
                    const command = deltaAsCommand(delta, commandId)
                    if (command !== undefined) {
                        issuedCommandIds.push(commandId)  // (register the ID before actually sending the command so that effectively-synchronous tests mimic the actual behavior more reliably)
                        lowLevelClient.sendMessage(command)
                        log(new ClientSentMessage(clientId, command))
                    }
                }
            } catch (e: unknown) {
                console.error(`error occurred during serialization of delta: ${(e as Error).message}`)
                console.dir(delta)
            }
        }
        const effectiveReceiveDelta = instantiateDeltaReceiverForwardingTo === undefined ? commandSender : instantiateDeltaReceiverForwardingTo(commandSender)

        const deserialized = nodeBaseDeserializer(languageBases, effectiveReceiveDelta)
        const model = serializationChunk === undefined ? [] : deserialized(serializationChunk)
        const idMapping = new IdMapping(LionWebClient.nodesByIdFrom(model))
        const eventAsDelta = eventToDeltaTranslator(languageBases, deserialized)
        loading = false

        const processEvent = (event: Event) => {
            lionWebClient.lastReceivedSequenceNumber = event.sequenceNumber
            const commandOriginatingFromSelf = event.originCommands.find(({ commandId }) => issuedCommandIds.indexOf(commandId) > -1)
            // Note: we can't remove members from issuedCommandIds because there may be multiple events originating fom a single command.
            if (commandOriginatingFromSelf === undefined) {
                try {
                    const delta = eventAsDelta(event, idMapping)
                    if (delta !== undefined) {
                        try {
                            applyDelta(delta)
                            log(new ClientAppliedEvent(clientId, event))
                        } catch (e) {
                            log(new ClientHadProblem(clientId, `couldn't apply delta of type ${delta.constructor.name} because of: ${(e as Error).message}`))
                        }
                    }
                } catch (eventTranslationError) {
                    log(new ClientHadProblem(clientId, `couldn't translate event to a delta because of: ${(eventTranslationError as Error).message}\n\tdelta = ${JSON.stringify(event)}`))
                }
            } else {
                log(new ClientDidNotApplyEventFromOwnCommand(clientId, commandOriginatingFromSelf.commandId))
            }
        }

        const acceptEvent = priorityQueueAcceptor<Event>(({sequenceNumber}) => sequenceNumber, 0, processEvent)

        const receiveMessageOnClient = (message: Event | QueryMessage) => {
            log(new ClientReceivedMessage(clientId, message))
            if (isQueryResponse(message)) {
                const { queryId } = message
                if (queryId in lionWebClient.queryResolveById) {
                    const resolveResponse = lionWebClient.queryResolveById[queryId]
                    resolveResponse(message)
                    delete lionWebClient.queryResolveById[queryId]
                    return  // ~void
                }
                console.log(clientWarning(`client received response for a query with ID="${queryId} without having sent a corresponding request - ignoring`))
                return
            }
            if (isEvent(message)) {
                acceptEvent(message)
                return
            }
        }

        const lowLevelClient = await
            lowLevelClientInstantiator({ url, clientId, receiveMessageOnClient /* no logging parameter */ })

        const lionWebClient = new LionWebClient(
            clientId,
            model,
            idMapping,
            combinedFactoryFor(languageBases, effectiveReceiveDelta),
            effectiveReceiveDelta,
            lowLevelClient
        ) // Note: we need this `lionWebClient` constant non-inlined for write-access to lastReceivedSequenceNumber and queryResolveById.
        return lionWebClient
    }

    /**
     * Sets the model held by the client to the given model, discarding the previous one.
     * No commands will be sent because of this action.
     */
    setModel(newModel: INodeBase[]) {
        this.model = newModel
        this.idMapping.reinitializeWith(LionWebClient.nodesByIdFrom(newModel))
    }

    async disconnect(): Promise<void> {
        // TODO  abort responses to all queries that the repository hasn't responded to?
        await this.lowLevelClient.disconnect()
    }


    // queries, in order of the specification (§ 6.3):

    /**
     * Makes the query in the sense that the given query request is sent (as a client message),
     * and that the `resolve` callback of the associated `Promise` is stored so the promise can be resolved,
     * so that query call can be `await`ed.
     */
    private readonly makeQuery = (queryRequest: QueryMessage): Promise<QueryMessage> =>
        new Promise((resolveResponse, rejectResponse) => {
            this.queryResolveById[queryRequest.queryId] = resolveResponse
            this.lowLevelClient.sendMessage(queryRequest)
                .catch(rejectResponse)
        })

    async subscribeToChangingPartitions(queryId: LionWebId, parameters: SubscribeToPartitionChangesParameters): Promise<void> {
        await this.makeQuery({
            messageKind: "SubscribeToChangingPartitionsRequest",
            queryId,
            ...parameters,
            protocolMessages: []
        } as SubscribeToChangingPartitionsRequest)
    }

    async subscribeToPartitionContents(queryId: LionWebId, partition: LionWebId): Promise<LionWebJsonChunk> {   // TODO  already deserialize, because we've got everything we need
        const response = await this.makeQuery({
            messageKind: "SubscribeToPartitionContentsRequest",
            queryId,
            partition,
            protocolMessages: []
        } as SubscribeToPartitionContentsRequest) as SubscribeToPartitionContentsResponse
        return response.contents
    }

    async unsubscribeFromPartitionContents(queryId: LionWebId, partition: LionWebId): Promise<void> {
        await this.makeQuery({
            messageKind: "UnsubscribeFromPartitionContentsRequest",
            queryId,
            partition,
            protocolMessages: []
        } as UnsubscribeFromPartitionContentsRequest)
    }

    async signOn(queryId: LionWebId, repositoryId: LionWebId): Promise<void> {
        if (this.signedOff) {
            return Promise.reject(new Error(`can't sign on after having signed off`))
        }
        const response = await this.makeQuery({
            messageKind: "SignOnRequest",
            queryId,
            repositoryId,
            deltaProtocolVersion: "2025.1",
            clientId: this.clientId,
            protocolMessages: []
        } as SignOnRequest) as SignOnResponse
        this._participationId = response.participationId
    }

    async signOff(queryId: LionWebId): Promise<void> {
        await this.makeQuery({
            messageKind: "SignOffRequest",
            queryId,
            protocolMessages: []
        } as SignOffRequest)
        this.signedOff = true
        this._participationId = undefined
    }

    async reconnect(queryId: LionWebId, participationId: LionWebId, lastReceivedSequenceNumber: number): Promise<void> {
        const response = await this.makeQuery({
            messageKind: "ReconnectRequest",
            queryId,
            participationId,
            lastReceivedSequenceNumber,
            protocolMessages: []
        } as ReconnectRequest) as ReconnectResponse
        this._participationId = participationId
        this.lastReceivedSequenceNumber = response.lastReceivedSequenceNumber
    }


    // commands, in order of the specification (§ 6.5):

    private static checkWhetherPartition(node: INodeBase): void {
        const {classifier} = node
        if (!(classifier instanceof Concept)) {
            throw new Error(`node with classifier ${classifier.name} from language ${classifier.language.name} is not an instance of a Concept`)
        }
        if (!classifier.partition) {
            throw new Error(`classifier ${classifier.name} from language ${classifier.language.name} is not a partition`)
        }
    }

    private checkSignedOn(): void {
        if (this._participationId === undefined) {
            throw new Error(`client ${this.clientId} can't send a command without being signed on`)
        }
    }

    addPartition(partition: INodeBase): void {
        this.checkSignedOn()
        LionWebClient.checkWhetherPartition(partition)
        if (this.model.indexOf(partition) === -1) {
            this.model.push(partition)
            this.idMapping.updateWith(partition)
            this.effectiveReceiveDelta(new PartitionAddedDelta(partition))
        } // else: ignore; already done
    }

    deletePartition(partition: INodeBase): void {
        this.checkSignedOn()
        const index = this.model.indexOf(partition)
        if (index > -1) {
            this.model.splice(index, 1)
            this.effectiveReceiveDelta(new PartitionDeletedDelta(partition))
        } else {
            throw new Error(`node with id "${partition.id}" is not a partition in the current model`)
        }
    }

}

