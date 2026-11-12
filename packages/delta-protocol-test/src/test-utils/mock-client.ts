// Copyright 2026 TRUMPF Laser SE and other contributors
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
// SPDX-FileCopyrightText: 2026 TRUMPF Laser SE and other contributors
// SPDX-License-Identifier: Apache-2.0

import { IDelta } from "@lionweb/class-core"
import { LionWebClient, LionWebDeltaProtocolLowLevelClientInstantiator } from "@lionweb/delta-protocol-client"
import { Command, Event, QueryMessage, SemanticLogger } from "@lionweb/delta-protocol-common"
import { defaultTestClientParameters } from "./client-parameters.js"


/**
 * A type def. for a test fixture, consisting of a mock {@link LionWebClient LionWeb client},
 * a `receiveMessageOnClient` that can be used to mock a repository sending messages,
 * and the deltas generated from the client’s {@link Forest forest}.
 */
export type MockLionWebClientTestFixture = {
    lionWebClient: LionWebClient,
    receiveMessageOnClient: (message: (Event | QueryMessage)) => void,
    deltasSent: IDelta[]
}

/**
 * @return a {@link MockLionWebClientTestFixture}, with the optionally-passed {@link SemanticLogger} used for semantic logging.
 */
export const mockLionWebClientTestFixture = async (semanticLogger?: SemanticLogger): Promise<MockLionWebClientTestFixture> => {
    let receiveMessageOnClientIntercepted: (message: Event | QueryMessage) => void
    const lowLevelClientInstantiator: LionWebDeltaProtocolLowLevelClientInstantiator = ({ receiveMessageOnClient }) => {
        receiveMessageOnClientIntercepted = receiveMessageOnClient
        return Promise.resolve({
            sendMessage: (_: Command | QueryMessage) => Promise.resolve(),
            disconnect: () => Promise.resolve()
        })
    }
    const deltasSent: IDelta[] = []
    const lionWebClient = await LionWebClient.create({
        ...defaultTestClientParameters,
        lowLevelClientInstantiator,
        instantiateDeltaReceiverForwardingTo: (commandSender) =>
            (delta) => {
                deltasSent.push(delta)
                commandSender(delta)
            },
        semanticLogger
    })
    // @ts-expect-error avoid “Variable receiveMessageOnClientIntercepted is used before being assigned”: this will work because of async, and otherwise we throw anyway.
    if (receiveMessageOnClientIntercepted === undefined) {
        throw new Error(`didn’t intercept receiveMessageOnClient in client`)
    }
    return {
        lionWebClient,
        receiveMessageOnClient: receiveMessageOnClientIntercepted!,
        deltasSent
    }
}

