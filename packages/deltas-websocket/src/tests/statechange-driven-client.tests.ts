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
    allNodesFrom,
    applyDelta,
    deltaDeserializer,
    DeltaHandler,
    IdMapping,
    INodeBase,
    nodeBaseDeserializer,
    serializeDelta
} from "@lionweb/class-core"
import { byIdMap } from "@lionweb/ts-utils"

import { createWebSocketClient, LowLevelClient } from "../web-socket/client.js"
import { createWebSocketServer, wsLocalhostUrl } from "../web-socket/server.js"

import { delayed } from "./async.js"
import { combine } from "../utils/procedure.js"
import { prefixedWith, timedConsoleLogger } from "../utils/textual-logging.js"
import { Payload } from "./payload.js"
import { Command } from "../payload/command-types.js"
import { Event } from "../payload/event-types.js"
import { commandAsEvent } from "../server/command-processor.js"
import { deltaAsCommand } from "../client/delta-to-command.js"
import { eventToDeltaTranslator } from "../client/event-to-delta.js"
import { Geometry, ShapesBase } from "../gen/Shapes.g.js"
import { nextPort } from "./port.js"
import { testModel } from "../models/test-models.js"


const languageBases = [ShapesBase.INSTANCE]
const testModelChunk = testModel


describe("WebSocket-driven client and server", async function() {

    it("client, managing a model, sending commands and receiving events", async function() {
        // begin Arrange
        const port = nextPort()
        const clientId = "A"

        // for test verbosity:
        const logger = timedConsoleLogger("µs")
        const serverLogger = prefixedWith(logger, "[server] ")
        const clientLogger = prefixedWith(logger, `[client ${clientId}] `)

        // for assertions:
        const commandsReceivedByServer: Payload[] = []
        const commandsSentByClient: Payload[] = []
        const eventsSentByServer: Payload[] = []
        const eventsReceivedByClient: Payload[] = []

        const receiveMessageOnServerInner = combine<Payload>(
            (message) => {
                commandsReceivedByServer.push(message)  // for assertions
            },
            (message) => {
                const event = { ...message }
                server.broadcastMessage(event)
                eventsSentByServer.push(event)  // for assertions
            }
        )
        const receiveMessageOnServer = (_: void, payload: Payload) =>
            receiveMessageOnServerInner(payload)

        const receiveMessageOnClient = combine<Payload>(
            (message) => {
                eventsReceivedByClient.push(message)  // for assertions
            },
            (message) => {
                if (commandsSentByClient.some((command) => command.commandID === message.commandID)) {
                    clientLogger(`received event originating from command with ID "${message.commandID}" that was sent by client itself: ignoring that`)
                } else {
                    clientLogger(`received event with command ID "${message.commandID}": deserializing as delta and applying`)
                    const delta = deserializedDelta(message.serializedDelta)
                    applyDelta(delta)
                }
            }
        )

        const [ server, client ] = await Promise.all([  // (do in parallel)
            createWebSocketServer<void, Payload, void, Payload>(port, (_) => undefined, receiveMessageOnServer, serverLogger),
            createWebSocketClient<Payload, Payload>(wsLocalhostUrl(port), clientId, receiveMessageOnClient, clientLogger)
        ])

        let loading = true
        let commandNumber = 0
        const commandSender: DeltaHandler = (delta) => {
            if (!loading) {
                const command: Payload = { commandID: `${clientId}-${commandNumber++}`, serializedDelta: serializeDelta(delta) }
                client.sendMessage(command)
                commandsSentByClient.push(command)  // for assertions
            }
        }

        const model = nodeBaseDeserializer(languageBases, commandSender)(testModelChunk)
        const idMapping = new IdMapping(byIdMap(model.flatMap(allNodesFrom)))
        const deserializedDelta = deltaDeserializer(languageBases, idMapping)
        loading = false
        // end Arrange

        // Action:
        ;(model[0] as Geometry).documentation!.text = "bye bye"

        const waitTime = 20
        await delayed(waitTime, null)    // wait for a bit so server can receive the command and send the resulting event

        const testPayload1: Payload = {
            commandID: "A-0",
            serializedDelta: {
                kind: "PropertyChanged",
                container: "documentation",
                property: { language: "key-Shapes", version: "1", key: "key-text" },
                oldValue: "hello there",
                newValue: "bye bye"
            }
        }
        const testPayload2: Payload = {
            commandID: "B-1",
            serializedDelta: {
                kind: "PropertyChanged",
                container: "documentation",
                property: { language: "key-Shapes", version: "1", key: "key-text" },
                oldValue: "bye bye",
                newValue: "see ya"
            }
        }
        // simulate a command -> event coming in from client B:
        await server.broadcastMessage(testPayload2)
        eventsSentByServer.push(testPayload2)

        await delayed(waitTime, null)    // wait for a bit so client can actually receive the event before it gets disconnected
        await client.disconnect()
        await server.shutdown()

        // Assert:
        expect(commandsSentByClient).to.deep.equal([testPayload1])
        expect(commandsReceivedByServer).to.deep.equal([testPayload1])
        expect(eventsSentByServer).to.deep.equal([testPayload1, testPayload2])
        expect(eventsReceivedByClient).to.deep.equal([testPayload1, testPayload2])

        expect((model[0] as Geometry).documentation!.text).to.equal("see ya")
    })

})



describe("WebSocket-driven client and server including translation, without validation", async function() {

    it("[with 2 clients] client A sends a command, server broadcasts event, clients receive it, client B updates its model accordingly", async function() {
        // begin Arrange

        // create server:
        const port = nextPort()
        const receiveMessageOnServer = (_: void, message: Command) => {
            lowLevelServer.broadcastMessage(commandAsEvent(message, "???"))
        }
        const lowLevelServer = await createWebSocketServer<void, Command, void, Event>(port, (_) => undefined, receiveMessageOnServer)

        // create clients:
        const createClient = async (clientId: string): Promise<[client: LowLevelClient<Command>, model: INodeBase[]]> => {
            let loading = true
            let commandNumber = 0
            const commandIds: string[] = []
            const commandSender: DeltaHandler = (delta) => {
                if (!loading) {
                    const commandId = `${clientId}-${commandNumber++}`
                    const command = deltaAsCommand(delta, commandId)
                    lowLevelClient.sendMessage(command)
                    commandIds.push(commandId)
                }
            }

            const model = nodeBaseDeserializer(languageBases, commandSender)(testModelChunk)
            const idMapping = new IdMapping(byIdMap(model.flatMap(allNodesFrom)))
            const eventAsDelta = eventToDeltaTranslator(languageBases, idMapping, nodeBaseDeserializer(languageBases, commandSender))
            loading = false

            const receiveMessageOnClient = (event: Event) => {
                if (event.originCommands.every(({ commandId }) => commandIds.indexOf(commandId) === -1)) {
                    const delta = eventAsDelta(event)
                    applyDelta(delta)
                }
            }

            const lowLevelClient = await createWebSocketClient<Event, Command>(wsLocalhostUrl(port), clientId, receiveMessageOnClient)

            return [lowLevelClient, model]
        }

        const [clientA, modelA] = await createClient("A")
        const [clientB, modelB] = await createClient("B")

        // end Arrange

        // Action:
        ;(modelA[0] as Geometry).documentation!.text = "bye bye"

        await delayed(20, null)
        await clientA.disconnect()
        await clientB.disconnect()
        await lowLevelServer.shutdown()

        // Assert:
        expect((modelB[0] as Geometry).documentation!.text).to.equal("bye bye")
    })

})

