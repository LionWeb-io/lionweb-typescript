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

import { commandAsEvent } from "./command-to-event.js"
import { Command } from "../payload/command-types.js"
import { Event } from "../payload/event-types.js"
import { QueryMessage, SignOffRequest, SignOffResponse, SignOnRequest, SignOnResponse } from "../payload/query-types.js"
import { RepositoryReceivedMessage, SemanticLogger, semanticLoggerFunctionFrom } from "../semantic-logging.js"
import { createWebSocketServer, LowLevelServer } from "../web-socket/server.js"


export type LionWebRepositoryParameters = {
    port: number
    semanticLogger?: SemanticLogger
}

type ClientMetadata = {
    participationId: LionWebId
    clientId: LionWebId
}

export class LionWebRepository {

    constructor(private readonly lowLevelServer: LowLevelServer<Event>) {}

    static async create({port, semanticLogger}: LionWebRepositoryParameters) {
        const log = semanticLoggerFunctionFrom(semanticLogger)

        let nextParticipationIdSequenceNumber = 0
        const receiveMessageOnRepository = (clientMetadata: Partial<ClientMetadata>, message: Command | QueryMessage) => {
            log(new RepositoryReceivedMessage({ ...clientMetadata}, message))
            const checkedClientMetadata = (): ClientMetadata => {
                if (clientMetadata.participationId === undefined) {
                    throw new Error(`can't process an event if no participation has started`)   // TODO  instead: log an item, and fall through
                }
                // (now .clientId must be !== undefined too:)
                return clientMetadata as ClientMetadata
            }
            switch (message.messageKind) {
                case "SignOnRequest": {
                    const { clientId, queryId } = message as SignOnRequest
                    clientMetadata.participationId = `participation-${String.fromCharCode(97 + (nextParticipationIdSequenceNumber++))}`
                    clientMetadata.clientId = clientId
                    return {
                        messageKind: "SignOnResponse",
                        queryId,
                        participationId: clientMetadata.participationId,
                        protocolMessages: []
                    } as SignOnResponse
                }
                case "SignOffRequest": {
                    const { queryId } = message as SignOffRequest
                    clientMetadata.participationId = undefined
                    return {
                        messageKind: "SignOffResponse",
                        queryId,
                        protocolMessages: []
                    } as SignOffResponse
                }
                // all commands, in order of the specification (§ 6.5):
                /*
                 * **DEV note**: run
                 *
                 *  $ node src/code-reading/command-message-kinds.js
                 *
                 * inside the build package to generate the following cases.
                 */
                case "AddPartition":
                case "DeletePartition":
                case "ChangeClassifier":
                case "AddProperty":
                case "DeleteProperty":
                case "ChangeProperty":
                case "AddChild":
                case "DeleteChild":
                case "ReplaceChild":
                case "MoveChildFromOtherContainment":
                case "MoveChildFromOtherContainmentInSameParent":
                case "MoveChildInSameContainment":
                case "MoveAndReplaceChildFromOtherContainment":
                case "MoveAndReplaceChildFromOtherContainmentInSameParent":
                case "MoveAndReplaceChildInSameContainment":
                case "AddAnnotation":
                case "DeleteAnnotation":
                case "ReplaceAnnotation":
                case "MoveAnnotationFromOtherParent":
                case "MoveAnnotationInSameParent":
                case "MoveAndReplaceAnnotationFromOtherParent":
                case "MoveAndReplaceAnnotationInSameParent":
                case "AddReference":
                case "DeleteReference":
                case "ChangeReference":
                case "MoveEntryFromOtherReference":
                case "MoveEntryFromOtherReferenceInSameParent":
                case "MoveEntryInSameReference":
                case "MoveAndReplaceEntryFromOtherReference":
                case "MoveAndReplaceEntryFromOtherReferenceInSameParent":
                case "MoveAndReplaceEntryInSameReference":
                case "AddReferenceResolveInfo":
                case "DeleteReferenceResolveInfo":
                case "ChangeReferenceResolveInfo":
                case "AddReferenceTarget":
                case "DeleteReferenceTarget":
                case "ChangeReferenceTarget":
                case "CompositeCommand":
                {
                    lowLevelServer.broadcastMessage(commandAsEvent(message as Command, checkedClientMetadata().participationId))    // FIXME  not correct: message to broadcast to a particular client holds sequence number for that particular participation
                    return undefined
                }
                default:
                    throw new Error(`can't handle message of kind "${message.messageKind}"`)   // TODO  instead: log an item, and fall through
            }
        }
        const lowLevelServer = createWebSocketServer<Partial<ClientMetadata>, (Command | QueryMessage), (void | QueryMessage), Event>(
            port,
            (_) => ({}), // (leave values undefined – they're set later)
            receiveMessageOnRepository
        )
        return new LionWebRepository(lowLevelServer)
    }

    async shutdown() {
        await this.lowLevelServer.shutdown()
    }

}

