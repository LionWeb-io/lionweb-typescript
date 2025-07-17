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

export interface Command extends DeltaProtocolMessage {
    commandId: LionWebId
}


// in order of the specification:

export interface AddPartitionCommand extends Command {
    messageKind: "AddPartition"
    newPartition: LionWebJsonChunk
}

export interface AddPropertyCommand<T> extends Command {
    messageKind: "AddProperty"
    node: LionWebId
    property: LionWebJsonMetaPointer
    newValue: T
}

export interface ChangePropertyCommand<T> extends Command {
    messageKind: "ChangeProperty"
    node: LionWebId
    property: LionWebJsonMetaPointer
    newValue: T
}

export interface AddChildCommand extends Command {
    messageKind: "AddChild"
    parent: LionWebId
    newChild: LionWebJsonChunk
    containment: LionWebJsonMetaPointer
    index: number
}

