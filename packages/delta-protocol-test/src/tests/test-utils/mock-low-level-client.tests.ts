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
import { expectError } from "../../test-utils/async.js"

import {
    AddPartitionCommand,
    PartitionAddedEvent,
    SignOnRequest,
    SignOnResponse
} from "@lionweb/delta-protocol-impl"
import { LionWebJsonChunk } from "@lionweb/json"
import { mockLowLevelClientInstantiator } from "../../test-utils/mock-low-level-client.js"


describe("mock low-level client", async function() {

    const emptySerializationChunk: LionWebJsonChunk = {
        serializationFormatVersion: "2023.1",
        languages: [],
        nodes: []
    }

    const signOnQueryRequest: SignOnRequest = {
        messageKind: "SignOnRequest",
        deltaProtocolVersion: "2025.1",
        clientId: "A",
        queryId: "query-1",
        protocolMessages: []
    }

    // positive tests:

    it("responds to a query for which it has a response configured", async function() {
        const signOnQueryResponse: SignOnResponse = {
            messageKind: "SignOnResponse",
            queryId: "query-1",
            participationId: "participation-1",
            protocolMessages: []
        }
        const mockLowLevelClient = await mockLowLevelClientInstantiator(
            {},
            {
                "query-1":  signOnQueryResponse
            }
        )(
            "",
            "",
            (message) => {
                expect(message).to.deep.equal(signOnQueryResponse)
            }
        )
        await mockLowLevelClient.sendMessage(signOnQueryRequest)
    })

    it("responds to a command for which it has a response configured", async function() {
        const partitionAddedEvent: PartitionAddedEvent = {
            messageKind: "PartitionAdded",
            newPartition: emptySerializationChunk,
            sequenceNumber: 0,
            originCommands: [
                {
                    participationId: "participation-1",
                    commandId: "command-1"
                }
            ],
            protocolMessages: []
        }
        const mockLowLevelClient = await mockLowLevelClientInstantiator(
            {
                "command-1": partitionAddedEvent
            },
            {}
        )(
            "",
            "",
            (message) => {
                expect(message).to.deep.equal(partitionAddedEvent)
            }
        )
        await mockLowLevelClient.sendMessage({
            messageKind: "AddPartition",
            commandId: "command-1",
            newPartition: emptySerializationChunk,
            protocolMessages: []
        } as AddPartitionCommand)
    })


    // negative tests:

    it("refuses to send messages after disconnect", async function() {
        const mockLowLevelClient = await mockLowLevelClientInstantiator({}, {})("", "", (_) => undefined)
        await mockLowLevelClient.disconnect()
        return expectError(
            () => mockLowLevelClient.sendMessage(signOnQueryRequest),
            `low-level client not connected to repository`)
    })

    it("rejects (on) queries for which it doesn't have a response configured", async function() {
        const mockLowLevelClient = await mockLowLevelClientInstantiator({}, {})("", "", (_) => undefined)
        return expectError(
            () => mockLowLevelClient.sendMessage(signOnQueryRequest),
            `mock low-level client doesn't have a response configured for query with ID="query-1"`
        )
    })

    it("rejects (on) commands for which it doesn't have a response configured", async function() {
        const mockLowLevelClient = await mockLowLevelClientInstantiator({}, {})("", "", (_) => undefined)
        return expectError(
            () => mockLowLevelClient.sendMessage({
                messageKind: "AddPartition",
                commandId: "command-1",
                newPartition: emptySerializationChunk,
                protocolMessages: []
            } as AddPartitionCommand),
            `mock low-level client doesn't have a response configured for command with ID="command-1"`
        )
    })

})

