#!/usr/bin/env node

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

import { argv, exit } from "process"
import { Concept } from "@lionweb/core"
import {
    Command,
    createWebSocketClient,
    Event,
    LionWebClient,
    QueryMessage,
    wsLocalhostUrl
} from "@lionweb/delta-protocol-impl"
import { writeJsonAsFile } from "@lionweb/utilities"
import { runAsApp, tryParseInteger } from "./common.js"
import { recognizedTasks, taskExecutor } from "./tasks.js"
import { clientInfo, genericError } from "@lionweb/delta-protocol-impl/dist/utils/ansi.js"
import { combine } from "@lionweb/delta-protocol-impl/dist/utils/procedure.js"
import { TestLanguageBase } from "./gen/TestLanguage.g.js"
import { semanticConsoleLogger, semanticLogItemStorer } from "@lionweb/delta-protocol-impl/dist/semantic-logging.js"
import { LowLevelClientLogItem } from "@lionweb/delta-protocol-impl/dist/web-socket/client-log-types.js"

const testLanguageBase = TestLanguageBase.INSTANCE
const languageBases = [testLanguageBase]

const boldRedIf = (apply: boolean, text: string) =>
    apply ? genericError(text) : text

const partitionConcepts: Record<string, Concept> = Object.fromEntries(
    [testLanguageBase.DataTypeTestConcept, testLanguageBase.LinkTestConcept]
        .map((concept) => [concept.name, concept])
)

// $ node dist/cli-client.js <port> <clientID> <partitionConcept> [tasks] [--${protocolLogOptionPrefix}=<path>]

const protocolLogOptionPrefix = "--protocol-log="
const protocolLogPathIndex = argv.findIndex((argument) => argument.startsWith(protocolLogOptionPrefix))
// arguments without "node" (index=0), "dist/cli-client.js" (index=1), and `${protocolLogOptionPrefix}=<path>` (optional)
const trueArguments = argv.filter((_, index) => !(index === 0 || index === 1 || index === protocolLogPathIndex))

if (trueArguments.length < 3) {
    console.log(
`A Node.js-based app that implements a LionWeb delta protocol client.

Parameters (${genericError("bold red")} are missing):
  - ${boldRedIf(trueArguments.length < 1, `<port>: the port of the WebSocket where the LionWeb delta protocol repository is running on localhost`)}
  - ${boldRedIf(trueArguments.length < 2, `<clientID>: the ID that the client identifies itself with at the repository`)}
  - ${boldRedIf(trueArguments.length < 3, `<partitionConcept>: the name of a partition concept that gets instantiated as the model's primary partition — one of: ${Object.keys(partitionConcepts).join(", ")}`)}
  - ${boldRedIf(trueArguments.length < 4, `[tasks]: a comma-separated list of tasks — one of ${Object.keys(recognizedTasks).sort().join(", ")}`)}
  - ${boldRedIf(protocolLogPathIndex === -1, `${protocolLogOptionPrefix}=<path>: option to configure that the client logs all messages exchanged with the repository to a file with the given path`)}

    ASSUMPTION: the initial (states of the models) on client(s) and repository are identical!
`)
    exit(2)
}

const port = tryParseInteger(argv[2])
const clientId = argv[3]
const partitionConcept = argv[4]
if (!(partitionConcept in partitionConcepts)) {
    console.error(genericError(`unknown partition concept specified: ${partitionConcept} — must be one of: ${Object.keys(partitionConcepts).join(", ")}`))
    exit(2)
}
const tasks = argv[5]?.split(",") ?? []
console.log(clientInfo(`tasks provided: ${tasks.length === 0 ? "none" : tasks.join(", ")}`))
const infoUnrecognizedTasks = tasks
    .map((task, index) => task in recognizedTasks ? undefined : [task, index] as [string, number])
    .filter((taskInfoOrUndefined) => taskInfoOrUndefined !== undefined)
if (infoUnrecognizedTasks.length > 0) {
    console.error(genericError(`unrecognized tasks encountered:`))
    infoUnrecognizedTasks.forEach(([task, index]) => {
            console.error(genericError(`\t${task} (#${index + 1})`))
        })
    exit(2)
}

await runAsApp(async () => {
    const url = wsLocalhostUrl(port)

    const [storingLogger, semanticLogItems] = semanticLogItemStorer()
    const logItems: LowLevelClientLogItem<unknown, unknown>[] = []

    const lionWebClient = await LionWebClient.create({
        clientId,
        url,
        languageBases,
        semanticLogger: combine(semanticConsoleLogger, storingLogger),
        lowLevelClientInstantiator: async (lowLevelClientParameters) =>
            await createWebSocketClient<(Event | QueryMessage), (Command | QueryMessage)>(
                lowLevelClientParameters,
                (logItem) => {
                    logItems.push(logItem)
                }
            )
    })

    console.log(clientInfo(`LionWeb delta protocol client (with ID=${clientId}) connecting to repository on ${url} - press Ctrl+C to terminate`))

    const partition = lionWebClient.createNode(partitionConcepts[partitionConcept], "a")
    lionWebClient.setModel([partition])

    const executeTask = taskExecutor(lionWebClient, partition, semanticLogItems)

    let querySequenceNumber = 0
    const queryId = () => `query-${++querySequenceNumber}`

    for (const task of tasks) {
        await executeTask(task, queryId())
    }

    if (protocolLogPathIndex > -1) {
        writeJsonAsFile(argv[protocolLogPathIndex].substring(protocolLogOptionPrefix.length), logItems)
    }

    return () => {
        return lionWebClient.disconnect()
    }
})

