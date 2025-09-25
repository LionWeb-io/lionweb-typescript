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
    DeltaReceiver,
    IdMapping,
    INodeBase,
    nodeBaseDeserializer,
    SerializedDelta,
    serializeDelta
} from "@lionweb/class-core"
import {
    Command,
    createWebSocketClient,
    createWebSocketServer,
    Event,
    eventToDeltaTranslator,
    wsLocalhostUrl
} from "@lionweb/delta-protocol-impl"
import { byIdMap } from "@lionweb/ts-utils"

import { LowLevelClient } from "@lionweb/delta-protocol-impl/dist/web-socket/client.js"
import { combine } from "@lionweb/delta-protocol-impl/dist/utils/procedure.js"
import {
    asLowLevelClientLogger,
    prefixedWith,
    timedConsoleLogger
} from "@lionweb/delta-protocol-impl/dist/utils/textual-logging.js"
import { commandAsEvent } from "@lionweb/delta-protocol-impl/dist/repository/command-to-event.js"
import { deltaAsCommand } from "@lionweb/delta-protocol-impl/dist/client/delta-to-command.js"
import { Geometry, ShapesBase } from "../gen/Shapes.g.js"
import { testModelChunk } from "../test-utils/test-model.js"
import { delayed } from "../test-utils/async.js"
import { nextPort } from "../test-utils/port.js"


const languageBases = [ShapesBase.INSTANCE]


/**
 * Type def. for a simple, symmetric payload.
 * (I.e., serves for both command and event.)
 */
export type Payload = {    // serves for both command and event
    commandID: string
    serializedDelta: SerializedDelta
}


describe("WebSocket-driven client and repository", async function() {

    it("client, managing a model, sending commands and receiving events", async function() {
        // begin Arrange
        const port = nextPort()
        const clientId = "A"

        // for test verbosity:
        const logger = timedConsoleLogger("µs")
        const repositoryLogger = prefixedWith(logger, "[repository] ")
        const clientLogger = prefixedWith(logger, `[client ${clientId}] `)

        // for assertions:
        const commandsReceivedByRepository: Payload[] = []
        const commandsSentByClient: Payload[] = []
        const eventsSentByRepository: Payload[] = []
        const eventsReceivedByClient: Payload[] = []

        const receiveMessageOnRepository = combine<Payload>(
            (message) => {
                commandsReceivedByRepository.push(message)  // for assertions
            },
            (message) => {
                const event = { ...message }
                lowLevelServer.broadcastMessage(event)
                eventsSentByRepository.push(event)  // for assertions
            }
        )
        const receiveMessageOnServer = (_: void, payload: Payload) =>
            receiveMessageOnRepository(payload)

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

        const [ lowLevelServer, lowLevelClient ] = await Promise.all([  // (do in parallel)
            createWebSocketServer<void, Payload, void, Payload>(port, (_) => undefined, receiveMessageOnServer, repositoryLogger),
            createWebSocketClient<Payload, Payload>({ url: wsLocalhostUrl(port), clientId, receiveMessageOnClient }, asLowLevelClientLogger(clientLogger))
        ])

        let loading = true
        let commandNumber = 0
        const commandSender: DeltaReceiver = (delta) => {
            if (!loading) {
                const command: Payload = { commandID: `${clientId}-${commandNumber++}`, serializedDelta: serializeDelta(delta) }
                lowLevelClient.sendMessage(command)
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
        await delayed(waitTime, null)    // wait for a bit so the repository can receive the command and send the resulting event

        const testPayload1: Payload = {
            commandID: "A-0",
            serializedDelta: {
                kind: "PropertyChanged",
                node: "documentation",
                property: { language: "key-Shapes", version: "1", key: "key-text" },
                oldValue: "hello there",
                newValue: "bye bye"
            }
        }
        const testPayload2: Payload = {
            commandID: "B-1",
            serializedDelta: {
                kind: "PropertyChanged",
                node: "documentation",
                property: { language: "key-Shapes", version: "1", key: "key-text" },
                oldValue: "bye bye",
                newValue: "see ya"
            }
        }
        // simulate a command -> event coming in from client B:
        await lowLevelServer.broadcastMessage(testPayload2)
        eventsSentByRepository.push(testPayload2)

        await delayed(waitTime, null)    // wait for a bit so client can actually receive the event before it gets disconnected
        await lowLevelClient.disconnect()
        await lowLevelServer.shutdown()

        // Assert:
        expect(commandsSentByClient).to.deep.equal([testPayload1])
        expect(commandsReceivedByRepository).to.deep.equal([testPayload1])
        expect(eventsSentByRepository).to.deep.equal([testPayload1, testPayload2])
        expect(eventsReceivedByClient).to.deep.equal([testPayload1, testPayload2])

        expect((model[0] as Geometry).documentation!.text).to.equal("see ya")
    })

})



describe("WebSocket-driven client and repository including translation, without validation", async function() {

    it("[with 2 clients] client A sends a command, repository broadcasts event, clients receive it, client B updates its model accordingly", async function() {
        // begin Arrange

        // create repository:
        const port = nextPort()
        const receiveMessageOnServer = (_: void, message: Command) => {
            lowLevelServer.broadcastMessage(commandAsEvent(message, "???"))
        }
        const lowLevelServer = createWebSocketServer<void, Command, void, Event>(port, (_) => undefined, receiveMessageOnServer)

        // create clients:
        const createClient = async (clientId: string): Promise<[client: LowLevelClient<Command>, model: INodeBase[]]> => {
            let loading = true
            let commandNumber = 0
            const commandIds: string[] = []
            const commandSender: DeltaReceiver = (delta) => {
                if (!loading) {
                    const commandId = `${clientId}-${commandNumber++}`
                    const command = deltaAsCommand(delta, commandId)
                    if (command !== undefined) {
                        lowLevelClient.sendMessage(command)
                        commandIds.push(commandId)
                    }
                }
            }

            const model = nodeBaseDeserializer(languageBases, commandSender)(testModelChunk)
            const idMapping = new IdMapping(byIdMap(model.flatMap(allNodesFrom)))
            const eventAsDelta = eventToDeltaTranslator(languageBases, nodeBaseDeserializer(languageBases, commandSender))
            loading = false

            const receiveMessageOnClient = (event: Event) => {
                if (event.originCommands.every(({ commandId }) => commandIds.indexOf(commandId) === -1)) {
                    const delta = eventAsDelta(event, idMapping)
                    if (delta !== undefined) {
                        applyDelta(delta)
                    }
                }
            }

            const lowLevelClient = await createWebSocketClient<Event, Command>({ url: wsLocalhostUrl(port), clientId, receiveMessageOnClient })

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

