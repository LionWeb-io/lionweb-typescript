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

import { LionWebId, LionWebJsonChunk, LionWebJsonMetaPointer } from "@lionweb/json"
import { DeltaProtocolMessage } from "./common.js"

export type CommandOrigin = {
    participationId: LionWebId
    commandId: LionWebId
}

export interface Event extends DeltaProtocolMessage {
    originCommands: CommandOrigin[]
    sequenceNumber: number
}


// in order of the specification:

export interface PartitionAddedEvent extends Event {
    messageKind: "PartitionAdded"
    newPartition: LionWebJsonChunk
}

export interface PropertyAddedEvent<T> extends Event {
    messageKind: "PropertyAdded"
    node: LionWebId
    property: LionWebJsonMetaPointer
    newValue: T
}

export interface PropertyChangedEvent<T> extends Event {
    messageKind: "PropertyChanged"
    node: LionWebId
    property: LionWebJsonMetaPointer
    oldValue: T
    newValue: T
}

export interface ChildAddedEvent extends Event {
    messageKind: "ChildAdded"
    parent: LionWebId
    newChild: LionWebJsonChunk
    containment: LionWebJsonMetaPointer
    index: number
}

