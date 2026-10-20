// Copyright 2026 TRUMPF Laser SE and other contributors
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
// SPDX-FileCopyrightText: 2026 TRUMPF Laser SE and other contributors
// SPDX-License-Identifier: Apache-2.0

import {
    ClientItemLogger,
    ErrorResponse,
    Event,
    isContinuedEvent,
    isContinuedQueryResponse,
    isErrorResponse,
    isEvent,
    isQueryResponse,
    maybeChunkPropertyForSplittableEvent,
    maybeChunkPropertyForSplittableQueryResponse,
    Message,
    QueryMessage,
    SplittableMessage
} from "@lionweb/delta-protocol-common"
import { LionWebId } from "@lionweb/json"

import { ChunkingInfo } from "./chunking.js"
import { priorityQueueAcceptor } from "./priority-queue.js"


/**
 * Type def. for objects that store the resolve and reject callbacks of a {@link Promise}
 * instantiated in the context of receiving the response to a query.
 */
export type MessageReceivers = {
    resolve: (value: Message) => void
    reject: (error: ErrorResponse | Error) => void
}


/**
 * Internal constant to indicate no message have been received yet.
 */
const NO_MESSAGE_RECEIVED = -1


/**
 * Class to encapsulate a client’s state w.r.t. handling of messages.
 * (It does *not* hold any model state.)
 */
export class MessageRelatedClientState {

    private _participationId?: LionWebId // !== undefined => signed on

    get participationId() {
        return this._participationId
    }

    signOnWith(participationId: LionWebId) {
        this._participationId = participationId
    }

    private _signedOff = false

    get signedOff() {
        return this._signedOff
    }

    signOff() {
        this._signedOff = true
        this._participationId = undefined
    }

    get signedOn() {
        return !!this._participationId && !this._signedOff
    }


    /**
     * *Note*: only modify from the outside if you know what you’re doing.
     * (Newsflash: you probably don’t...)
     */
    public lastReceivedSequenceNumber = NO_MESSAGE_RECEIVED

    private readonly issuedCommandIds: string[] = []

    registerIssuedCommandId(commandId: string) {
        this.issuedCommandIds.push(commandId)
    }


    private readonly messageReceiversByQueryId: { [queryId: string]: MessageReceivers } = {}

    registerMessageReceivers(queryId: string, messageReceivers: MessageReceivers) {
        this.messageReceiversByQueryId[queryId] = messageReceivers
    }


    private readonly chunkingInfoByQueryId: { [queryId: string]: ChunkingInfo } = {}
    private readonly chunkingInfoByEventSequenceNumber: { [sequenceNumber: number]: ChunkingInfo } = {}

    public readonly receiveMessageOnClient: (message: Event | QueryMessage) => void

    constructor(
        processEvent: (event: Event) => void,
        clientItemLogger: ClientItemLogger
    ) {

        const _processEvent = (event: Event) => {
            this.lastReceivedSequenceNumber = event.sequenceNumber

            const selfOriginatedCommands = event.originCommands.filter(
                ({ participationId }) => participationId === this.participationId
            )
            const commandOriginatingFromSelf = selfOriginatedCommands.find(
                ({ commandId }) =>
                    this.issuedCommandIds.indexOf(commandId) > -1
            )
            // Note: we can't remove members from issuedCommandIds because there may be multiple events originating fom a single command.
            // So, issuedCommandIds will keep growing indefinitely.
            if (commandOriginatingFromSelf !== undefined) {
                clientItemLogger.didNotApplyEventFromOwnCommand(commandOriginatingFromSelf.commandId)
                return
            }
            const unregisteredCommandIds = selfOriginatedCommands.filter(
                ({ commandId }) =>
                    this.issuedCommandIds.indexOf(commandId) === -1
            )
            if (unregisteredCommandIds.length > 0) {
                clientItemLogger.issuedWarning(`received an event stating to have this client as origin (through participation ID "${this.participationId}") without a registration of one or more command IDs (${unregisteredCommandIds.map(({ commandId }) => `"${commandId}"`).join(", ")})`)
            }

            processEvent(event)
        }

        const _acceptEvent = priorityQueueAcceptor<Event>(({ sequenceNumber }) => sequenceNumber, 1, _processEvent)
            // Note: sequenceNumber must be a POSITIVE integer according to the specification, so >= 1.

        this.receiveMessageOnClient = (message: Event | QueryMessage) => {
            clientItemLogger.receivedMessage(message)
            if (isQueryResponse(message)) {
                const { queryId } = message
                if (queryId in this.messageReceiversByQueryId) {
                    const messageReceivers = this.messageReceiversByQueryId[queryId]
                    if (isErrorResponse(message)) {
                        messageReceivers.reject(message)
                        delete this.messageReceiversByQueryId[queryId]
                        return  // ~void
                    }
                    if (isContinuedQueryResponse(message)) {
                        const chunkingInfo = this.chunkingInfoByQueryId[queryId]
                        if (chunkingInfo === undefined) {
                            clientItemLogger.issuedWarning(`received a continued query response for a previous message that wasn’t [declared as] split — ignoring the continued chunk`)
                            return  // ~void
                        }
                        const completedMessage = chunkingInfo.maybeCompletedMessage(message)
                        if (completedMessage !== undefined) {
                            messageReceivers.resolve(completedMessage)
                            delete this.messageReceiversByQueryId[queryId]
                        }
                        return  // ~void
                    }
                    const chunkProperty = maybeChunkPropertyForSplittableQueryResponse(message)
                    if (chunkProperty !== undefined && (message as SplittableMessage).split) {  // chunkProperty is defined => message must be a SplittableMessage
                        this.chunkingInfoByQueryId[queryId] = new ChunkingInfo(message, chunkProperty)
                    } else {
                        messageReceivers.resolve(message)
                        delete this.messageReceiversByQueryId[queryId]
                    }
                    return  // ~void
                }
                clientItemLogger.issuedWarning(`client received response for a query with ID="${queryId} without having sent a corresponding request - ignoring`)
                return  // ~void
            }
            if (isEvent(message)) {
                if (isContinuedEvent(message)) {
                    const { sequenceNumber } = message
                    const chunkingInfo = this.chunkingInfoByEventSequenceNumber[sequenceNumber]
                    if (chunkingInfo === undefined) {
                        clientItemLogger.issuedWarning(`received a continued event for a previous message that wasn’t [declared as] split — ignoring the continued event`)
                        return  // ~void
                    }
                    const completedMessage = chunkingInfo.maybeCompletedMessage(message)
                    if (completedMessage !== undefined) {
                        _acceptEvent(completedMessage as Event)
                        delete this.chunkingInfoByEventSequenceNumber[sequenceNumber]
                    }
                    return  // ~void
                }
                const chunkProperty = maybeChunkPropertyForSplittableEvent(message)
                if (chunkProperty !== undefined && (message as SplittableMessage).split) {
                    this.chunkingInfoByEventSequenceNumber[message.sequenceNumber] = new ChunkingInfo(message, chunkProperty)
                } else {
                    _acceptEvent(message)
                }
                return  // ~void
            }
        }
    }

}

