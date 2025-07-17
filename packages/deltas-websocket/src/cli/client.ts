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
import { genericAsTreeText } from "@lionweb/utilities"
import { runAsApp, semanticConsoleLogger, tryParseInteger } from "./common.js"
import { Documentation, Geometry, ShapesBase } from "../gen/Shapes.g.js"
import { wsLocalhostUrl } from "../web-socket/server.js"
import { LionWebClient } from "../client/implementation.js"
import { ClientAppliedEvent, semanticLogItemStorer } from "../semantic-logging.js"
import { withStylesApplied } from "../utils/ansi.js"
import { combine } from "../utils/procedure.js"
import { waitUntil } from "../utils/async.js"
import { minimalTestModel } from "../models/test-models.js"

const languageBase = ShapesBase.INSTANCE
const languageBases = [languageBase]
const { language } = languageBase

const boldRedIf = (apply: boolean, text: string) =>
    apply ? withStylesApplied("bold", "red")(text) : text

if (argv.length < 4) {  // $ node dist/cli/client.js <port> <clientID> [instructions]
    console.log(
`A Node.js-based app that implements a LionWeb delta protocol client.

Parameters (${boldRedIf(true, "bold red")} are missing):
  - ${boldRedIf(argv.length < 3, `<port>: the port of the WebSocket where the LionWeb delta protocol server is running on localhost`)}
  - ${boldRedIf(argv.length < 4, `<clientID>: the ID that the client identifies itself with at the server`)}
  - ${boldRedIf(argv.length < 5, `[instructions]: a comma-separated list of simple instructions`)}

    ASSUMPTIONS:
      * Initial models on client(s) and server are all the minimal test model!
      * The model is an instance of the language with name="${language.name}", version="${language.version}", id="${language.id}"
`)
    exit(2)
}

const port = tryParseInteger(argv[2])
const clientId = argv[3]
const instructions = argv[4]?.split(",") ?? []  // TODO  validate instructions?
console.log(`instructions provided: ${instructions.length === 0 ? "none" : instructions.join(", ")}`)

const serializationChunk = minimalTestModel

await runAsApp(async () => {
    const url = wsLocalhostUrl(port)

    const [storingLogger, semanticLogItems] = semanticLogItemStorer()
    const numberOfAppliedEvents = () =>
        semanticLogItems.filter((item) => item instanceof ClientAppliedEvent).length

    const waitForExternalEvents = async (delta: number) => {
        const expectedNumber = numberOfAppliedEvents() + delta  // (precompute here)
        return waitUntil(10, () => numberOfAppliedEvents() >= expectedNumber)
            .then(() => {
                console.log(withStylesApplied("italic")(`(client applied (the deltas from) a total of ${numberOfAppliedEvents()} events so far)`))
            })
    }

    const lionWebClient = await LionWebClient.setUp({
        clientId,
        url,
        languageBases,
        serializationChunk,
        semanticLogger: combine(semanticConsoleLogger, storingLogger)
    })

    console.log(`LionWeb delta protocol client (with ID=${clientId}) connecting to server on ${url} - press Ctrl to terminate`)
    console.log(`textualization of model:`)
    console.log(genericAsTreeText(serializationChunk, [language]))

    const partition = lionWebClient.model[0] as Geometry
    const documentation = lionWebClient.factory(languageBase.Documentation, "documentation") as Documentation

    let querySequenceNumber = 0
    const queryId = () => `query-${++querySequenceNumber}`
    const executeInstruction = async (instruction: string) => {
        switch (instruction) {
            case "SignOn":
                return await lionWebClient.signOn(queryId())
            case "SignOff":
                return await lionWebClient.signOff(queryId())
            case "AddDocs": {
                partition.documentation = documentation
                return waitForExternalEvents(1)
            }
            case "SetDocsText": {
                documentation.text = "hello there"
                return waitForExternalEvents(1)
            }
            case "Wait": {
                return waitForExternalEvents(1)
            }
            default: {
                console.log(withStylesApplied("italic", "red")(`instruction "${instruction}" is unknown => ignored`))
                return Promise.resolve()
            }
        }
    }

    for (const instruction of instructions) {
        await executeInstruction(instruction)
            .catch((reason) => {
                console.error(reason)
                return Promise.reject(new Error(reason))
            })
    }

    return () => {
        return lionWebClient.disconnect()
    }
})

