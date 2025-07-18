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
    QueryRequest,
    QueryResponse,
    SignOffQueryRequest,
    SignOnQueryRequest,
    SignOnQueryResponse
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


export type LionWebClientParameters = {
    clientId: LionWebId
    url: string
    languageBases: ILanguageBase[]
    serializationChunk?: LionWebJsonChunk
    semanticLogger?: SemanticLogger
    lowLevelClientInstantiator?: LowLevelClientInstantiator<Event | QueryResponse, Command | QueryRequest>
}


type QueryData = {
    resolveResponse: (value: QueryResponse) => void
    rejectResponse: (reason?: Error) => void
}


export class LionWebClient {

    participationId?: LionWebId

    constructor(
        public readonly clientId: LionWebId,
        public readonly model: INodeBase[],
        private readonly idMapping: IdMapping,
        public readonly factory: NodeBaseFactory,
        private readonly commandSender: DeltaHandler,
        private readonly lowLevelClient: LowLevelClient<Command | QueryRequest>
    ) {}

    private readonly queryPromiseById: { [queryId: string]: QueryData } = {}

    static async setUp({clientId, url, languageBases, serializationChunk, semanticLogger, lowLevelClientInstantiator}: LionWebClientParameters): Promise<LionWebClient> {
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
            const originatingCommand = event.originCommands.find(({ commandId }) => commandIds.indexOf(commandId) > -1)
            if (originatingCommand === undefined) {
                const delta = eventAsDelta(event)
                applyDelta(delta)
                log(new ClientAppliedEvent(clientId, event))
            } else {
                log(new ClientDidNotApplyEventFromOwnCommand(clientId, originatingCommand.commandId))
            }
        }

        const processQueryResponse = (queryResponse: QueryResponse, {resolveResponse, rejectResponse}: QueryData) => {
            switch (queryResponse.messageKind) {
                case "SignOnResponse": {
                    lionWebClient.participationId = (queryResponse as SignOnQueryResponse).participationId
                    return resolveResponse(queryResponse) // ~void
                }
                case "SignOffResponse": {
                    lionWebClient.participationId = undefined
                    return resolveResponse(queryResponse)
                }
                default: {
                    rejectResponse(new Error(`client can't handle a query response of kind "${queryResponse.messageKind}"`))
                }
            }
        }

        const receiveMessageOnClient = (message: Event | QueryResponse) => {
            log(new ClientReceivedMessage(clientId, message))
            if (isQueryResponse(message)) {
                const {queryId} = message
                if (queryId in lionWebClient.queryPromiseById) {
                    processQueryResponse(message, lionWebClient.queryPromiseById[queryId])
                    delete lionWebClient.queryPromiseById[queryId]
                    return  // ~void
                }
            }
            if (isEvent(message)) {
                return processEvent(message)   // ~void
            }
        }

        const lowLevelClient = await
            (lowLevelClientInstantiator === undefined
                ? createWebSocketClient<(Event | QueryResponse), (Command | QueryRequest)>
                : lowLevelClientInstantiator
            ).apply(this, [url, clientId, receiveMessageOnClient])

        const lionWebClient = new LionWebClient(
            clientId,
            model,
            idMapping,
            combinedFactoryFor(languageBases, commandSender),
            commandSender,
            lowLevelClient
        ) // (need this constant non-inlined to set participationId later)
        return lionWebClient
    }

    private enqueueQuery = async (queryRequest: QueryRequest): Promise<QueryResponse> =>
        new Promise((resolveResponse, rejectResponse) => {
            this.queryPromiseById[queryRequest.queryId] = { resolveResponse, rejectResponse }
            return this.lowLevelClient.sendMessage(queryRequest)
        })

    signOn = async (queryId: LionWebId) =>
        await this.enqueueQuery({
            messageKind: "SignOnRequest",
            queryId,
            deltaProtocolVersion: "2025.1",
            clientId: this.clientId,
            protocolMessages: []
        } as SignOnQueryRequest)

    signOff = async (queryId: LionWebId) =>
        await this.enqueueQuery({
            messageKind: "SignOffRequest",
            queryId,
            protocolMessages: []
        } as SignOffQueryRequest)

    async disconnect() {
        // TODO  abort responses to all queries that the server hasn't responded to?
        await this.lowLevelClient.disconnect()
    }

    private static checkWhetherPartition(node: INodeBase): void {
        const {classifier} = node
        if (!(classifier instanceof Concept)) {
            throw new Error(`node with classifier ${classifier.name} from language ${classifier.language.name} is not an instance of a Concept`)
        }
        if (!classifier.partition) {
            throw new Error(`classifier ${classifier.name} from language ${classifier.language.name} is not a partition`)
        }
    }

    addPartition(partition: INodeBase) {
        LionWebClient.checkWhetherPartition(partition)
        if (this.model.indexOf(partition) === -1) {
            this.model.push(partition)
            this.idMapping.updateWith(partition)
            this.commandSender(new PartitionAddedDelta(partition))
        } // else: ignore; already done
    }

}

