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
import { LionWebClient, wsLocalhostUrl } from "@lionweb/delta-protocol-impl"
import { runAsApp, tryParseInteger } from "./common.js"
import { recognizedTasks, taskExecutor } from "./tasks.js"
import { clientInfo, withStylesApplied } from "@lionweb/delta-protocol-impl/dist/utils/ansi.js"
import { combine } from "@lionweb/delta-protocol-impl/dist/utils/procedure.js"
import { ShapesBase } from "./gen/Shapes.g.js"
import { TestLanguageBase } from "./gen/TestLanguage.g.js"
import { semanticConsoleLogger, semanticLogItemStorer } from "@lionweb/delta-protocol-impl/dist/semantic-logging.js"

const shapesLanguageBase = ShapesBase.INSTANCE
const testLanguageBase = TestLanguageBase.INSTANCE
const languageBases = [shapesLanguageBase, testLanguageBase]

const boldRedIf = (apply: boolean, text: string) =>
    apply ? withStylesApplied("bold", "red")(text) : text

const partitionConcepts: Record<string, Concept> = Object.fromEntries(
    [testLanguageBase.DataTypeTestConcept, shapesLanguageBase.Geometry, testLanguageBase.LinkTestConcept]
        .map((concept) => [concept.name, concept])
)

if (argv.length < 5) {  // $ node dist/cli-client.js <port> <clientID> <partitionConcept> [tasks]
    console.log(
`A Node.js-based app that implements a LionWeb delta protocol client.

Parameters (${boldRedIf(true, "bold red")} are missing):
  - ${boldRedIf(argv.length < 3, `<port>: the port of the WebSocket where the LionWeb delta protocol repository is running on localhost`)}
  - ${boldRedIf(argv.length < 4, `<clientID>: the ID that the client identifies itself with at the repository`)}
  - ${boldRedIf(argv.length < 5, `<partitionConcept>: the name of a partition concept that gets instantiated as the model's primary partition — one of: ${Object.keys(partitionConcepts).join(", ")}`)}
  - ${boldRedIf(argv.length < 6, `[tasks]: a comma-separated list of tasks — one of ${Object.keys(recognizedTasks).sort().join(", ")}`)}

    ASSUMPTION: the initial (states of the models) on client(s) and repository are identical!
`)
    exit(2)
}

const port = tryParseInteger(argv[2])
const clientId = argv[3]
const partitionConcept = argv[4]
if (!(partitionConcept in partitionConcepts)) {
    console.log(boldRedIf(true, `unknown partition concept specified: ${partitionConcept} — must be one of: ${Object.keys(partitionConcepts).join(", ")}`))
    exit(2)
}
const tasks = argv[5]?.split(",") ?? []  // unknown tasks will be ignored
console.log(clientInfo(`tasks provided: ${tasks.length === 0 ? "none" : tasks.join(", ")}`))

await runAsApp(async () => {
    const url = wsLocalhostUrl(port)

    const [storingLogger, semanticLogItems] = semanticLogItemStorer()

    const lionWebClient = await LionWebClient.create({
        clientId,
        url,
        languageBases,
        semanticLogger: combine(semanticConsoleLogger, storingLogger)
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

    return () => {
        return lionWebClient.disconnect()
    }
})

