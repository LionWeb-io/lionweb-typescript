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
    DeltaHandler,
    IdMapping,
    ILanguageBase,
    INodeBase,
    nodeBaseDeserializer,
    NodeBaseFactory,
    PartitionAddedDelta,
    serializeDelta
} from "@lionweb/class-core"
import { Concept } from "@lionweb/core"
import { LionWebId, LionWebJsonChunk } from "@lionweb/json"
import { byIdMap } from "@lionweb/ts-utils"

import { deltaAsCommand } from "./delta-to-command.js"
import { eventToDeltaTranslator } from "./event-to-delta.js"
import { createWebSocketClient, LowLevelClient, LowLevelClientInstantiator } from "../web-socket/client.js"
import { Command } from "../payload/command-types.js"
import { Event, isEvent } from "../payload/event-types.js"
import {
    isQueryResponse,
    QueryMessage,
    ReconnectRequest,
    ReconnectResponse,
    SignOffRequest,
    SignOnRequest,
    SignOnResponse,
    SubscribeToChangingPartitionsRequest,
    SubscribeToPartitionChangesParameters,
    SubscribeToPartitionContentsRequest,
    SubscribeToPartitionContentsResponse,
    UnsubscribeFromPartitionContentsRequest
} from "../payload/query-types.js"
import {
    ClientAppliedEvent,
    ClientDidNotApplyEventFromOwnCommand,
    ClientReceivedMessage,
    ClientSentMessage,
    DeltaOccurredOnClient,
    SemanticLogger,
    semanticLoggerFunctionFrom
} from "../semantic-logging.js"
import { withStylesApplied } from "../utils/ansi.js"
import { priorityQueueAcceptor } from "../utils/priority-queue.js"


/**
 * Parameters – required and optional – for instantiating a {@link LionWebClient LionWeb delta protocol client}.
 */
export type LionWebClientParameters = {
    clientId: LionWebId
    url: string
    languageBases: ILanguageBase[]
    serializationChunk?: LionWebJsonChunk
    semanticLogger?: SemanticLogger
    lowLevelClientInstantiator?: LowLevelClientInstantiator<Event | QueryMessage, Command | QueryMessage>
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

    constructor(
        public readonly clientId: LionWebId,
        public readonly model: INodeBase[],
        private readonly idMapping: IdMapping,
        public readonly factory: NodeBaseFactory,
        private readonly commandSender: DeltaHandler,
        private readonly lowLevelClient: LowLevelClient<Command | QueryMessage>
    ) {}

    private readonly queryResolveById: { [queryId: string]: (value: QueryMessage) => void } = {}

    static async create({clientId, url, languageBases, serializationChunk, semanticLogger, lowLevelClientInstantiator}: LionWebClientParameters): Promise<LionWebClient> {
        const log = semanticLoggerFunctionFrom(semanticLogger)

        let loading = true
        let commandNumber = 0
        const commandIds: string[] = []
        const commandSender: DeltaHandler = (delta) => {
            log(new DeltaOccurredOnClient(clientId, serializeDelta(delta)))
            if (!loading) {
                const commandId = `cmd-${++commandNumber}`
                const command = deltaAsCommand(delta, commandId)
                lowLevelClient.sendMessage(command)
                commandIds.push(commandId)
                log(new ClientSentMessage(clientId, command))
            }
        }

        const deserialized = nodeBaseDeserializer(languageBases, commandSender)
        const model = serializationChunk === undefined ? [] : deserialized(serializationChunk)
        const idMapping = new IdMapping(byIdMap(model.flatMap(allNodesFrom)))
        const eventAsDelta = eventToDeltaTranslator(languageBases, idMapping, deserialized)
        loading = false

        const processEvent = (event: Event) => {
            lionWebClient.lastReceivedSequenceNumber = event.sequenceNumber
            const originatingCommand = event.originCommands.find(({ commandId }) => commandIds.indexOf(commandId) > -1)
            if (originatingCommand === undefined) {
                const delta = eventAsDelta(event)
                applyDelta(delta)
                log(new ClientAppliedEvent(clientId, event))
            } else {
                log(new ClientDidNotApplyEventFromOwnCommand(clientId, originatingCommand.commandId))
            }
        }

        const acceptEvent = priorityQueueAcceptor<Event>(({sequenceNumber}) => sequenceNumber, 0, processEvent)

        const receiveMessageOnClient = (message: Event | QueryMessage) => {
            log(new ClientReceivedMessage(clientId, message))
            if (isQueryResponse(message)) {
                const {queryId} = message
                if (queryId in lionWebClient.queryResolveById) {
                    const resolveResponse = lionWebClient.queryResolveById[queryId]
                    resolveResponse(message)
                    delete lionWebClient.queryResolveById[queryId]
                    return  // ~void
                }
                console.log(withStylesApplied("cyan", "italic")(`client received query response without having sent a corresponding query request: query-ID="${queryId}"`))
            }
            if (isEvent(message)) {
                acceptEvent(message)
            }
        }

        const lowLevelClient = await
            (lowLevelClientInstantiator ?? (createWebSocketClient<(Event | QueryMessage), (Command | QueryMessage)>))
                .apply(this, [url, clientId, receiveMessageOnClient])

        const lionWebClient = new LionWebClient(
            clientId,
            model,
            idMapping,
            combinedFactoryFor(languageBases, commandSender),
            commandSender,
            lowLevelClient
        ) // (need this constant non-inlined for write-access to lastReceivedSequenceNumber and queryResolveById)
        return lionWebClient
    }

    async disconnect(): Promise<void> {
        // TODO  abort responses to all queries that the server hasn't responded to?
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

    async signOn(queryId: LionWebId): Promise<void> {
        if (this.signedOff) {
            return Promise.reject(new Error(`can't sign on after having signed off`))
        }
        const response = await this.makeQuery({
            messageKind: "SignOnRequest",
            queryId,
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

    addPartition(partition: INodeBase): void {
        if (this._participationId === undefined) {
            throw new Error(`client ${this.clientId} can't send a command without being signed on`)
        }
        LionWebClient.checkWhetherPartition(partition)
        if (this.model.indexOf(partition) === -1) {
            this.model.push(partition)
            this.idMapping.updateWith(partition)
            this.commandSender(new PartitionAddedDelta(partition))
        } // else: ignore; already done
    }

}

