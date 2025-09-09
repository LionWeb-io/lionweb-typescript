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

import {
    PartitionAddedEvent,
    PartitionDeletedEvent,
    SignOffResponse,
    SignOnResponse
} from "@lionweb/delta-protocol-impl"
import { LionWebClient } from "@lionweb/delta-protocol-impl/dist/client/client-impl.js"
import { mockLowLevelClientInstantiator } from "../test-utils/mock-low-level-client.js"
import { TestLanguageBase } from "@lionweb/class-core-test/dist/gen/TestLanguage.g.js"
import { simpleConsoleLogger } from "@lionweb/delta-protocol-impl/dist/utils/textual-logging.js"
import { semanticConsoleLogger } from "@lionweb/delta-protocol-impl/dist/semantic-logging.js"


describe("implementation of LionWeb client", async function() {

    const testLanguageBase = TestLanguageBase.INSTANCE

    it("what happens when sending a message through an unwilling low-level client", async function() {
        const lionWebClient = await LionWebClient.create({
            clientId: "A",
            url: "",
            languageBases: [testLanguageBase],
            lowLevelClientInstantiator: (_url, _clientId, _receiveMessageOnClient) =>
                Promise.resolve({
                    sendMessage: (_message) => Promise.reject(new Error(`I refuse to send messages`)),
                    disconnect: () => Promise.resolve()
                })
        })
        return expectError(() => lionWebClient.signOn("query-1"), `I refuse to send messages`)
    })

    it("can disconnect", async function() {
        const lionWebClient = await LionWebClient.create({
            clientId: "A",
            url: "",
            languageBases: [testLanguageBase],
            lowLevelClientInstantiator: mockLowLevelClientInstantiator({}, {})
        })

        await lionWebClient.disconnect()

        return expectError(() => lionWebClient.signOn("query-1"), `low-level client not connected to repository`)
    })

    it("can sign on and off (and add a partition)", async function() {
        const lionWebClient = await LionWebClient.create({
            clientId: "A",
            url: "",
            languageBases: [testLanguageBase],
            lowLevelClientInstantiator: mockLowLevelClientInstantiator(
                {},
                {
                    "query-1": {
                        messageKind: "SignOnResponse",
                        queryId: "query-1",
                        participationId: "participation-a",
                        protocolMessages: []
                    } as SignOnResponse,
                    "query-2": {
                        messageKind: "SignOffResponse",
                        queryId: "query-2",
                        protocolMessages: []
                    } as SignOffResponse
                }
            )
        })

        const partitionA = lionWebClient.createNode(testLanguageBase.LinkTestConcept, "partition-A")
        throws(
            () => {
                lionWebClient.addPartition(partitionA)
            },
            new Error(`client A can't send a command without being signed on`)
        )

        await lionWebClient.signOn("query-1")
        expect(lionWebClient.participationId).to.equal("participation-a")

        lionWebClient.addPartition(partitionA)
        expect(lionWebClient.model).deep.equal([partitionA])

        // idempotency:
        lionWebClient.addPartition(partitionA)
        expect(lionWebClient.model).deep.equal([partitionA])

        await lionWebClient.signOff("query-2")
        expect(lionWebClient.participationId).to.equal(undefined)

        const partitionB = lionWebClient.createNode(testLanguageBase.LinkTestConcept, "partition-B")
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
            clientId: "A",
            url: "",
            languageBases: [testLanguageBase],
            lowLevelClientInstantiator: mockLowLevelClientInstantiator(
                {
                    "cmd-1": {
                        messageKind: "PartitionAdded",
                        newPartition: {
                            "serializationFormatVersion": "2023.1",
                            "languages": [
                                { "key": "TestLanguage", "version": "0" },
                                { "key": "LionCore-builtins", "version": "2023.1" }
                            ],
                            "nodes": [
                                {
                                    "id": "partition-A",
                                    "classifier": { "language": "TestLanguage", "version": "0", "key": "LinkTestConcept" },
                                    "properties": [],
                                    "containments": [],
                                    "references": [],
                                    "annotations": [],
                                    "parent": null
                                }
                            ]
                        },
                        sequenceNumber: 0,
                        originCommands: [
                            {
                                participationId: "participation-a",
                                commandId: "cmd-1"
                            }
                        ],
                        protocolMessages: []
                    } as PartitionAddedEvent,
                    "cmd-2": {
                        messageKind: "PartitionDeleted",
                        deletedPartition: "partition-A",
                        sequenceNumber: 1,
                        originCommands: [
                            {
                                participationId: "participation-a",
                                commandId: "cmd-2"
                            }
                        ],
                        protocolMessages: []
                    } as PartitionDeletedEvent
                },
                {
                    "query-1": {
                        messageKind: "SignOnResponse",
                        queryId: "query-1",
                        participationId: "participation-a",
                        protocolMessages: []
                    } as SignOnResponse,
                    "query-2": {
                        messageKind: "SignOffResponse",
                        queryId: "query-2",
                        protocolMessages: []
                    } as SignOffResponse
                },
                simpleConsoleLogger
            ),
            semanticLogger: semanticConsoleLogger
        })
        await lionWebClient.signOn("query-1")
        const partitionA = lionWebClient.createNode(testLanguageBase.LinkTestConcept, "partition-A")
        lionWebClient.addPartition(partitionA)

        const partitionB = lionWebClient.createNode(testLanguageBase.LinkTestConcept, "partition-B")
        throws(
            () => {
                lionWebClient.deletePartition(partitionB)
            },
            ` node with id "partition-B" is not a partition in the current model`
        )

        lionWebClient.deletePartition(partitionA)

        expect(lionWebClient.model).to.deep.equal([])
    })

})

