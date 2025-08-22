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

import { clearInterval } from "timers"
import { exit } from "process"

/**
 * Runs the given asynchronous thunk as an application.
 * @param startReturningShutdown an asynchronous thunk that returns an asynchronous function that shuts down the app.
 */
export const runAsApp = async (startReturningShutdown: () => Promise<() => Promise<void>>) => {
    const intervalID = setInterval(() => {}, 1 << 25)   // =9h19m14s432ms

    const shutDownHandler = async () => {
        clearInterval(intervalID)
        await shutdown()
        exit(0)
    }

    const shutdown = await startReturningShutdown()

    process.on("SIGTERM", shutDownHandler)
    process.on("SIGINT", shutDownHandler)
}

export const tryParseInteger = (str: string, origin?: string): number | never => {
    try {
        return Number.parseInt(str, 10)
    } catch (_) {
        console.error(`${origin === undefined ? `` : `${origin} is `}not an integer: ${str}`)
        exit(2)
    }
}

