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

import { expect } from "chai"

import { LionWebId } from "@lionweb/json"
import { LionWebClient } from "@lionweb/delta-protocol-impl/dist/client/client-impl.js"
import { LionWebRepository } from "@lionweb/delta-protocol-impl/dist/repository/repository-impl.js"
import { wsLocalhostUrl } from "@lionweb/delta-protocol-impl/dist/web-socket/server.js"
import { Geometry, ShapesBase } from "../gen/Shapes.g.js"
import { delayed } from "../test-utils/async.js"
import { nextPort } from "../test-utils/port.js"
import { testModelChunk } from "../test-utils/test-model.js"


describe("WebSocket-driven implementations of client and repository", async function() {

    it("[with 2 clients] client A sends a command, repository broadcasts event, clients receive it, client B updates its model accordingly", async function() {
        // begin Arrange
        const port = nextPort()
        const lionWebRepository = await LionWebRepository.create({ port })

        const languageBases = [ShapesBase.INSTANCE]

        const createClient = (clientId: LionWebId) =>
            LionWebClient.create({ clientId, url: wsLocalhostUrl(port), languageBases, serializationChunk: testModelChunk })
        const clientA = await createClient("A")
        const clientB = await createClient("B")
        // end Arrange

        await clientA.signOn("query-A")
        await clientB.signOn("query-B")

        // Action:
        ;(clientA.model[0] as Geometry).documentation!.text = "bye bye"

        await delayed(20, null)
        await clientA.disconnect()
        await clientB.disconnect()
        await lionWebRepository.shutdown()

        // Assert:
        expect((clientB.model[0] as Geometry).documentation!.text).to.equal("bye bye")
    })

})

