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

import { LionWebId } from "@lionweb/json"

import { Command } from "../payload/command-types.js"
import { Event } from "../payload/event-types.js"
import {
    QueryRequest,
    QueryResponse,
    SignOffQueryRequest,
    SignOffQueryResponse,
    SignOnQueryRequest,
    SignOnQueryResponse
} from "../payload/query-types.js"
import { SemanticLogger, semanticLoggerFunctionFrom, ServerReceivedMessage } from "../semantic-logging.js"
import { commandAsEvent } from "./command-processor.js"
import { createWebSocketServer, LowLevelServer } from "../web-socket/server.js"


export type LionWebServerParameters = {
    port: number
    semanticLogger?: SemanticLogger
}

type ClientMetadata = {
    participationId: LionWebId
    clientId: LionWebId
}

export class LionWebServer {

    constructor(private readonly lowLevelServer: LowLevelServer<Event>) {}

    static async setUp({port, semanticLogger}: LionWebServerParameters) {
        const log = semanticLoggerFunctionFrom(semanticLogger)

        let nextParticipationIdSequenceNumber = 0
        const receiveMessageOnServer = (clientMetadata: Partial<ClientMetadata>, message: Command | QueryRequest) => {
            log(new ServerReceivedMessage({ ...clientMetadata}, message))
            const checkedClientMetadata = (): ClientMetadata => {
                if (clientMetadata.participationId === undefined) {
                    throw new Error(`can't process an event if no participation has started`)   // TODO  instead: log an item, and fall through
                }
                // (now .clientId must be !== undefined too:)
                return clientMetadata as ClientMetadata
            }
            switch (message.messageKind) {
                case "SignOnRequest": {
                    const { clientId, queryId } = message as SignOnQueryRequest
                    clientMetadata.participationId = `participation-${String.fromCharCode(97 + (nextParticipationIdSequenceNumber++))}`
                    clientMetadata.clientId = clientId
                    return {
                        messageKind: "SignOnResponse",
                        queryId,
                        participationId: clientMetadata.participationId,
                        protocolMessages: []
                    } as SignOnQueryResponse
                }
                case "SignOffRequest": {
                    const { queryId } = message as SignOffQueryRequest
                    clientMetadata.participationId = undefined
                    return {
                        messageKind: "SignOffResponse",
                        queryId,
                        protocolMessages: []
                    } as SignOffQueryResponse
                }
                // all commands, in order of the specification:
                case "AddPartition":
                case "AddProperty":
                case "ChangeProperty":
                case "AddChild":
                {
                    lowLevelServer.broadcastMessage(commandAsEvent(message as Command, checkedClientMetadata().participationId))    // FIXME  not correct: message to broadcast to a particular client holds sequence number for that particular participation
                    return undefined
                }
                default:
                    throw new Error(`can't handle message of kind "${message.messageKind}"`)   // TODO  instead: log an item, and fall through
            }
        }
        const lowLevelServer = await createWebSocketServer<Partial<ClientMetadata>, (Command | QueryRequest), (void | QueryResponse), Event>(
            port,
            (_) => ({}), // (leave values undefined – they're set later)
            receiveMessageOnServer
        )
        return new LionWebServer(lowLevelServer)
    }

    async shutdown() {
        await this.lowLevelServer.shutdown()
    }

}

