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


import { LionWebClient } from "@lionweb/delta-protocol-client"
import {
    ansi,
    ClientDidNotApplyEventFromOwnCommand,
    ClientReceivedMessage,
    ClientSentMessage,
    DeltaOccurredOnClient,
    ISemanticLogItem,
    RepositoryReceivedMessage,
    semanticLogItemsToConsole,
    SignOnRequest,
    SignOnResponse
} from "@lionweb/delta-protocol-common"
import { LionWebRepository, wsLocalhostUrl } from "@lionweb/delta-protocol-repository-ws"
import { TestLanguageBase } from "@lionweb/class-core-test-language"
import { delayed } from "../test-utils/async.js"
import { nextPort } from "../test-utils/port.js"
import { createWSLowLevelClient } from "@lionweb/delta-protocol-low-level-client-ws"


describe(`scenarios (${ansi.colorSchemeExplanationString})`, async function() {

    /**
     * 1. Client signs on to repository with protocol version 2025.1 and client id `myClient`.
     * 2. Repository confirms participation with participation id `participation-a`.
     * 3. Client initiates new partition.
     * 4. Client sends Add partition command with `nodeA` payload (details omitted) and command id `cmd-1`.
     * 5. Repository registers command for processing.
     * 6. Repository acknowledges reception of command with id `cmd-1`.
     * 7. Repository updates internal representation.
     * 8. Repository creates event for update.
     * 9. Repository emits event “Partition added” with `nodeA` payload and sequence number 1.
     *  It includes one CommandSource with value (client-a, cmd-1)
     * 10. Client receives event.
     * (2nd half of step 10 and step 11 elided, and replaced with assertions.)
     */
    it("scenario 1: virgin repository, first time client connects", async function() {
        // begin Arrange

        const actualLogItems: ISemanticLogItem[] = []
        const log = (logItem: ISemanticLogItem) => {
            actualLogItems.push(logItem)
        }

        const testLanguageBase = TestLanguageBase.INSTANCE

        // create repository:
        const port = nextPort()
        const lionWebRepository = await LionWebRepository.create({ port, semanticLogger: log })

        // create client:
        const clientId = "myClient" // but participation ID is handed out by the repository!
        const repositoryId = "myRepo"
        const lionWebClient = await LionWebClient.create({
            clientId,
            url: wsLocalhostUrl(port),
            languageBases: [testLanguageBase],
            lowLevelClientInstantiator: createWSLowLevelClient,
            semanticLogger: log
        })

        // Action
        const queryId = "query-1"
        await lionWebClient.signOn(queryId, repositoryId)

        expect(lionWebClient.participationId!).to.equal("participation-a")

        const newPartition = lionWebClient.forest.createNode(testLanguageBase.TestPartition, "partition-A")
        lionWebClient.addPartition(newPartition)
        expect(lionWebClient.forest.partitions).to.deep.equal([newPartition])

        // assert idempotency of adding a new partition:
        lionWebClient.addPartition(newPartition)
        expect(lionWebClient.forest.partitions).to.deep.equal([newPartition])

        await delayed(20, null)
        await lionWebClient.disconnect()
        await lionWebRepository.shutdown()

        semanticLogItemsToConsole(actualLogItems)

        const serializationOfNewPartition = {
            serializationFormatVersion: "2023.1",
            languages: [
                { key: "TestLanguage", version: "0" },
                { key: "LionCore-builtins", version: "2023.1" }
            ],
            nodes: [{
                id: "partition-A",
                classifier: { language: "TestLanguage", version: "0", key: "TestPartition" },
                properties: [],
                containments: [],
                references: [],
                annotations: [],
                parent: null
            }]
        }
        const expectedLogItems = [
            new RepositoryReceivedMessage({}, { messageKind: "SignOnRequest", queryId, repositoryId, deltaProtocolVersion: "2025.1", clientId, additionalInfos: [] } as SignOnRequest),
            new ClientReceivedMessage(clientId, { messageKind: "SignOnResponse", queryId, participationId: "participation-a", additionalInfos: [] } as SignOnResponse),
            new DeltaOccurredOnClient(
                clientId,
                {
                    kind: "PartitionAdded",
                    newPartition: "partition-A",
                    newNodes: serializationOfNewPartition
                }
            ),
            new ClientSentMessage(
                clientId,
                {
                    messageKind: "AddPartition",
                    commandId: "cmd-1",
                    newPartition: serializationOfNewPartition,
                    additionalInfos: []
                }
            ),
            new RepositoryReceivedMessage(
                { participationId: "participation-a", clientId: "myClient" },
                {
                    messageKind: "AddPartition",
                    commandId: "cmd-1",
                    newPartition: serializationOfNewPartition,
                    additionalInfos: []
                }
            ),
            new ClientReceivedMessage(
                clientId,
                {
                    messageKind: "PartitionAdded",
                    newPartition: serializationOfNewPartition,
                    originCommands: [{ participationId: "participation-a", commandId: "cmd-1" }],
                    sequenceNumber: 0,
                    additionalInfos: []
                }
            ),
            new ClientDidNotApplyEventFromOwnCommand(clientId, "cmd-1")
        ]

        // (poor man's deep equal...:)
        actualLogItems.forEach((actualLogItem, index) => {
            expect(actualLogItem.asText()).to.equal(expectedLogItems[index].asText(), `@index ${index}`)
        })

        expect(actualLogItems.length).to.equal(expectedLogItems.length, `number of log items`)
    })

})

