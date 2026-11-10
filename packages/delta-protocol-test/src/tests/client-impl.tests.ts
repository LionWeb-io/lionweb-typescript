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

import { throws } from "assert"
import { expect } from "chai"
import { expectError } from "../test-utils/async.js"

import { LionWebClient } from "@lionweb/delta-protocol-client"
import {
    Event,
    PartitionAddedEvent,
    PartitionDeletedEvent,
    PropertyAddedEvent,
    semanticConsoleLogger,
    SignOffResponse,
    SignOnResponse,
    simpleConsoleLogger
} from "@lionweb/delta-protocol-common"
import { DataTypeTestConcept, TestLanguageBase, TestPartition } from "@lionweb/class-core-test-language"
import { PropertyChangedDelta } from "@lionweb/class-core"
import { LionWebVersions, metaPointerForFeature } from "@lionweb/core"
import { defaultTestClientParameters } from "../test-utils/client-parameters.js"
import { asLowLevelClientLogger } from "../test-utils/logging.js"
import { mockLionWebClientTestFixture } from "../test-utils/mock-client.js"
import { mockLowLevelClientInstantiator } from "../test-utils/mock-low-level-client.js"


const testLanguageBase = TestLanguageBase.INSTANCE

describe("implementation of LionWeb client", async function() {

    it("what happens when sending a message through an unwilling low-level client", async function() {
        const lionWebClient = await LionWebClient.create({
            ...defaultTestClientParameters,
            lowLevelClientInstantiator: (_) =>
                Promise.resolve({
                    sendMessage: (_message) => Promise.reject(new Error(`I refuse to send messages`)),
                    disconnect: () => Promise.resolve()
                })
        })
        return expectError(() => lionWebClient.signOn("query-1", "myRepo"), `I refuse to send messages`)
    })

    it("can disconnect", async function() {
        const lionWebClient = await LionWebClient.create({
            ...defaultTestClientParameters,
            lowLevelClientInstantiator: mockLowLevelClientInstantiator({}, {})
        })

        await lionWebClient.disconnect()

        return expectError(() => lionWebClient.signOn("query-1", "myRepo"), `low-level client not connected to repository`)
    })

    it("can sign on and off (and add a partition)", async function() {
        const lionWebClient = await LionWebClient.create({
            ...defaultTestClientParameters,
            lowLevelClientInstantiator: mockLowLevelClientInstantiator(
                {},
                {
                    "query-1": {
                        messageKind: "SignOnResponse",
                        queryId: "query-1",
                        participationId: "participation-a",
                        additionalInfos: []
                    } as SignOnResponse,
                    "query-2": {
                        messageKind: "SignOffResponse",
                        queryId: "query-2",
                        additionalInfos: []
                    } as SignOffResponse
                }
            )
        })

        const partitionA = lionWebClient.forest.createNode(testLanguageBase.TestPartition, "partition-A")
        throws(
            () => {
                lionWebClient.addPartition(partitionA)
            },
            new Error(`client A can't send a command without being signed on`)
        )

        await lionWebClient.signOn("query-1", "myRepo")
        expect(lionWebClient.participationId).to.equal("participation-a")

        lionWebClient.addPartition(partitionA)
        expect(lionWebClient.forest.partitions).deep.equal([partitionA])

        // idempotency:
        lionWebClient.addPartition(partitionA)
        expect(lionWebClient.forest.partitions).deep.equal([partitionA])

        await lionWebClient.signOff("query-2")
        expect(lionWebClient.participationId).to.equal(undefined)

        const partitionB = lionWebClient.forest.createNode(testLanguageBase.TestPartition, "partition-B")
        throws(
            () => {
                lionWebClient.addPartition(partitionB)
            },
            new Error(`client A can't send a command without being signed on`)
        )

        await lionWebClient.disconnect()
    })

    it("can delete a partition", async function() {
        const lionWebClient = await LionWebClient.create({
            ...defaultTestClientParameters,
            lowLevelClientInstantiator: mockLowLevelClientInstantiator(
                {
                    "cmd-1": {
                        messageKind: "PartitionAdded",
                        newPartition: {
                            serializationFormatVersion: "2023.1",
                            languages: [
                                { key: "TestLanguage", version: "0" },
                                { key: "LionCore-builtins", version: "2023.1" }
                            ],
                            nodes: [
                                {
                                    id: "partition-A",
                                    classifier: testLanguageBase.TestPartition.metaPointer(),
                                    properties: [],
                                    containments: [],
                                    references: [],
                                    annotations: [],
                                    parent: null
                                }
                            ]
                        },
                        sequenceNumber: 1,
                        originCommands: [
                            {
                                participationId: "participation-a",
                                commandId: "cmd-1"
                            }
                        ],
                        additionalInfos: []
                    } as PartitionAddedEvent,
                    "cmd-2": {
                        messageKind: "PartitionDeleted",
                        deletedPartition: "partition-A",
                        deletedDescendants: [], // (partition consists of only its root)
                        sequenceNumber: 2,
                        originCommands: [
                            {
                                participationId: "participation-a",
                                commandId: "cmd-2"
                            }
                        ],
                        additionalInfos: []
                    } as PartitionDeletedEvent
                },
                {
                    "query-1": {
                        messageKind: "SignOnResponse",
                        queryId: "query-1",
                        participationId: "participation-a",
                        additionalInfos: []
                    } as SignOnResponse,
                    "query-2": {
                        messageKind: "SignOffResponse",
                        queryId: "query-2",
                        additionalInfos: []
                    } as SignOffResponse
                },
                asLowLevelClientLogger(simpleConsoleLogger)
            ),
            semanticLogger: semanticConsoleLogger
        })
        await lionWebClient.signOn("query-1", "myRepo")
        const partitionA = lionWebClient.forest.createNode(testLanguageBase.TestPartition, "partition-A")
        lionWebClient.addPartition(partitionA)

        const partitionB = lionWebClient.forest.createNode(testLanguageBase.TestPartition, "partition-B")
        throws(
            () => {
                lionWebClient.deletePartition(partitionB)
            },
            ` node with id "partition-B" is not a partition in the current model`
        )

        lionWebClient.deletePartition(partitionA)

        expect(lionWebClient.forest.partitions).to.deep.equal([])
    })

    it("partition gets added to the client’s forest after receiving a PartitionAdded event", async function() {
        const { lionWebClient, receiveMessageOnClient } = await mockLionWebClientTestFixture(semanticConsoleLogger)
        expect(lionWebClient.forest.partitions.length).to.equal(0)

        receiveMessageOnClient({
            messageKind: "PartitionAdded",
            newPartition: {
                nodes: [
                    {
                        id: "testPartition",
                        classifier: testLanguageBase.TestPartition.metaPointer(),
                        properties: [],
                        containments: [],
                        references: [],
                        annotations: [],
                        parent: null
                    }
                ]
            },
            sequenceNumber: 1,
            originCommands: [],
            additionalInfos: []
        } as PartitionAddedEvent)

        expect(lionWebClient.forest.partitions.length).to.equal(1)
    })

    it("applies a remote property update to a locally added child", async () => {
        // Arrange:
        const { lionWebClient, receiveMessageOnClient } = await mockLionWebClientTestFixture(semanticConsoleLogger)
        const { forest } = lionWebClient
        const partition = forest.createNode(testLanguageBase.TestPartition, "partition") as TestPartition
        forest.addPartition(partition)
        expect(forest.idMapping.tryFromId("partition")).to.equal(partition)
        expect(partition.receiveDelta).to.not.be.null

        // Act:
        const child = forest.createNode(testLanguageBase.DataTypeTestConcept, "child") as DataTypeTestConcept
        partition.data = child
        receiveMessageOnClient({
            messageKind: "PropertyAdded",
            sequenceNumber: 1,
            node: "child",
            property: metaPointerForFeature(testLanguageBase.DataTypeTestConcept_stringValue_0_1),
            newValue: "approved",
            additionalInfos: [],
            originCommands: [{ participationId: "participation-B", commandId: "remote-1" }]
        } satisfies PropertyAddedEvent as Event)

        // Assert:
        expect(forest.idMapping.tryFromId("child")).to.equal(child)
        expect(child.stringValue_0_1).to.equal("approved")
    })

    it("receives events, and then emits a command after a local change", async () => {
        const { inamed_name } = LionWebVersions.v2023_1.builtinsFacade.features

        // Arrange:
        const { lionWebClient, receiveMessageOnClient, deltasSent } = await mockLionWebClientTestFixture(semanticConsoleLogger)
        const { forest } = lionWebClient
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((forest as any).receiveDelta).to.not.be.undefined

        // Act:
        receiveMessageOnClient({
            messageKind: "PartitionAdded",
            newPartition: {
                nodes: [
                    {
                        id: "partition",
                        classifier: testLanguageBase.TestPartition.metaPointer(),
                        properties: [
                            {
                                property: metaPointerForFeature(inamed_name),
                                value: "my test partition"
                            }
                        ],
                        containments: [],
                        references: [],
                        annotations: [],
                        parent: null
                    }
                ]
            },
            sequenceNumber: 1,
            originCommands: [{ participationId: "participation-B", commandId: "cmd-1" }],
            additionalInfos: []
        } satisfies PartitionAddedEvent as Event)

        // Assert:
        expect(forest.partitions.length).to.equal(1)
        expect(forest.partitions[0] instanceof TestPartition).to.be.true
        const testPartition = forest.partitions[0] as TestPartition
        expect(testPartition.receiveDelta).to.not.be.undefined
        expect(testPartition.name).to.equal("my test partition")
        expect(deltasSent).to.deep.equal([])

        // Act:
        testPartition.name = "partition name"

        // Assert:
        expect(deltasSent).to.deep.equal([ new PropertyChangedDelta(testPartition, inamed_name, "my test partition", "partition name") ])
    })

})

