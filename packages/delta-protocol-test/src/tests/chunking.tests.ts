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

import { expect } from "chai"

import { TestLanguageBase } from "@lionweb/class-core-test-language"
import { Classifier, Containment, metaPointerForFeature } from "@lionweb/core"
import { ChunkingInfo, EventChunker } from "@lionweb/delta-protocol-client"
import {
    ChildAddedEvent,
    ContinuedChunkMessage,
    ContinuedEvent,
    Event,
    PartitionAddedEvent,
    SplittableMessage
} from "@lionweb/delta-protocol-common"
import { LionWebId, LionWebJsonChunk, LionWebJsonNode } from "@lionweb/json"


const testLanguage = TestLanguageBase.INSTANCE

const testChunk = (...nodes: LionWebJsonNode[]): LionWebJsonChunk => ({
    serializationFormatVersion: "2023.1",
    languages: [
        {
            key: testLanguage.language.key,
            version: testLanguage.language.version
        }
    ],
    nodes
})

// can use a “custom” splittable message:
interface TestMessage extends SplittableMessage {
    messageKind: "TestMessage"
    chunk: LionWebJsonChunk
}

const testMessageWith = (...nodes: LionWebJsonNode[]): TestMessage => ({
    messageKind: "TestMessage",
    chunk: testChunk(...nodes)
})

// can use a “custom” continued chunk message:
interface TestChunkMessage extends ContinuedChunkMessage {
    messageKind: "TestChunkMessage"
}

const testChunkMessage = (continuedChunkSequenceNumber: number, continuedChunkCompleted: boolean, ...nodes: LionWebJsonNode[]): TestChunkMessage => ({
    messageKind: "TestChunkMessage",
    chunk: testChunk(...nodes),
    continuedChunkCompleted,
    continuedChunkSequenceNumber
})

const testNode = (id: LionWebId, classifier: Classifier = testLanguage.LinkTestConcept): LionWebJsonNode => ({
    id,
    classifier: classifier.metaPointer(),
    properties: [],
    containments: [],
    references: [],
    annotations: [],
    parent: null
})


describe("chunking (in isolation)", () => {

    it("immediately finished, no merging", () => {
        const initialMessage: TestMessage = testMessageWith()
        const chunkingInfo = new ChunkingInfo(initialMessage, "chunk")
        expect(chunkingInfo.maybeCompletedMessage(testChunkMessage(0, true))).to.deep.equal(testMessageWith())
    })

    it("immediately finished, some merging", () => {
        const node1 = testNode("node1")
        const node2 = testNode("node2")
        const initialMessage: TestMessage = testMessageWith(node1)
        const chunkingInfo = new ChunkingInfo(initialMessage, "chunk")
        expect(chunkingInfo.maybeCompletedMessage(testChunkMessage(0, true, node2))).to.deep.equal(testMessageWith(node1, node2))
    })

    it("multiple chunks, out of order, no merging", () => {
        const initialMessage: TestMessage = testMessageWith()
        const chunkingInfo = new ChunkingInfo(initialMessage, "chunk")
        expect(chunkingInfo.maybeCompletedMessage(testChunkMessage(2, true))).to.equal(undefined)
        expect(chunkingInfo.maybeCompletedMessage(testChunkMessage(0, false))).to.equal(undefined)
        expect(chunkingInfo.maybeCompletedMessage(testChunkMessage(1, false))).to.deep.equal(testMessageWith())
    })

    it("fault scenarios", () => {
        const initialMessage: TestMessage = testMessageWith()
        const chunkingInfo = new ChunkingInfo(initialMessage, "chunk")
        expect(chunkingInfo.maybeCompletedMessage(testChunkMessage(0, false))).to.equal(undefined)
        expect(
            () => {
                chunkingInfo.maybeCompletedMessage(testChunkMessage(0, false))
            }
        ).to.throw("received continued chunk with sequence number 0 more than once")
        expect(chunkingInfo.maybeCompletedMessage(testChunkMessage(2, true))).to.equal(undefined)
        expect(
            () => {
                chunkingInfo.maybeCompletedMessage(testChunkMessage(1, true))
            }
        ).to.throw("continued chunk sequence declared complete more than once")
        expect(chunkingInfo.maybeCompletedMessage(testChunkMessage(1, false))).to.deep.equal(testMessageWith())
        expect(
            () => {
                chunkingInfo.maybeCompletedMessage(testChunkMessage(1, false))
            }
        ).to.throw("split message already completed")
    })

})


const partitionAddedEvent = (sequenceNumber: number, split: boolean, ...nodes: LionWebJsonNode[]): PartitionAddedEvent => ({
    messageKind: "PartitionAdded",
    newPartition: testChunk(...nodes),
    sequenceNumber,
    split,
    additionalInfos: [],
    originCommands: []
})

const childAddedEvent = (sequenceNumber: number, parent: LionWebId, newChild: LionWebJsonChunk, containment: Containment, index: number): ChildAddedEvent => ({
    messageKind: "ChildAdded",
    newChild,
    parent,
    containment: metaPointerForFeature(containment),
    index,
    sequenceNumber,
    additionalInfos: [],
    originCommands: []
})

const testContinuedEvent = (sequenceNumber: number, continuedChunkSequenceNumber: number, continuedChunkCompleted: boolean, continuedEventSequenceNumber: number, ...nodes: LionWebJsonNode[]): ContinuedEvent => ({
    messageKind: "ContinuedEvent",
    chunk: testChunk(...nodes),
    continuedChunkCompleted,
    continuedChunkSequenceNumber,
    continuedEventSequenceNumber,
    sequenceNumber,
    additionalInfos: []
})



describe("handling continued events", () => {

    const partition = testNode("partition", testLanguage.TestPartition)
    const node1 = testNode("node1")
    const node2 = testNode("node2")
    const node3 = testNode("node3")
    const node4 = testNode("node4")
    partition.containments.push({
        containment: metaPointerForFeature(testLanguage.TestPartition_links),
        children: ["node1", "node2", "node3"]   // (node4 is for addition later)
    })

    it("this is how it’s done for 1 initial event", () => {
        const initialEvent = partitionAddedEvent(0, true, partition, node1)
        const chunkingInfo = new ChunkingInfo(initialEvent, "newPartition")
        expect(chunkingInfo.maybeCompletedMessage(testContinuedEvent(1, 1, true, initialEvent.sequenceNumber, node2))).to.equal(undefined)
        const combinedEvent = chunkingInfo.maybeCompletedMessage(testContinuedEvent(2, 0, false, initialEvent.sequenceNumber, node3)) as PartitionAddedEvent
        expect(combinedEvent).to.deep.equal(partitionAddedEvent(0, true, partition, node1, node3, node2))
    })

    it("this is how it’s done in general", () => {
        const completedEvents: Event[] = []
        const eventChunker = new EventChunker((completedEvent) => {
            completedEvents.push(completedEvent)
        })

        const initialEvent = partitionAddedEvent(0, true, partition, node1)
        eventChunker.handleEvent(initialEvent)
        expect(completedEvents.length).to.equal(0)

        eventChunker.handleEvent(testContinuedEvent(1, 1, true, initialEvent.sequenceNumber, node2))
        expect(completedEvents.length).to.equal(0)

        const event2 = childAddedEvent(2, "partition", testChunk(node4), testLanguage.TestPartition_links, 0)
        eventChunker.handleEvent(event2)
        expect(completedEvents).to.deep.equal([event2])

        eventChunker.handleEvent(testContinuedEvent(3, 0, false, initialEvent.sequenceNumber, node3))
        const combinedEvent = completedEvents[1]
        expect(combinedEvent).to.deep.equal(partitionAddedEvent(0, true, partition, node1, node3, node2))
    })

    it("fails on faulty events", () => {
        const eventChunker = new EventChunker((_completedEvent) => { /* do nothing */ })

        expect(
            () => {
                eventChunker.handleEvent(testContinuedEvent(1, 0, false, 0))
            }
        ).to.throw("no (initial) split event with ID 0 known")

        const initialEvent = partitionAddedEvent(0, true, partition, node1)
        eventChunker.handleEvent(initialEvent)
        expect(
            () => {
                eventChunker.handleEvent(initialEvent)
            }
        ).to.throw("sequence number 0 already associated with an earlier split event")
    })

})

