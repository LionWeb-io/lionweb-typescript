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
import { Command, Event, QueryMessage } from "@lionweb/delta-protocol-impl"
import { LowLevelClientInstantiator } from "@lionweb/delta-protocol-impl/dist/web-socket/client.js"
import { clientInfo, repositoryWarning } from "@lionweb/delta-protocol-impl/dist/utils/ansi.js"
import { TextualLogger, textualLoggerFunctionFrom } from "@lionweb/delta-protocol-impl/dist/utils/textual-logging.js"

/**
 * @return a {@link LowLevelClientInstantiator} instance that can be passed to {@link LionWebClient}`.create(...)`,
 * so that the latter can instantiate a suitable {@link LowLevelClient} mock instance without the need for an actual WebSocket connection.
 * @param commandResponsesById the {@link Event} responses for commands issued by client, indexed by their command ID.
 * @param queryResponsesById the {@link QueryMessage} responses for queries issued by the client, indexed by their query ID.
 */
export const mockLowLevelClientInstantiator = (
    commandResponsesById: { [commandId: string]: Event },
    queryResponsesById: { [queryId: string]: QueryMessage },
    optionalTextualLogger?: TextualLogger
): LowLevelClientInstantiator<Event | QueryMessage, Command | QueryMessage> => {
    const log = textualLoggerFunctionFrom(optionalTextualLogger)
    return (
        _url: string,
        _clientId: LionWebId,
        receiveMessageOnClient: (message: Event | QueryMessage) => void
    ) => {
        let connected = true
        return Promise.resolve({
            sendMessage: (message: Command | QueryMessage) => {
                if (!connected) {
                    return Promise.reject(new Error(`low-level client not connected to repository`))
                }
                if ("queryId" in message) {
                    const { queryId } = message as QueryMessage
                    if (queryId in queryResponsesById) {
                        receiveMessageOnClient(queryResponsesById[queryId])
                        return Promise.resolve()
                    }
                    const logMessage = `mock low-level client doesn't have a response configured for query with ID="${queryId}"`
                    log(`${repositoryWarning(logMessage)}: ${JSON.stringify(message)}`)
                    return Promise.reject(new Error(logMessage))
                }
                const { commandId } = message as Command
                if (commandId in commandResponsesById) {
                    receiveMessageOnClient(commandResponsesById[commandId])
                    return Promise.resolve()
                }
                const logMessage = `mock low-level client doesn't have a response configured for command with ID="${commandId}"`
                log(`${repositoryWarning(logMessage)}: ${JSON.stringify(message)}`)
                return Promise.reject(new Error(logMessage))
            },
            disconnect: () => {
                connected = false
                log(`${clientInfo(`client disconnected from repository`)}`)
                return Promise.resolve()
            }
        })
    }
}

