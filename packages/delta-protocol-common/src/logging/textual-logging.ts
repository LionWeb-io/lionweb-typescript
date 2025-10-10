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
export const noOpTextualLogger: TextualLogger = (_, __) => {}

/**
 * @return a {@link TextualLogger textual logger} which is either the given one, or the noOpTextualLogger.
 */
export const textualLoggerFunctionFrom = (optionalLogger?: TextualLogger): TextualLogger =>
    optionalLogger ?? noOpTextualLogger

/**
 * Prefixes all messages passed to the given {@link TextualLogger textual logger} with the given prefix.
 */
export const prefixedWith = (logger: TextualLogger, prefix: string): TextualLogger =>
    (message, error) => logger(`${prefix}${message}`, error)

