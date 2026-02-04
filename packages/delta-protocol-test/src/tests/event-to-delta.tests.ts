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
    IdMapping,
    nodeBaseDeserializerWithIdMapping,
    PartitionAddedDelta,
    serializeNodeBases
} from "@lionweb/class-core"
import { eventToDeltaTranslator, PartitionAddedEvent } from "@lionweb/delta-protocol-common"
import { expect } from "chai"

import { DataTypeTestConcept, TestLanguageBase, TestPartition } from "@lionweb/class-core-test-language"


describe("event-to-delta translator", () => {

    it("updates ID mapping", () => {
        const base = TestLanguageBase.INSTANCE
        const languageBases = [base]
        const factory = base.factory()

        const rootId = "root"
        const childId = "child"

        const partition = factory(base.TestPartition, rootId) as TestPartition
        const data = factory(base.DataTypeTestConcept, childId) as DataTypeTestConcept
        data.stringValue_1 = "(some text)"
        partition.data = data
        const newPartitionChunk = serializeNodeBases([partition])

        const event: PartitionAddedEvent = {
            messageKind: "PartitionAdded",
            newPartition: newPartitionChunk,
            sequenceNumber: 0,
            originCommands: [],
            protocolMessages: []
        }

        const eventAsDelta = eventToDeltaTranslator(languageBases, nodeBaseDeserializerWithIdMapping(languageBases))
        const idMapping = new IdMapping({})

        const delta = eventAsDelta(event, idMapping)
        expect(delta instanceof PartitionAddedDelta).to.be.true
        expect(idMapping.fromId(rootId) instanceof TestPartition).to.be.true
        expect(idMapping.fromId(childId) instanceof DataTypeTestConcept).to.be.true
    })

})

