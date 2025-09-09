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

import { expect } from "chai"

import {
    CompositeDelta,
    DeltaCompositor,
    deltaReceiverForwardingTo,
    IDelta,
    PartitionAddedDelta
} from "@lionweb/class-core"
import { LionWebClient, SignOnResponse } from "@lionweb/delta-protocol-impl"
import { Message } from "@lionweb/delta-protocol-impl/dist/payload/common.js"
import { semanticConsoleLogger } from "@lionweb/delta-protocol-impl/dist/semantic-logging.js"
import { TestLanguageBase } from "@lionweb/class-core-test/dist/gen/TestLanguage.g.js"


describe("combining delta protocol and an “adjacent” delta receiver", () => {

    it("using a compositor works", async function() {
        const deltas: IDelta[] = []
        let compositorToCreate: DeltaCompositor

        const testLanguageBase = TestLanguageBase.INSTANCE

        const messagesSent: Message[] = []
        const lionWebClient = await LionWebClient.create({
            clientId: "A",
            url: "",
            languageBases: [testLanguageBase],
            instantiateDeltaReceiverForwardingTo: (commandSender) => {
                compositorToCreate = new DeltaCompositor(deltaReceiverForwardingTo(
                    (delta) => {
                        deltas.push(delta)
                    },
                    commandSender
                ))
                return compositorToCreate.upstreamReceiveDelta
            },
            lowLevelClientInstantiator: (_url, _clientId, receiveMessageOnClient) =>
                Promise.resolve({
                    sendMessage: (message) => {
                        if (message.messageKind === "SignOnRequest") {
                            receiveMessageOnClient({
                                messageKind: "SignOnResponse",
                                queryId: "q1",
                                participationId: "participation-1"
                            } as SignOnResponse)
                        } else {
                            messagesSent.push(message)
                        }
                        return Promise.resolve()
                    },
                    disconnect: () => Promise.resolve()
                }),
            semanticLogger: semanticConsoleLogger
        })
        await lionWebClient.signOn("q1")

        const compositor = compositorToCreate!

        const partitionA = lionWebClient.createNode(testLanguageBase.LinkTestConcept, "partition-A")
        compositor.openComposite()
        lionWebClient.addPartition(partitionA)
        expect(deltas).to.deep.equal([])
        expect(messagesSent).to.deep.equal([])
        compositor.closeComposite()
        expect(deltas).deep.equal([new CompositeDelta([new PartitionAddedDelta(partitionA)])])
        expect(messagesSent).to.deep.equal(
            [
                {
                    messageKind: "CompositeCommand",
                    commandId: "cmd-1",
                    parts: [
                        {
                            messageKind: "AddPartition",
                            commandId: "cmd-1-0",
                            newPartition: {
                                serializationFormatVersion: "2023.1",
                                languages: [
                                    {
                                        key: "TestLanguage",
                                        version: "0"
                                    },
                                    {
                                        key: "LionCore-builtins",
                                        version: "2023.1"
                                    }
                                ],
                                nodes: [
                                    {
                                        id: "partition-A",
                                        classifier: {
                                            language: "TestLanguage",
                                            version: "0",
                                            key: "LinkTestConcept"
                                        },
                                        properties: [],
                                        containments: [],
                                        references: [],
                                        annotations: [],
                                        parent: null
                                    }
                                ]
                            },
                            protocolMessages: []
                        }
                    ],
                    protocolMessages: []
                }
            ]
        )
        await lionWebClient.disconnect()
    })

})

