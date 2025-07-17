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

import { WebSocket } from "ws"

import { delayed, wrappedAsPromise } from "../utils/async.js"
import { tryParseJson } from "../utils/json.js"
import { TextualLogger, textualLoggerFunctionFrom } from "../utils/textual-logging.js"


/**
 * Type def. for a client that's able to send messages.
 */
export type LowLevelClient<TMessageToServer> = {
    sendMessage: (message: TMessageToServer) => Promise<void>
    disconnect: () => Promise<void>
}

/**
 * @return a WebSocket-driven implementation of a {@link LowLevelClient low-level client}.
 * @param url The URL of the server to connect to.
 * @param clientId An ID for the created client.
 * @param receiveMessage A function that's called with a received message.
 * @param optionalTextualLogger An optional {@link TextualLogger textual logger}.
 */
export const createWebSocketClient = async <TMessageForClient, TMessageToServer>(
    url: string,
    clientId: string,
    receiveMessage: (message: TMessageForClient) => void,
    optionalTextualLogger?: TextualLogger
): Promise<LowLevelClient<TMessageToServer>> => {
    const webSocket = new WebSocket(url)
    const log = textualLoggerFunctionFrom(optionalTextualLogger)
    log(`client ${clientId} started`)
    webSocket
        .on("open", () => {
            log(`connected to server`)
        })
        .on("message", (messageText: string) => {
            log(`received message from server: ${messageText}`)
            receiveMessage(tryParseJson(messageText, log) as TMessageForClient)
        })
        .on("error", (error) => {
            log(`error occurred: ${error}`, true)
        })
        .on("close", () => {
            log(`disconnected from server`)
        })
    return delayed(10, {
        sendMessage: (message) => {
            const messageText = JSON.stringify(message)
            log(`sending message to server: ${messageText}`)
            return wrappedAsPromise((callback) => {
                webSocket.send(messageText, callback)
            })
        },
        disconnect: () =>
            new Promise<void>((resolve) => {
                webSocket.close()
                resolve()
            })
    })
}

