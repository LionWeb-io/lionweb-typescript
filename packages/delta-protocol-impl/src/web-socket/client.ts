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
import { TextualLogger, textualLoggerFunctionFrom } from "../utils/textual-logging.js"


/**
 * Type def. for a client that's able to send messages.
 */
export type LowLevelClient<TMessageToServer> = {
    sendMessage: (message: TMessageToServer) => Promise<void>
    disconnect: () => Promise<void>
}

/**
 * Type def. for parameters *required* for instantiating a {@link LowLevelClient low-level client}.
 */
export type LowLevelClientParameters<TMessageForClient> = {
    /** The URL of the WebSocket server to connect to. */
    url: string
    /** An ID for the created client. */
    clientId: LionWebId
    /** A function that's called with a received message. */
    receiveMessageOnClient: (message: TMessageForClient) => void
    /** An optional {@link TextualLogger textual logger}. */
}

/**
 * Type def. for optional parameters for a {@link LowLevelClient low-level client} regarding logging.
 */
export type LowLevelClientLoggingParameters<TMessageForClient, TMessageToServer> = {
    /** An optional {@link TextualLogger textual logger}. */
    textualLogger?: TextualLogger
    /** An optional message logger. */
    messageLogger?: (message: (TMessageForClient | TMessageToServer)) => void
}

/**
 * Type def. for functions that instantiate a {@link LowLevelClient}.
 *
 * Note that the instantiator implementation is responsible for passing logging parameters.
 */
export type LowLevelClientInstantiator<TMessageForClient, TMessageToServer> =
    (lowLevelClientParameters: LowLevelClientParameters<TMessageForClient>) =>
        Promise<LowLevelClient<TMessageToServer>>

type ClientState = "connecting" | "connected" | "disconnected"

/**
 * @return a WebSocket-driven implementation of a {@link LowLevelClient low-level client},
 *  as a {@link Promise} that resolves as soon the client was able to connect to the WebSocket server.
 * @param lowLevelClientParameters Parameters required to create/instantiate the low-level client.
 * @param optionalLoggingParameters Optional parameters regarding logging.
 */
export const createWebSocketClient = async <TMessageForClient, TMessageToServer>(
    { url, clientId, receiveMessageOnClient }: LowLevelClientParameters<TMessageForClient>,
    optionalLoggingParameters?: LowLevelClientLoggingParameters<TMessageForClient, TMessageToServer>
): Promise<LowLevelClient<TMessageToServer>> => {
    const webSocket = new WebSocket(url)
    const logText = textualLoggerFunctionFrom(optionalLoggingParameters?.textualLogger)
    logText(`client ${clientId} started`)
    let state: ClientState = "connecting"
    const logMessage = optionalLoggingParameters?.messageLogger ?? ((_message: (TMessageForClient | TMessageToServer)) => {})
    return new Promise((resolveClientStart, rejectClientStart) => {
        const lowLevelWebSocketClient: LowLevelClient<TMessageToServer> = {
            sendMessage: (message) => {
                if (state === "connected") {
                    logMessage(message)
                    const messageText = asMinimalJsonString(message)
                    logText(`sending message to server: ${messageText}`)
                    return wrappedAsPromise((callback) => {
                        webSocket.send(messageText, callback)
                    })
                } else {
                    logText(`state=${state}`)
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
                logText(`connected to server`)
                resolveClientStart(lowLevelWebSocketClient)
            })
            .on("message", (messageText: string) => {
                logText(`received message from server: ${messageText}`)
                const message = tryParseJson(messageText, logText) as TMessageForClient
                logMessage(message)
                receiveMessageOnClient(message)
            })
            .on("error", (error) => {
                logText(`error occurred: ${error}`, true)
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
                logText(`disconnected from server`)
            })
    })
}

const firstRealError = (error: Error): Error =>
    error instanceof AggregateError ? firstRealError(error.errors[0]) : error

const isConnectionRefusedError = (error: Error) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (error as any).code === "ECONNREFUSED"

