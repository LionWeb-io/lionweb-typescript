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

import { LionWebId } from "@lionweb/json"
import { asMinimalJsonString } from "@lionweb/ts-utils"
import { WebSocket } from "ws"

import { wrappedAsPromise } from "../utils/async.js"
import { tryParseJson } from "../utils/json.js"
import { Procedure } from "../utils/procedure.js"
import { TextualLogger, textualLoggerFunctionFrom } from "../utils/textual-logging.js"


/**
 * Type def. for a client that's able to send messages.
 */
export type LowLevelClient<TMessageToServer> = {
    sendMessage: (message: TMessageToServer) => Promise<void>
    disconnect: () => Promise<void>
}

export type LowLevelClientInstantiator<TMessageForClient, TMessageToServer> = (
    url: string,
    clientId: LionWebId,
    receiveMessageOnClient: (message: TMessageForClient) => void
) => Promise<LowLevelClient<TMessageToServer>>

type ClientState = "connecting" | "connected" | "disconnected"

/**
 * @return a WebSocket-driven implementation of a {@link LowLevelClient low-level client},
 *  as a {@link Promise} that resolves as soon the client was able to connect to the WebSocket server.
 * @param url The URL of the WebSocket server to connect to.
 * @param clientId An ID for the created client.
 * @param receiveMessage A function that's called with a received message.
 * @param optionalTextualLogger An optional {@link TextualLogger textual logger}.
 */
export const createWebSocketClient = async <TMessageForClient, TMessageToServer>(
    url: string,
    clientId: string,
    receiveMessage: Procedure<TMessageForClient>,
    optionalTextualLogger?: TextualLogger
): Promise<LowLevelClient<TMessageToServer>> => {
    const webSocket = new WebSocket(url)
    const log = textualLoggerFunctionFrom(optionalTextualLogger)
    log(`client ${clientId} started`)
    let state: ClientState = "connecting"
    return new Promise((resolveClientStart, rejectClientStart) => {
        const lowLevelWebSocketClient: LowLevelClient<TMessageToServer> = {
            sendMessage: (message) => {
                if (state === "connected") {
                    const messageText = asMinimalJsonString(message)
                    log(`sending message to server: ${messageText}`)
                    return wrappedAsPromise((callback) => {
                        webSocket.send(messageText, callback)
                    })
                } else {
                    log(`state=${state}`)
                    return Promise.reject(new Error(`can't send message to server when client's state=${state}`))
                }
            },
            disconnect: () => new Promise((resolveDisconnect, rejectDisconnect) => {
                if (state === "connected") {
                    webSocket.close()
                    state = "disconnected"
                    resolveDisconnect()
                }
                rejectDisconnect(new Error(state))
            })
        }
        webSocket
            .on("open", () => {
                state = "connected"
                log(`connected to server`)
                resolveClientStart(lowLevelWebSocketClient)
            })
            .on("message", (messageText: string) => {
                log(`received message from server: ${messageText}`)
                receiveMessage(tryParseJson(messageText, log) as TMessageForClient)
            })
            .on("error", (error) => {
                log(`error occurred: ${error}`, true)
                if (isConnectionRefusedError(firstRealError(error))) {
                    if (state === "connecting") {
                        rejectClientStart(new Error(`could not connect to WebSocket server at ${url}`))
                    } else {
                        // ignore
                        // TODO  is that OK?
                    }
                }
            })
            .on("close", () => {
                state = "disconnected"
                log(`disconnected from server`)
            })
    })
}

const firstRealError = (error: Error): Error =>
    error instanceof AggregateError ? firstRealError(error.errors[0]) : error

const isConnectionRefusedError = (error: Error) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (error as any).code === "ECONNREFUSED"

