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

import {
    LowLevelClient,
    LowLevelClientLogger,
    LowLevelClientParameters,
    noOpLowLevelClientLogger
} from "@lionweb/delta-protocol-client"
import { tryParseJson, wrappedAsPromise } from "@lionweb/delta-protocol-common"
import { asMinimalJsonString } from "@lionweb/ts-utils"
import { WebSocket } from "ws"


type ClientState = "connecting" | "connected" | "disconnected"

/**
 * @return a WebSocket-driven implementation of a {@link LowLevelClient low-level client},
 *  based on the `ws` package,
 *  as a {@link Promise} that resolves as soon the client was able to connect to the WebSocket server.
 * @param lowLevelClientParameters Parameters required to create/instantiate the low-level client.
 * @param optionalLoggingParameters Optional parameters regarding logging.
 */
export const createWSLowLevelClient = async <TMessageForClient, TMessageToServer>(
    { url, clientId, receiveMessageOnClient }: LowLevelClientParameters<TMessageForClient>,
    optionalLogger?: LowLevelClientLogger<TMessageForClient, TMessageToServer>
): Promise<LowLevelClient<TMessageToServer>> => {
    const webSocket = new WebSocket(url)
    const log = optionalLogger ?? noOpLowLevelClientLogger
    log({ message: `client ${clientId} started` })
    let state: ClientState = "connecting"
    return new Promise((resolveClientStart, rejectClientStart) => {
        const lowLevelWebSocketClient: LowLevelClient<TMessageToServer> = {
            sendMessage: (message) => {
                if (state === "connected") {
                    log({ sentToServer: message })
                    return wrappedAsPromise((callback) => {
                        webSocket.send(asMinimalJsonString(message), callback)
                    })
                } else {
                    const messageText = `can't send message to server when client's state=${state}`
                    log({ message: messageText })
                    return Promise.reject(new Error(messageText))
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
                log({ message: `connected to server` })
                resolveClientStart(lowLevelWebSocketClient)
            })
            .on("message", (messageText: string) => {
                const message = tryParseJson(messageText, (message) => log({ message })) as TMessageForClient
                log({ receivedOnClient: message })
                receiveMessageOnClient(message)
            })
            .on("error", (error) => {
                log({ message: `error occurred: ${error}`, error: true })
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
                log({ message: `disconnected from server` })
            })
    })
}

const firstRealError = (error: Error): Error =>
    error instanceof AggregateError ? firstRealError(error.errors[0]) : error

const isConnectionRefusedError = (error: Error) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (error as any).code === "ECONNREFUSED"

