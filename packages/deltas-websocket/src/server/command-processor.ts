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
    AddChildCommand,
    AddPartitionCommand,
    AddPropertyCommand,
    ChangePropertyCommand,
    Command
} from "../payload/command-types.js"
import {
    ChildAddedEvent,
    Event,
    PartitionAddedEvent,
    PropertyAddedEvent,
    PropertyChangedEvent
} from "../payload/event-types.js"


export const commandAsEvent = (command: Command, participationId: string): Event => {

    // TODO  make dependent on which participationId the event is sent _to_
    const participation2nextSequenceNumber: { [participationId: string]: number } = {}
    const nextSequenceNumber = () => {
        if (!(participationId in participation2nextSequenceNumber)) {
            participation2nextSequenceNumber[participationId] = 0
        }
        return ++participation2nextSequenceNumber[participationId]
    }

    const completed = <ET extends Event>(eventName: ET["messageKind"], partialEvent: Partial<ET>): ET =>
        ({
            messageKind: eventName,
            ...partialEvent,
            originCommands: [
                {
                    participationId,
                    commandId: command.commandId
                }
            ],
            sequenceNumber: nextSequenceNumber(),
            protocolMessages: []
        } as unknown as ET) // trade away some type safety for convenience

    // in order of the specification:
    switch (command.messageKind) {
        case "AddPartition": {
            const {newPartition} = command as AddPartitionCommand
            return completed<PartitionAddedEvent>("PartitionAdded", {
                newPartition
            })
        }
        case "AddProperty": {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const {node, property, newValue} = command as AddPropertyCommand<any>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return completed<PropertyAddedEvent<any>>("PropertyAdded", {
                node,
                property,
                newValue
            })
        }
        case "ChangeProperty": {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const {node, property, newValue} = command as ChangePropertyCommand<any>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return completed<PropertyChangedEvent<any>>("PropertyChanged", {
                node,
                property,
                newValue,
                oldValue: "???",
            })
        }
        case "AddChild": {
            const {parent, newChild, containment, index} = command as AddChildCommand
            return completed<ChildAddedEvent>("ChildAdded", {
                parent,
                newChild,
                containment,
                index
            })
        }

        default:
            throw new Error(`can't handle command of kind ${command.messageKind}`)
    }

}

