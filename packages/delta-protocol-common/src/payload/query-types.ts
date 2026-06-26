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

import { LionWebId, LionWebJsonChunk } from "@lionweb/json"
import { mapFrom } from "@lionweb/ts-utils"
import { ContinuedChunkMessage, CustomMessageKind, DeltaAdditionalInfo, Message, SplittableMessage } from "./common.js"

/**
 * Super interface for both query request and response messages.
 */
export interface QueryMessage extends DeltaAdditionalInfo {
    queryId: LionWebId
}


/**
 * “Abstract” interface for custom queries’ requests.
 *
 * § 5.3.1 (request)
 */
export interface CustomQueryRequest extends QueryMessage {
    messageKind: CustomMessageKind
}

/**
 * “Abstract” interface for custom queries’ responses.
 *
 * § 5.3.1 (response)
 */
export interface CustomQueryResponse extends QueryMessage {
    /*
     * messageKind to be specified:
     *  - MUST adhere to the same format as identifiers,
     *  - MUST start with "Custom_", and
     *  - MUST have at least 8 characters,
     *  - SHOULD end in "Response".
     */
}


// in order of the specification (§ 5.5):

/** § 5.5.1.1 (response) */
export interface ErrorResponse extends QueryMessage {
    messageKind: "ErrorResponse"
    errorCode: string
    message: string
}


/** § 5.5.1.2 (response) */
export interface ContinuedQueryResponse extends QueryMessage, ContinuedChunkMessage {
    messageKind: "ContinuedQueryResponse"
}


export interface SubscribeToPartitionChangesParameters {
    creation: boolean
    deletion: boolean
}


/** § 5.5.2.1 (request) */
export interface SubscribeToChangingPartitionsRequest extends QueryMessage, SubscribeToPartitionChangesParameters {
    messageKind: "SubscribeToChangingPartitionsRequest"
}

/** § 5.5.2.1 (response) */
export interface SubscribeToChangingPartitionsResponse extends QueryMessage {
    messageKind: "SubscribeToChangingPartitionsResponse"
}


/** § 5.5.2.2 (request) */
export interface InformAboutChangingPartitionsRequest extends QueryMessage, SubscribeToPartitionChangesParameters {
    messageKind: "InformAboutChangingPartitionsRequest"
    depthLimit: number
}

/** § 5.5.2.2 (response) */
export interface InformAboutChangingPartitionsResponse extends QueryMessage {
    messageKind: "InformAboutChangingPartitionsResponse"
}


/** § 5.5.2.3 (request) */
export interface SubscribeToPartitionContentsRequest extends QueryMessage {
    messageKind: "SubscribeToPartitionContentsRequest"
    partition: LionWebId
}

/** § 5.5.2.3 (response) */
export interface SubscribeToPartitionContentsResponse extends QueryMessage, SplittableMessage {
    messageKind: "SubscribeToPartitionContentsResponse"
    contents: LionWebJsonChunk
}


/** § 5.5.2.4 (request) */
export interface UnsubscribeFromPartitionContentsRequest extends QueryMessage {
    messageKind: "UnsubscribeFromPartitionContentsRequest"
    partition: LionWebId
}

/** § 5.5.2.4 (response) */
export interface UnsubscribeFromPartitionContentsResponse extends QueryMessage {
    messageKind: "UnsubscribeFromPartitionContentsResponse"
}


/** § 5.5.3.1 (request) */
export interface SignOnRequest extends QueryMessage {
    messageKind: "SignOnRequest"
    deltaProtocolVersion: "2026.1"
    clientId: LionWebId
    repositoryId: LionWebId
}

/** § 5.5.3.1 (response) */
export interface SignOnResponse extends QueryMessage {
    messageKind: "SignOnResponse"
    participationId: LionWebId
}


/** § 5.5.3.2 (request) */
export interface SignOffRequest extends QueryMessage {
    messageKind: "SignOffRequest"
}

/** § 5.5.3.2 (response) */
export interface SignOffResponse extends QueryMessage {
    messageKind: "SignOffResponse"
}


/** § 5.5.3.3 (request) */
export interface ReconnectRequest extends QueryMessage {
    messageKind: "ReconnectRequest"
    deltaProtocolVersion: "2026.1"
    clientId: LionWebId
    repositoryId: LionWebId
    participationId: LionWebId
    lastReceivedSequenceNumber: number
}

/** § 5.5.3.3 (response) */
export interface ReconnectResponse extends QueryMessage {
    messageKind: "ReconnectResponse"
    lastSentSequenceNumber: number
}


/** § 5.5.4.1 (request) */
export interface GetAvailableIdsRequest extends QueryMessage {
    messageKind: "GetAvailableIdsRequest"
    count: number
}

/** § 5.5.4.1 (response) */
export interface GetAvailableIdsResponse extends QueryMessage {
    messageKind: "GetAvailableIdsResponse"
    ids: LionWebId[]
}


/** § 5.5.4.2 (request) */
export interface ListPartitionsRequest extends QueryMessage {
    messageKind: "ListPartitionsRequest"
    depthLimit: number
}

/** § 5.5.4.2 (response) */
export interface ListPartitionsResponse extends QueryMessage, SplittableMessage {
    messageKind: "ListPartitionsResponse"
    partitions: LionWebJsonChunk
}


/** § 5.5.4.3 (request) */
export interface ListAndSubscribePartitionsRequest extends QueryMessage {
    messageKind: "ListAndSubscribePartitionsRequest"
}

/** § 5.5.4.3 (response) */
export interface ListAndSubscribePartitionsResponse extends QueryMessage, SplittableMessage {
    messageKind: "ListAndSubscribePartitionsResponse"
    partitions: LionWebJsonChunk
}


/*
 * **DEV note**: run
 *
 *  $ node src/code-reading/query-message-kinds.js
 *
 * inside the build package to generate the contents of the following array.
 */

const queryMessageKinds = [
    "Error",
    "ContinuedQuery",
    "SubscribeToChangingPartitions",
    "InformAboutChangingPartitions",
    "SubscribeToPartitionContents",
    "UnsubscribeFromPartitionContents",
    "SignOn",
    "SignOff",
    "Reconnect",
    "GetAvailableIds",
    "ListPartitions",
    "ListAndSubscribePartitions"
]

const queryResponseMessageKinds = mapFrom(queryMessageKinds, (str) => `${str}Response`, (_) => true)

export const isQueryResponse = (message: Message): message is QueryMessage =>
    message.messageKind in queryResponseMessageKinds

export const isErrorResponse = (message: Message): message is ErrorResponse =>
    message.messageKind === "ErrorResponse"

export const isContinuedQueryResponse = (message: Message): message is ContinuedQueryResponse =>
    message.messageKind === "ContinuedQueryResponse"

/**
 * (See § 3.7.1 of the specification of the delta protocol.)
 *
 * @return the name of the property of the given {@link QueryMessage} that holds the chunk that may be split, or `undefined` if the given `message` isn’t splittable.
 */
export const maybeChunkPropertyForSplittableQueryResponse = (message: QueryMessage): (string | undefined) => {
    switch (message.messageKind) {
        case "SubscribeToPartitionContentsResponse": return "contents"
        case "ListPartitions": return "partitions"
        case "ListAndSubscribePartitions": return "partitions"
        default: return undefined
    }
}

