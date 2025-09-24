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

import { LowLevelClientLogger } from "../web-socket/client-log-types.js"


export type TextualLogger = (message: string, error?: boolean) => void

/**
 * A {@link TextualLogger textual logger} that simply logs to the console.
 */
export const simpleConsoleLogger: TextualLogger = (message, isError) => {
    (isError ? console.error : console.log)(message)
}

/**
 * A {@link TextualLogger textual logger} that does nothing.
 */
export const noOpLogger: TextualLogger = (_, __) => {}

/**
 * @return a {@link TextualLogger textual logger} which is either the given one, or the noOpLogger.
 */
export const textualLoggerFunctionFrom = (optionalLogger?: TextualLogger): TextualLogger =>
    optionalLogger ?? noOpLogger

/**
 * Prefixes all messages passed to the given {@link TextualLogger textual logger} with the given prefix.
 */
export const prefixedWith = (logger: TextualLogger, prefix: string): TextualLogger =>
    (message, error) => logger(`${prefix}${message}`, error)


const unit2divider: { [id: string]: bigint } = {
    "ns": 1n,
    "µs": 1000n,
    "ms": 1000_000n,
    "s": 1000_000_000n
} as const

/**
 * A {@link TextualLogger textual logger} that logs to the console, also showing the time elapsed since the creation of it.
 */
export const timedConsoleLogger = (unit: "ns" | "µs" | "ms" | "s"): TextualLogger => {
    if (!(unit in unit2divider)) {
        throw new Error(`unknown time unit: "${unit}"`)
    }
    const divider = unit2divider[unit]
    const start = process.hrtime.bigint()
    return (message, isError) => {
        (isError ? console.error : console.log)(`{${((process.hrtime.bigint() - start)/divider).toLocaleString()}${unit}} ${message}`)
    }
}


/**
 * @return a {@link LowLevelClientLogger low-level client logger implementation} that just logs the {@link TextualLogItem}s using the given {@link TextualLogger}.
 */
export const asLowLevelClientLogger = <TMessageForClient, TMessageForServer>(textualLogger: TextualLogger): LowLevelClientLogger<TMessageForClient, TMessageForServer> =>
    (logItem) => {
        if ("message" in logItem) {
            textualLogger(logItem.message, logItem.error)
        }
    }

