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
    Deserializer,
    IDelta,
    IdMapping,
    ILanguageBase,
    INodeBase,
    PartitionAddedDelta,
    PropertyAddedDelta,
    PropertyChangedDelta
} from "@lionweb/class-core"
import { Containment, MemoisingSymbolTable, Property } from "@lionweb/core"
import {
    ChildAddedEvent,
    Event,
    PartitionAddedEvent,
    PropertyAddedEvent,
    PropertyChangedEvent
} from "../payload/event-types.js"

export type EventToDeltaTranslator = (event: Event) => IDelta

export const eventToDeltaTranslator = (languageBases: ILanguageBase[], idMapping: IdMapping, deserialized: Deserializer<INodeBase[]>): EventToDeltaTranslator => {
    const symbolTable = new MemoisingSymbolTable(languageBases.map(({language}) => language))
    return (event) => {
        switch (event.messageKind) {

            // in order of the specification:

            case "PartitionAdded": {
                const {newPartition} = event as PartitionAddedEvent
                return new PartitionAddedDelta(deserialized(newPartition)[0])
            }
            case "PropertyAdded": {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const {node, property, newValue} = event as PropertyAddedEvent<any>
                const resolvedNode = idMapping.fromId(node)
                const resolvedProperty = symbolTable.featureMatching(resolvedNode.classifier.metaPointer(), property) as Property
                return new PropertyAddedDelta(resolvedNode, resolvedProperty, newValue)
            }
            case "PropertyChanged": {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const {node, property, newValue, oldValue} = event as PropertyChangedEvent<any>
                const resolvedNode = idMapping.fromId(node)
                const resolvedProperty = symbolTable.featureMatching(resolvedNode.classifier.metaPointer(), property) as Property
                return new PropertyChangedDelta(resolvedNode, resolvedProperty, oldValue, newValue)
            }
            case "ChildAdded": {
                const {parent, newChild, containment, index} = event as ChildAddedEvent
                const resolvedNode = idMapping.fromId(parent)
                const resolvedContainment = symbolTable.featureMatching(resolvedNode.classifier.metaPointer(), containment) as Containment
                return new ChildAddedDelta(resolvedNode, resolvedContainment, index, deserialized(newChild)[0])
            }

            default:
                throw new Error(`can't handle event of kind ${event.messageKind}`)
        }
    }
}

