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

import { LowLevelClientInstantiator } from "../web-socket/client.js"
import { Command } from "../payload/command-types.js"
import { QueryMessage } from "../payload/query-types.js"
import { Event } from "../payload/event-types.js"
import { LionWebId } from "@lionweb/json"

/**
 * @return a {@link LowLevelClientInstantiator} instance that can be passed to {@link LionWebClient}`.create(...)`,
 * so that the latter can instantiate a suitable {@link LowLevelClient} mock instance without the need for an actual WebSocket connection.
 * @param commandResponsesById the {@link Event} responses for commands issued by client, indexed by their command ID.
 * @param queryResponsesById the {@link QueryMessage} responses for queries issued by the client, indexed by their query ID.
 */
export const mockLowLevelClientInstantiator = (
    commandResponsesById: { [commandId: string]: Event },
    queryResponsesById: { [queryId: string]: QueryMessage }
): LowLevelClientInstantiator<Event | QueryMessage, Command | QueryMessage> => {
    return (
        _url: string,
        _clientId: LionWebId,
        receiveMessageOnClient: (message: Event | QueryMessage) => void
    ) => {
        let connected = true
        return Promise.resolve({
            sendMessage: (message: Command | QueryMessage) => {
                if (!connected) {
                    return Promise.reject(new Error(`low-level client not connected to server`))
                }
                if ("queryId" in message) {
                    const { queryId } = message as QueryMessage
                    if (queryId in queryResponsesById) {
                        receiveMessageOnClient(queryResponsesById[queryId])
                        return Promise.resolve()
                    }
                    return Promise.reject(new Error(`mock low-level client doesn't have a response configured for query with ID="${queryId}"`))
                }
                const { commandId } = message as Command
                if (commandId in commandResponsesById) {
                    receiveMessageOnClient(commandResponsesById[commandId])
                    return Promise.resolve()
                }
                return Promise.reject(new Error(`mock low-level client doesn't have a response configured for command with ID="${commandId}"`))
            },
            disconnect: () => {
                connected = false
                return Promise.resolve()
            }
        })
    }
}

