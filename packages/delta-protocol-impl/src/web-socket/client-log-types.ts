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

export type MessageReceivedOnClient<TMessageForClient> = {
    receivedOnClient: TMessageForClient
}

export type MessageSentToServer<TMessageForServer> = {
    sentToServer: TMessageForServer
}

export type TextualLogItem = {
    message: string
    error?: boolean
}

/**
 * Type def. for activity logged by a low-level client.
 */
export type LowLevelClientLogItem<TMessageForClient, TMessageForServer> =
    | TextualLogItem
    | MessageReceivedOnClient<TMessageForClient>
    | MessageSentToServer<TMessageForServer>


export type LowLevelClientLogger<TMessageForClient, TMessageForServer> =
    (logItem: LowLevelClientLogItem<TMessageForClient, TMessageForServer>) => void


/**
 * Implementation of {@link LowLevelClientLogger} that does nothing.
 */
export const noOpLogger: LowLevelClientLogger<unknown, unknown> = (_logItem) => {}

