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
import { runAsApp, semanticConsoleLogger, tryParseInteger } from "./common.js"
import { LionWebServer } from "../server/server-impl.js"

if (argv.length < 3) {  // $ node dist/cli/server.js <port>
    console.log(
        `A Node.js-based app that “implements” a LionWeb delta protocol server
that just turns any incoming command into the “obvious” event, without validation, etc.

Parameter (missing):
  - port: the number of the WebSocket port where the LionWeb delta protocol server is going to run

`)
    exit(2)
}

const port = tryParseInteger(argv[2])

await runAsApp(async () => {
    const lionWebServer = await LionWebServer.setUp({
        port,
        semanticLogger: semanticConsoleLogger
    })

    console.log(`LionWeb delta protocol server running on port ${port} - press Ctrl to terminate`)

    return () => {
        return lionWebServer.shutdown()
    }
})

