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

import { DeltaReceiver, deltaSerializer, Forest, ILanguageBase, INodeBase } from "@lionweb/class-core"
import { LionWebId, LionWebJsonChunk, LionWebJsonDeltaChunk } from "@lionweb/json"

import {
    ClientItemLogger,
    Command,
    deltaToCommandTranslator,
    Event,
    eventToDeltaTranslator,
    GetAvailableIdsRequest,
    GetAvailableIdsResponse,
    InformAboutChangingPartitionsRequest,
    ListAndSubscribePartitionsRequest,
    ListAndSubscribePartitionsResponse,
    ListPartitionsRequest,
    ListPartitionsResponse,
    Message,
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
import { MessageRelatedClientState } from "./state.js"


/**
 * Type def. for a {@link LowLevelClientInstantiator} with type arguments suitable for a LionWeb delta protocol-compliant client.
 */
export type LionWebDeltaProtocolLowLevelClientInstantiator = LowLevelClientInstantiator<Event | QueryMessage, Command | QueryMessage>


/**
 * Type def. for parameters – required and optional – for instantiating a {@link LionWebClient LionWeb delta protocol client}.
 */
export type LionWebClientParameters = {
    repositoryId: LionWebId
    clientId: LionWebId
    url: string
    languageBases: ILanguageBase[]
    lowLevelClientInstantiator: LionWebDeltaProtocolLowLevelClientInstantiator
    serializationChunk?: LionWebJsonChunk
    instantiateDeltaReceiverForwardingTo?: (commandSender: DeltaReceiver) => DeltaReceiver
    semanticLogger?: SemanticLogger
}


/**
 * Implementation of a LionWeb delta protocol client.
 */
export class LionWebClient {

    private constructor(
        public readonly repositoryId: LionWebId,
        public readonly clientId: LionWebId,
        public readonly forest: Forest,
        private readonly messageRelatedClientState: MessageRelatedClientState,
        private readonly lowLevelClient: LowLevelClient<Command | QueryMessage>
    ) {}

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
        const clientItemLogger = new ClientItemLogger(clientId, log)

        const deltaAsCommand = deltaToCommandTranslator()
        const serializeDelta = deltaSerializer()

        let loading = true
        let commandNumber = 0
        const commandSender: DeltaReceiver = (delta) => {
            try {
                const serializedDelta = serializeDelta(delta)
                clientItemLogger.deltaOccurredOnClient(serializedDelta)
                if (!loading) {
                    const commandId = `cmd-${++commandNumber}`
                    const command = deltaAsCommand(delta, commandId)
                    if (command !== undefined) {
                        messageRelatedClientState.registerIssuedCommandId(commandId)  // (register the ID before actually sending the command so that effectively-synchronous tests mimic the actual behavior more reliably)
                        lowLevelClient.sendMessage(command)
                        clientItemLogger.clientSentMessage(command)
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
        const eventAsDelta = eventToDeltaTranslator(languageBases, forest.deserialize)
        loading = false

        const messageRelatedClientState = new MessageRelatedClientState(
            (event) => {
                try {
                    const delta = eventAsDelta(event, forest.idMapping)
                    if (delta !== undefined) {
                        try {
                            forest.applyDelta(delta)
                            clientItemLogger.clientAppliedEvent(event)
                        } catch (e) {
                            clientItemLogger.clientHadProblem(`couldn't apply delta of type ${delta.constructor.name} because of: ${(e as Error).message}`)
                        }
                    }
                } catch (eventTranslationError) {
                    clientItemLogger.clientHadProblem(`couldn't translate event to a delta because of: ${(eventTranslationError as Error).message}\n\tdelta = ${JSON.stringify(event)}`)
                }
            },
            clientItemLogger
        )

        const lowLevelClient = await
            lowLevelClientInstantiator({
                url,
                clientId,
                receiveMessageOnClient: messageRelatedClientState.receiveMessageOnClient.bind(messageRelatedClientState)
                /* no logging parameter */
            })

        const lionWebClient = new LionWebClient(
            repositoryId,
            clientId,
            forest,
            messageRelatedClientState,
            lowLevelClient
        ) // Note: we need this `lionWebClient` constant non-inlined for access to various private fields from the functions implemented above.
        return lionWebClient
    }

    async disconnect(): Promise<void> {
        // TODO  abort responses to all queries that the repository hasn't responded to?
        await this.lowLevelClient.disconnect()
    }


    /**
     * The participation ID under which this client is connected,
     * or `undefined` if it isn’t connected.
     */
    get participationId() {
        return this.messageRelatedClientState.participationId
    }


    // queries, in order of the specification (§ 5.5):

    /**
     * Makes the query in the sense that the given query request is sent (as a client message),
     * and that the `resolve` callback of the associated `Promise` is stored so the promise can be resolved,
     * so that query call can be `await`ed.
     */
    private readonly makeQuery = (queryRequest: QueryMessage): Promise<QueryMessage> =>
        new Promise((resolveResponse: (value: QueryMessage) => void, rejectResponse) => {
            this.messageRelatedClientState.registerMessageReceivers(
                queryRequest.queryId,
                {
                    resolve: resolveResponse as (value: Message) => void,
                    reject: rejectResponse
                }
            )
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
    async subscribeToPartitionContents(queryId: LionWebId, partition: LionWebId): Promise<LionWebJsonDeltaChunk> {   // TODO  already deserialize, because we've got everything we need
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
        if (this.messageRelatedClientState.signedOff) {
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
        this.messageRelatedClientState.signOnWith(response.participationId)
    }

    /** § 5.5.3.2 */
    async signOff(queryId: LionWebId): Promise<void> {
        await this.makeQuery({
            messageKind: "SignOffRequest",
            queryId,
            additionalInfos: []
        } as SignOffRequest)
        this.messageRelatedClientState.signOff()
    }

    /** § 5.5.3.3 */
    async reconnect(queryId: LionWebId): Promise<void> {
        const response = await this.makeQuery({
            messageKind: "ReconnectRequest",
            queryId,
            deltaProtocolVersion: "2026.1",
            clientId: this.clientId,
            repositoryId: this.repositoryId,
            participationId: this.messageRelatedClientState.participationId,
            lastReceivedSequenceNumber: this.messageRelatedClientState.lastReceivedSequenceNumber,
            additionalInfos: []
        } as ReconnectRequest) as ReconnectResponse
        this.messageRelatedClientState.lastReceivedSequenceNumber = response.lastSentSequenceNumber
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
    async listPartitions(queryId: LionWebId, depthLimit: number): Promise<LionWebJsonDeltaChunk> {
        const response = await this.makeQuery({
            messageKind: "ListPartitionsRequest",
            depthLimit,
            queryId,
            additionalInfos: []
        } as ListPartitionsRequest) as ListPartitionsResponse
        return response.partitions
    }

    /** § 5.5.4.3 */
    async listAndSubscribePartitions(queryId: LionWebId): Promise<LionWebJsonDeltaChunk> {
        const response = await this.makeQuery({
            messageKind: "ListAndSubscribePartitionsRequest",
            queryId,
            additionalInfos: []
        } as ListAndSubscribePartitionsRequest) as ListAndSubscribePartitionsResponse
        return response.partitions
    }


    // commands, in order of the specification (§ 5.7):

    private checkSignedOn(): void {
        if (!this.messageRelatedClientState.signedOn) {
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

