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
import { createWebSocketClient, LowLevelClient } from "../web-socket/client.js"
import { Command } from "../payload/command-types.js"
import { Event } from "../payload/event-types.js"
import {
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

    static async setUp({clientId, url, languageBases, serializationChunk, semanticLogger}: LionWebClientParameters): Promise<LionWebClient> {
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

        const receiveMessageOnClient = (message: Event | QueryResponse) => {
            // TODO  put received message on a queue (sorted by sequence number), and only process if all previous one have been processed
            log(new ClientReceivedMessage(clientId, message))
            switch (message.messageKind) {
                case "SignOnResponse": {
                    lionWebClient.participationId = (message as SignOnQueryResponse).participationId
                    return // ~void
                }
                case "SignOffResponse": {
                    lionWebClient.participationId = undefined
                    return // ~void
                }
                // all commands, in order of the specification:
                case "PartitionAdded":
                case "PropertyAdded":
                case "PropertyChanged":
                case "ChildAdded":
                {
                    const event = message as Event
                    const originatingCommand = event.originCommands.find(({ commandId }) => commandIds.indexOf(commandId) > -1)
                    if (originatingCommand === undefined) {
                        const delta = eventAsDelta(event)
                        applyDelta(delta)
                        log(new ClientAppliedEvent(clientId, event))
                    } else {
                        log(new ClientDidNotApplyEventFromOwnCommand(clientId, originatingCommand.commandId))
                    }
                    return
                }
                default:
                    throw new Error(`client can't handle a message of kind "${message.messageKind}"`)   // TODO  instead: log an item, and fall through
            }
        }

        const lowLevelClient = await createWebSocketClient<(Event | QueryResponse), (Command | QueryRequest)>(
            url,
            clientId,
            receiveMessageOnClient
        )

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

    async signOn(queryId: LionWebId) {
        await this.lowLevelClient.sendMessage({
            messageKind: "SignOnRequest",
            queryId,
            deltaProtocolVersion: "2025.1",
            clientId: this.clientId,
            protocolMessages: []
        } as SignOnQueryRequest)
    }

    async signOff(queryId: LionWebId) {
        await this.lowLevelClient.sendMessage({
            messageKind: "SignOffRequest",
            queryId,
            protocolMessages: []
        } as SignOffQueryRequest)
    }

    async disconnect() {
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

