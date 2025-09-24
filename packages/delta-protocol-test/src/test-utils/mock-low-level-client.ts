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
    Command,
    Event,
    LowLevelClientInstantiator,
    LowLevelClientParameters,
    QueryMessage
} from "@lionweb/delta-protocol-impl"
import { LowLevelClientLogger, noOpLogger } from "@lionweb/delta-protocol-impl/dist/web-socket/client-log-types.js"

/**
 * @return a {@link LowLevelClientInstantiator} instance that can be passed to {@link LionWebClient}`.createNode(...)`,
 * so that the latter can instantiate a suitable {@link LowLevelClient} mock instance without the need for an actual WebSocket connection.
 * @param commandResponsesById the {@link Event} responses for commands issued by client, indexed by their command ID.
 * @param queryResponsesById the {@link QueryMessage} responses for queries issued by the client, indexed by their query ID.
 * @param optionalClientLogger (optional:) {@link LowLevelClientLogger low-level client logger implementation}.
 */
export const mockLowLevelClientInstantiator = (
    commandResponsesById: { [commandId: string]: Event },
    queryResponsesById: { [queryId: string]: QueryMessage },
    optionalClientLogger?: LowLevelClientLogger<Event | QueryMessage, Command | QueryMessage>
): LowLevelClientInstantiator<Event | QueryMessage, Command | QueryMessage> => {
    return ({ receiveMessageOnClient }: LowLevelClientParameters<(Event | QueryMessage)>) => {
        const log = optionalClientLogger ?? noOpLogger
        let connected = true
        return Promise.resolve({
            sendMessage: (message: Command | QueryMessage) => {
                if (!connected) {
                    return Promise.reject(new Error(`low-level client not connected to repository`))
                }
                log({ sentToServer: message })
                if ("queryId" in message) {
                    const { queryId } = message
                    if (queryId in queryResponsesById) {
                        receiveMessageOnClient(queryResponsesById[queryId])
                        return Promise.resolve()
                    }
                    const textMessageToLog = `mock low-level client doesn't have a response configured for query with ID="${queryId}"`
                    log({ message: textMessageToLog, error: true })
                    return Promise.reject(new Error(textMessageToLog))
                }
                const { commandId } = message
                if (commandId in commandResponsesById) {
                    const responseMessage = commandResponsesById[commandId]
                    receiveMessageOnClient(responseMessage)
                    log({ receivedOnClient: responseMessage })
                    return Promise.resolve()
                }
                const textMessageToLog = `mock low-level client doesn't have a response configured for command with ID="${commandId}"`
                log({ message: textMessageToLog, error: true })
                return Promise.reject(new Error(textMessageToLog))
            },
            disconnect: () => {
                connected = false
                log({ message: `client disconnected from repository` })
                return Promise.resolve()
            }
        })
    }
}

