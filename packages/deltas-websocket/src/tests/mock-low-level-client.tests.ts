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

import { expectError } from "./async.js"

import { mockLowLevelClientInstantiator } from "./mock-low-level-client.js"
import { SignOnRequest } from "../payload/query-types.js"


describe("mock low-level client", async function() {

    it("refuses to send messages after disconnect", async function() {
        const mockLowLevelClient = await mockLowLevelClientInstantiator({}, {})("", "", (_) => undefined)
        await mockLowLevelClient.disconnect()
        return expectError(
            () => mockLowLevelClient.sendMessage({
                    messageKind: "SignOnRequest",
                    deltaProtocolVersion: "2025.1",
                    clientId: "A",
                    queryId: "query-1",
                    protocolMessages: []
                } as SignOnRequest),
            `low-level client not connected to server`)
    })

})

