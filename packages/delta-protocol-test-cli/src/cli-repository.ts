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

import { LionWebRepository } from "@lionweb/delta-protocol-impl"
import { argv, exit } from "process"
import { runAsApp, tryParseInteger } from "./common.js"
import { semanticConsoleLogger } from "@lionweb/delta-protocol-impl/dist/semantic-logging.js"
import { repositoryInfo } from "@lionweb/delta-protocol-impl/dist/utils/ansi.js"

if (argv.length < 3) {  // $ node dist/cli-repository.js <port>
    console.log(
        `A Node.js-based app that “implements” a LionWeb delta protocol repository
that just turns any incoming command into the “obvious” event, without validation, etc.

Parameter (missing):
  - <port>: the number of the WebSocket port where the LionWeb delta protocol repository is going to run

`)
    exit(2)
}

const port = tryParseInteger(argv[2])

await runAsApp(async () => {
    const lionWebRepository = await LionWebRepository.setUp({
        port,
        semanticLogger: semanticConsoleLogger
    })

    console.log(repositoryInfo(`LionWeb delta protocol repository running on port ${port} - press Ctrl+C to terminate`))

    return () => {
        return lionWebRepository.shutdown()
    }
})

