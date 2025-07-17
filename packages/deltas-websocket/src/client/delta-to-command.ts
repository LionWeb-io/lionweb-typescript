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
    ChildAddedDelta,
    IDelta,
    PartitionAddedDelta,
    PropertyAddedDelta,
    PropertyChangedDelta,
    serializeNodeBases
} from "@lionweb/class-core"
import { metaPointerFor } from "@lionweb/core"
import {
    AddChildCommand,
    AddPartitionCommand,
    AddPropertyCommand,
    ChangePropertyCommand,
    Command
} from "../payload/command-types.js"

export const deltaAsCommand = (delta: IDelta, commandId: string): Command => {

    const completed = <CT extends Command>(commandName: CT["messageKind"], partialCommand: Partial<CT>) =>
        ({
            messageKind: commandName,
            commandId,
            ...partialCommand,
            protocolMessages: []
        } as unknown as CT) // trade away some type safety for convenience

    // in order of the specification:

    if (delta instanceof PartitionAddedDelta) {
        return completed<AddPartitionCommand>("AddPartition", {
            newPartition: serializeNodeBases([delta.newPartition])
        })
    }
    if (delta instanceof PropertyAddedDelta) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return completed<AddPropertyCommand<any>>("AddProperty", {
            node: delta.container.id,
            property: metaPointerFor(delta.property),
            newValue: delta.value
        })
    }
    if (delta instanceof PropertyChangedDelta) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return completed<ChangePropertyCommand<any>>("ChangeProperty", {
            node: delta.container.id,
            property: metaPointerFor(delta.property),
            newValue: delta.newValue
        })
    }
    if (delta instanceof ChildAddedDelta) {
        return completed<AddChildCommand>("AddChild", {
            parent: delta.parent.id,
            newChild: serializeNodeBases([delta.newChild]),
            containment: metaPointerFor(delta.containment),
            index: delta.index
        })
    }

    throw new Error(`can't handle delta of type ${delta.constructor.name}`)
}

