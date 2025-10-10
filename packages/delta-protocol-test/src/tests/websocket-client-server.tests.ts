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

import { noOpProcedure, prefixedWith } from "@lionweb/delta-protocol-common"
import { createWSLowLevelClient } from "@lionweb/delta-protocol-low-level-client-ws"
import { createWebSocketServer, wsLocalhostUrl } from "@lionweb/delta-protocol-repository-ws"

import { expect } from "chai"
import { delayed, expectError } from "../test-utils/async.js"

import { asLowLevelClientLogger } from "../test-utils/logging.js"
import { nextPort } from "../test-utils/port.js"
import { timedConsoleLogger } from "../test-utils/time.js"


/**
 * These unit tests verify that the WebSocket-driven generic clients and servers implemented here function correctly
 */
describe("WebSocket-driven client and server (in isolation and abstraction)", async function() {

    const waitTime = 10

    it("1 client sends a message, server broadcasts same message", async function() { // NOTE: needs to be a “legacy” function declaration, not a double arrow one
        const port = nextPort()

        const logger = timedConsoleLogger("µs")

        type TestPayload = { foo: string }
        const messagesReceivedByServer: TestPayload[] = []
        const messagesReceivedByClient: TestPayload[] = []

        const clientId = "A"

        const [ server, client ] = await Promise.all([  // create in parallel
            createWebSocketServer<void, TestPayload, void, TestPayload>(
                port,
                (_) => undefined,
                (_, message) => {
                    messagesReceivedByServer.push(message)
                },
                prefixedWith(logger, "[server] ")
            ),
            createWSLowLevelClient<TestPayload, TestPayload>({
                    url: wsLocalhostUrl(port),
                    clientId,
                    receiveMessageOnClient: (message) => {
                        messagesReceivedByClient.push(message)
                    }
                },
                asLowLevelClientLogger(prefixedWith(logger, `[client ${clientId}] `))
            )
        ])

        const testPayload: TestPayload = { foo: "bar" }
        await client.sendMessage(testPayload)
        await server.broadcastMessage(testPayload)

        await delayed(waitTime, null) // need to wait for a tiny amount of time so the client can actually receive the payload before it disconnects
        await client.disconnect()
        await server.shutdown()

        expect(messagesReceivedByServer).to.deep.equal([testPayload])
        expect(messagesReceivedByClient).to.deep.equal([testPayload])
    })

    it("client tries to connect to a non-existing server", async function() {
        const url = wsLocalhostUrl(nextPort())  // (differs from already-started servers)
        return expectError(
            () =>
                createWSLowLevelClient({ url, clientId: "client-A", receiveMessageOnClient: noOpProcedure }),
            `could not connect to WebSocket server at ${url}`
        )
    })

    it("client disconnects after server shuts down", async function() {
        const port = nextPort()

        const [client, server] = await Promise.all([
            createWSLowLevelClient({ url: wsLocalhostUrl(port), clientId: "client-A", receiveMessageOnClient: noOpProcedure }),
            createWebSocketServer(port, (_) => undefined, noOpProcedure)
        ])

        await server.shutdown()
        await delayed(waitTime, null) // need to wait for a bit for the server to actually shut down

        return expectError(() => client.disconnect(), `disconnected`)
    })

    it("client tries to send a message after server shuts down", async function() {
        const port = nextPort()

        const [client, server] = await Promise.all([
            createWSLowLevelClient({ url: wsLocalhostUrl(port), clientId: "client-A", receiveMessageOnClient: noOpProcedure }),
            createWebSocketServer(port, (_) => undefined, noOpProcedure)
        ])

        await server.shutdown()
        await delayed(waitTime, null) // need to wait for a bit for the server to actually shut down

        return expectError(() => client.sendMessage("foo"), `can't send message to server when client's state=disconnected`)
    })

})

