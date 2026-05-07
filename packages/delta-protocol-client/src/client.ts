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

import { DeltaReceiver, Forest, ILanguageBase, INodeBase, serializeDelta } from "@lionweb/class-core"
import { LionWebId, LionWebJsonChunk } from "@lionweb/json"

import {
    ansi,
    ClientAppliedEvent,
    ClientDidNotApplyEventFromOwnCommand,
    ClientHadProblem,
    ClientReceivedMessage,
    ClientSentMessage,
    Command,
    DeltaOccurredOnClient,
    deltaToCommandTranslator,
    ErrorResponse,
    Event,
    eventToDeltaTranslator,
    GetAvailableIdsRequest,
    GetAvailableIdsResponse,
    InformAboutChangingPartitionsRequest,
    isContinuedEvent,
    isContinuedQueryResponse,
    isErrorResponse,
    isEvent,
    isQueryResponse,
    ListAndSubscribePartitionsRequest,
    ListAndSubscribePartitionsResponse,
    ListPartitionsRequest,
    ListPartitionsResponse,
    maybeChunkPropertyForSplittableEvent,
    maybeChunkPropertyForSplittableQueryResponse,
    Message,
    originCommandsFrom,
    QueryMessage,
    ReconnectRequest,
    ReconnectResponse,
    SemanticLogger,
    semanticLoggerFunctionFrom,
    SignOffRequest,
    SignOnRequest,
    SignOnResponse,
    SplittableMessage,
    SubscribeToChangingPartitionsRequest,
    SubscribeToPartitionChangesParameters,
    SubscribeToPartitionContentsRequest,
    SubscribeToPartitionContentsResponse,
    UnsubscribeFromPartitionContentsRequest
} from "@lionweb/delta-protocol-common"
import { ChunkingInfo } from "./chunking.js"
import { LowLevelClient, LowLevelClientInstantiator } from "./low-level-client.js"
import { priorityQueueAcceptor } from "./priority-queue.js"

const { clientWarning } = ansi


/**
 * Type def. for parameters – required and optional – for instantiating a {@link LionWebClient LionWeb delta protocol client}.
 */
export type LionWebClientParameters = {
    repositoryId: LionWebId
    clientId: LionWebId
    url: string
    languageBases: ILanguageBase[]
    lowLevelClientInstantiator: LowLevelClientInstantiator<Event | QueryMessage, Command | QueryMessage>
    serializationChunk?: LionWebJsonChunk
    instantiateDeltaReceiverForwardingTo?: (commandSender: DeltaReceiver) => DeltaReceiver
    semanticLogger?: SemanticLogger
}


/**
 * Internal type def. to store the resolve and reject callbacks of a {@link Promise}.
 */
type MessageReceivers = {
    resolve: (value: Message) => void
    reject: (error: ErrorResponse | Error) => void
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
        public readonly repositoryId: LionWebId,
        public readonly clientId: LionWebId,
        public forest: Forest,
        private readonly lowLevelClient: LowLevelClient<Command | QueryMessage>
    ) {}

    private readonly messageReceiversByQueryId: { [queryId: string]: MessageReceivers } = {}
    private readonly chunkingInfoByQueryId: { [queryId: string]: ChunkingInfo } = {}

    private readonly chunkingInfoByEventSequenceNumber: { [sequenceNumber: number]: ChunkingInfo } = {}

    static async create({
        repositoryId,
        clientId,
        url,
        languageBases,
        instantiateDeltaReceiverForwardingTo,
        serializationChunk,
        semanticLogger,
        lowLevelClientInstantiator
    }: LionWebClientParameters): Promise<LionWebClient> {
        const log = semanticLoggerFunctionFrom(semanticLogger)

        const deltaAsCommand = deltaToCommandTranslator()

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
        const forest = new Forest({ languageBases, receiveDelta: effectiveReceiveDelta })
        if (serializationChunk !== undefined) {
            forest.deserializeInto(serializationChunk)
        }
        const eventAsDelta = eventToDeltaTranslator(languageBases, forest.deserializeWithIdMapping)
        loading = false

        const processEvent = (event: Event) => {
            lionWebClient.lastReceivedSequenceNumber = event.sequenceNumber
            const commandOriginatingFromSelf = originCommandsFrom(event).find(({ commandId }) => issuedCommandIds.indexOf(commandId) > -1)
            // Note: we can't remove members from issuedCommandIds because there may be multiple events originating fom a single command.
            if (commandOriginatingFromSelf === undefined) {
                try {
                    const delta = eventAsDelta(event, forest.idMapping)
                    if (delta !== undefined) {
                        try {
                            forest.applyDelta(delta)
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
                if (queryId in lionWebClient.messageReceiversByQueryId) {
                    const messageReceivers = lionWebClient.messageReceiversByQueryId[queryId]
                    if (isErrorResponse(message)) {
                        messageReceivers.reject(message)
                        delete lionWebClient.messageReceiversByQueryId[queryId]
                        return  // ~void
                    }
                    if (isContinuedQueryResponse(message)) {
                        const chunkingInfo = lionWebClient.chunkingInfoByQueryId[queryId]
                        if (chunkingInfo === undefined) {
                            log(new ClientHadProblem(clientId, `received a continued query response for a previous message that wasn’t [declared as] split — ignoring the continued chunk`))
                            return  // ~void
                        }
                        const completedMessage = chunkingInfo.maybeCompletedMessage(message)
                        if (completedMessage !== undefined) {
                            messageReceivers.resolve(completedMessage)
                            delete lionWebClient.messageReceiversByQueryId[queryId]
                        }
                        return  // ~void
                    }
                    const chunkProperty = maybeChunkPropertyForSplittableQueryResponse(message)
                    if (chunkProperty !== undefined && (message as SplittableMessage).split) {  // chunkProperty is defined => message must be a SplittableMessage
                        lionWebClient.chunkingInfoByQueryId[queryId] = new ChunkingInfo(message, chunkProperty)
                    } else {
                        messageReceivers.resolve(message)
                        delete lionWebClient.messageReceiversByQueryId[queryId]
                    }
                    return  // ~void
                }
                console.log(clientWarning(`client received response for a query with ID="${queryId} without having sent a corresponding request - ignoring`))
                return  // ~void
            }
            if (isEvent(message)) {
                if (isContinuedEvent(message)) {
                    const { sequenceNumber } = message
                    const chunkingInfo = lionWebClient.chunkingInfoByEventSequenceNumber[sequenceNumber]
                    if (chunkingInfo === undefined) {
                        log(new ClientHadProblem(clientId, `received a continued event for a previous message that wasn’t [declared as] split — ignoring the continued event`))
                        return  // ~void
                    }
                    const completedMessage = chunkingInfo.maybeCompletedMessage(message)
                    if (completedMessage !== undefined) {
                        acceptEvent(completedMessage as Event)
                        delete lionWebClient.chunkingInfoByEventSequenceNumber[sequenceNumber]
                    }
                    return  // ~void
                }
                const chunkProperty = maybeChunkPropertyForSplittableEvent(message)
                if (chunkProperty !== undefined && (message as SplittableMessage).split) {
                    lionWebClient.chunkingInfoByEventSequenceNumber[message.sequenceNumber] = new ChunkingInfo(message, chunkProperty)
                } else {
                    acceptEvent(message)
                }
                return  // ~void
            }
        }

        const lowLevelClient = await
            lowLevelClientInstantiator({ url, clientId, receiveMessageOnClient /* no logging parameter */ })

        const lionWebClient = new LionWebClient(
            repositoryId,
            clientId,
            forest,
            lowLevelClient
        ) // Note: we need this `lionWebClient` constant non-inlined for access to various private fields from the functions implemented above.
        return lionWebClient
    }

    async disconnect(): Promise<void> {
        // TODO  abort responses to all queries that the repository hasn't responded to?
        await this.lowLevelClient.disconnect()
    }


    // queries, in order of the specification (§ 5.5):

    /**
     * Makes the query in the sense that the given query request is sent (as a client message),
     * and that the `resolve` callback of the associated `Promise` is stored so the promise can be resolved,
     * so that query call can be `await`ed.
     */
    private readonly makeQuery = (queryRequest: QueryMessage): Promise<QueryMessage> =>
        new Promise((resolveResponse: (value: QueryMessage) => void, rejectResponse) => {
            this.messageReceiversByQueryId[queryRequest.queryId] = {
                resolve: resolveResponse as (value: Message) => void,
                reject: rejectResponse
            }
            this.lowLevelClient.sendMessage(queryRequest)
                .catch(rejectResponse)
        })

    /** § 5.5.2.1 */
    async subscribeToChangingPartitions(queryId: LionWebId, parameters: SubscribeToPartitionChangesParameters): Promise<void> {
        await this.makeQuery({
            messageKind: "SubscribeToChangingPartitionsRequest",
            queryId,
            ...parameters,
            additionalInfos: []
        } as SubscribeToChangingPartitionsRequest)
    }

    /** § 5.5.2.2 */
    async informAboutChangingPartitions(queryId: LionWebId, parameters: SubscribeToPartitionChangesParameters, depthLimit: number): Promise<void> {
        await this.makeQuery({
            messageKind: "InformAboutChangingPartitionsRequest",
            queryId,
            ...parameters,
            depthLimit,
            additionalInfos: []
        } as InformAboutChangingPartitionsRequest)
    }

    /** § 5.5.2.3 */
    async subscribeToPartitionContents(queryId: LionWebId, partition: LionWebId): Promise<LionWebJsonChunk> {   // TODO  already deserialize, because we've got everything we need
        const response = await this.makeQuery({
            messageKind: "SubscribeToPartitionContentsRequest",
            queryId,
            partition,
            additionalInfos: []
        } as SubscribeToPartitionContentsRequest) as SubscribeToPartitionContentsResponse
        return response.contents
    }

    /** § 5.5.2.4 */
    async unsubscribeFromPartitionContents(queryId: LionWebId, partition: LionWebId): Promise<void> {
        await this.makeQuery({
            messageKind: "UnsubscribeFromPartitionContentsRequest",
            queryId,
            partition,
            additionalInfos: []
        } as UnsubscribeFromPartitionContentsRequest)
    }

    /** § 5.5.3.1 */
    async signOn(queryId: LionWebId, repositoryId: LionWebId): Promise<void> {
        if (this.signedOff) {
            return Promise.reject(new Error(`can't sign on after having signed off`))
        }
        const response = await this.makeQuery({
            messageKind: "SignOnRequest",
            queryId,
            repositoryId,
            deltaProtocolVersion: "2026.1",
            clientId: this.clientId,
            additionalInfos: []
        } as SignOnRequest) as SignOnResponse
        this._participationId = response.participationId
    }

    /** § 5.5.3.2 */
    async signOff(queryId: LionWebId): Promise<void> {
        await this.makeQuery({
            messageKind: "SignOffRequest",
            queryId,
            additionalInfos: []
        } as SignOffRequest)
        this.signedOff = true
        this._participationId = undefined
    }

    /** § 5.5.3.3 */
    async reconnect(queryId: LionWebId, lastReceivedSequenceNumber: number): Promise<void> {
        const response = await this.makeQuery({
            messageKind: "ReconnectRequest",
            queryId,
            deltaProtocolVersion: "2026.1",
            clientId: this.clientId,
            repositoryId: this.repositoryId,
            participationId: this.participationId,
            lastReceivedSequenceNumber,
            additionalInfos: []
        } as ReconnectRequest) as ReconnectResponse
        this.lastReceivedSequenceNumber = response.lastSentSequenceNumber
    }

    /** § 5.5.4.1 */
    async getAvailableIds(queryId: LionWebId, count: number): Promise<LionWebId[]> {
        const response = await this.makeQuery({
            messageKind: "GetAvailableIdsRequest",
            queryId,
            count,
            additionalInfos: []
        } as GetAvailableIdsRequest) as GetAvailableIdsResponse
        return response.ids
    }

    /** § 5.5.4.2 */
    async listPartitions(queryId: LionWebId, depthLimit: number): Promise<LionWebJsonChunk> {
        const response = await this.makeQuery({
            messageKind: "ListPartitionsRequest",
            depthLimit,
            queryId,
            additionalInfos: []
        } as ListPartitionsRequest) as ListPartitionsResponse
        return response.partitions
    }

    /** § 5.5.4.3 */
    async listAndSubscribePartitions(queryId: LionWebId): Promise<LionWebJsonChunk> {
        const response = await this.makeQuery({
            messageKind: "ListAndSubscribePartitionsRequest",
            queryId,
            additionalInfos: []
        } as ListAndSubscribePartitionsRequest) as ListAndSubscribePartitionsResponse
        return response.partitions
    }


    // commands, in order of the specification (§ 5.7):

    private checkSignedOn(): void {
        if (this._participationId === undefined) {
            throw new Error(`client ${this.clientId} can't send a command without being signed on`)
        }
    }

    /** § 5.7.2.1 */
    addPartition(partition: INodeBase): void {
        this.checkSignedOn()
        this.forest.addPartition(partition)
    }

    /** § 5.7.2.2 */
    deletePartition(partition: INodeBase): void {
        this.checkSignedOn()
        this.forest.deletePartition(partition)
    }

}

