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
import { expectError } from "./async.js"

import { LionWebClient } from "../client/client-impl.js"
import { mockLowLevelClientInstantiator } from "./mock-low-level-client.js"
import { SignOffResponse, SignOnResponse } from "../payload/query-types.js"
import { TestLanguageBase } from "@lionweb/class-core-test/dist/gen/TestLanguage.g.js"


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

        return expectError(() => lionWebClient.signOn("query-1"), `low-level client not connected to server`)
    })

    it("can sign on and off", async function() {
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

        const partitionA = lionWebClient.factory(testLanguageBase.LinkTestConcept, "partition-A")
        throws(
            () => lionWebClient.addPartition(partitionA),
            new Error(`client A can't send a command without being signed on`)
        )

        await lionWebClient.signOn("query-1")
        expect(lionWebClient.participationId).to.equal("participation-a")

        lionWebClient.addPartition(partitionA)

        await lionWebClient.signOff("query-2")
        expect(lionWebClient.participationId).to.equal(undefined)

        const partitionB = lionWebClient.factory(testLanguageBase.LinkTestConcept, "partition-B")
        throws(
            () => lionWebClient.addPartition(partitionB),
            new Error(`client A can't send a command without being signed on`)
        )

        await lionWebClient.disconnect()
    })

})

