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
import { DeltaAdditionalInfo, Message } from "./common.js"

/**
 * Super interface for both query request and response messages.
 */
export interface QueryMessage extends DeltaAdditionalInfo {
    queryId: LionWebId
}


// in order of the specification (§ 5.5):

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


/** § 5.5.2.3 (request) */
export interface SubscribeToPartitionContentsRequest extends QueryMessage {
    messageKind: "SubscribeToPartitionContentsRequest"
    partition: LionWebId
}

/** § 5.5.2.3 (response) */
export interface SubscribeToPartitionContentsResponse extends QueryMessage {
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
export interface ListPartitionsResponse extends QueryMessage {
    messageKind: "ListPartitionsResponse"
    partitions: LionWebJsonChunk
}


const queryMessageKinds = [
    "SubscribeToChangingPartitions",
    "SubscribeToPartitionContents",
    "UnsubscribeFromPartitionContents",
    "SignOn",
    "SignOff",
    "Reconnect",
    "GetAvailableIds",
    "ListPartitions"
]

const queryResponseMessageKinds = mapFrom(queryMessageKinds, (str) => `${str}Response`, (_) => true)

export const isQueryResponse = (message: Message): message is QueryMessage =>
    message.messageKind in queryResponseMessageKinds

