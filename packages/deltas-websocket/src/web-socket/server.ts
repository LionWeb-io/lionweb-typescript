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

import { IncomingMessage } from "http"
import { WebSocketServer } from "ws"

import { wrappedAsPromise } from "../utils/async.js"
import { tryParseJson } from "../utils/json.js"
import { setMap } from "../utils/set.js"
import { TextualLogger, textualLoggerFunctionFrom } from "../utils/textual-logging.js"


/**
 * Type definition for a server that's able to broadcast messages.
 */
export type LowLevelServer<TBroadcastMessage> = {
    broadcastMessage: (message: TBroadcastMessage) => Promise<void> // TODO  in general, we want to modify the message _per client_!
    shutdown: () => Promise<void>
}

/**
 * @return a WebSocket-driven {@link server}.
 * @param port The port for clients to connect.
 * @param clientMetadataFrom A function that computes metadata for a (just-)connected client from the associated {@link IncomingMessage request object}.
 * @param receiveMessage A function that's called with the client's metadata and a received message.
 * @param optionalTextualLogger An optional {@link TextualLogger textual logger}.
 */
export const createWebSocketServer = <TClientMetadata, TMessageForServer, TResponse, TBroadcastMessage>(
    port: number,
    clientMetadataFrom: (request: IncomingMessage) => TClientMetadata,
    receiveMessage: (clientMetadata: TClientMetadata, message: TMessageForServer) => TResponse,
    optionalTextualLogger?: TextualLogger
): LowLevelServer<TBroadcastMessage> => {
    const webSocketServer = new WebSocketServer({ port })
    const log = textualLoggerFunctionFrom(optionalTextualLogger)
    log("WebSocketServer started")
    webSocketServer.on("connection", (webSocket, request) => {
        log(`a client connected`)
        const clientMetadata = clientMetadataFrom(request)
        webSocket.on("message", (messageText: string) => {
            log(`received a message from client: ${messageText}`)
            const response = receiveMessage(clientMetadata, tryParseJson(messageText, log) as TMessageForServer)
            if (response !== undefined) {
                const responseText = JSON.stringify(response)
                // send back to this client (only):
                webSocket.send(responseText)    // TODO  handle error
            }
        })
    })
    return {
        // TODO  rethink broadcasting: need to make a different message _per client_, based on its metadata (which then should include nextSequenceNumber)
        broadcastMessage: async (message: TBroadcastMessage) => {
            const messageText = JSON.stringify(message)
            log(`broadcasting message to all clients: ${messageText}`)
            await Promise.all(setMap(webSocketServer.clients, (client) =>
                wrappedAsPromise((callback) => {
                    client.send(messageText, callback)
                })
            ))
        },
        shutdown: () => {
            log(`shutting down server`)
            return wrappedAsPromise((callback) => {
                webSocketServer.clients.forEach((webSocket) => {
                    webSocket.close()
                    process.nextTick(() => {
                        const state = webSocket.readyState
                        if (state === webSocket.OPEN || state === webSocket.CLOSING) {
                            webSocket.terminate()
                        }
                    })
                })
                webSocketServer.close(callback)
            })
        }
    }
}


/**
 * @return the URL for a WebSocket server hosted on `localhost` on the given `port`.
 */
export const wsLocalhostUrl = (port: number) => `ws://localhost:${port}`

