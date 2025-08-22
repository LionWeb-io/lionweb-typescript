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
import { DeltaProtocolMessage, Message } from "./common.js"

/**
 * Super interface for both query request and response messages.
 */
export interface QueryMessage extends DeltaProtocolMessage {
    queryId: LionWebId
}


// in order of the specification (§ 6.3):

export interface SubscribeToPartitionChangesParameters {
    creation: boolean
    deletion: boolean
    partitions: boolean
}

export interface SubscribeToChangingPartitionsRequest extends QueryMessage, SubscribeToPartitionChangesParameters {
    messageKind: "SubscribeToChangingPartitionsRequest"
}

export interface SubscribeToChangingPartitionsResponse extends QueryMessage {
    messageKind: "SubscribeToChangingPartitionsResponse"
}


export interface SubscribeToPartitionContentsRequest extends QueryMessage {
    messageKind: "SubscribeToPartitionContentsRequest"
    partition: LionWebId
}

export interface SubscribeToPartitionContentsResponse extends QueryMessage {
    messageKind: "SubscribeToPartitionContentsResponse"
    contents: LionWebJsonChunk
}


export interface UnsubscribeFromPartitionContentsRequest extends QueryMessage {
    messageKind: "UnsubscribeFromPartitionContentsRequest"
    partition: LionWebId
}

export interface UnsubscribeFromPartitionContentsResponse extends QueryMessage {
    messageKind: "UnsubscribeFromPartitionContentsResponse"
}


export interface SignOnRequest extends QueryMessage {
    messageKind: "SignOnRequest"
    deltaProtocolVersion: "2025.1"
    clientId: LionWebId
}

export interface SignOnResponse extends QueryMessage {
    messageKind: "SignOnResponse"
    participationId: LionWebId
}


export interface SignOffRequest extends QueryMessage {
    messageKind: "SignOffRequest"
}

export interface SignOffResponse extends QueryMessage {
    messageKind: "SignOffResponse"
}


export interface ReconnectRequest extends QueryMessage {
    messageKind: "ReconnectRequest"
    participationId: LionWebId
    lastReceivedSequenceNumber: number
}

export interface ReconnectResponse extends QueryMessage {
    messageKind: "ReconnectResponse"
    lastReceivedSequenceNumber: number
}


export interface GetAvailableIdsRequest extends QueryMessage {
    messageKind: "GetAvailableIdsRequest"
    count: number
}

export interface GetAvailableIdsResponse extends QueryMessage {
    messageKind: "GetAvailableIdsResponse"
    ids: LionWebId[]
}


export interface ListPartitionsRequest extends QueryMessage {
    messageKind: "ListPartitionsRequest"
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

