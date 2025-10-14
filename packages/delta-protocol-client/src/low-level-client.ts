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
import { TextualLogger } from "@lionweb/delta-protocol-common"


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

