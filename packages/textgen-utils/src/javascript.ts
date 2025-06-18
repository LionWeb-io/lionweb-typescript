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

import { asString, Template } from "littoral-templates"
import { indent } from "./general.js"

/**
 * @return a sanitized version of the given string that should be suitable as a valid JavaScript identifier.
 */
export const asJSIdentifier = (str: string): string =>
    str
        .replaceAll(".", "_")
        .replaceAll("-", "_")


/**
 * A type def. that captures one `case` of a TypeScript `switch` statement.
 */
export type MatchCase = [caseExpression: string, returnValue: string]

/**
 * @return a JavaScript `switch` statement (as a {@link Template template}).
 * @param expression string with a valid JS expression
 * @param cases `cases` of the `switch` statement, encoded using {@link MatchCase}
 * @param defaultBlock template with a valid `default` block
 */
export const switchOrIf = (expression: string, cases: MatchCase[], defaultBlock: Template) =>
    cases.length > 1
        ? [
            `switch (${expression}) {`,
            indent([
                cases.map(([caseExpression, returnValue]) => `case ${caseExpression}: return ${returnValue};`),
                `default: ${typeof defaultBlock === "string" ? defaultBlock : asString(["{", indent(defaultBlock), "}"])}`
            ]),
            `}`
        ]
        : [
            cases.map(([caseExpression, returnValue]) => [
                `if (${expression} === ${caseExpression}) {`,
                indent(`return ${returnValue};`),
                `}`
            ]),
            defaultBlock
        ]


/**
 * @return the given JSON as valid TypeScript source, meaning: without quotation marks around object keys.
 */
export const asTypeScript = (json: unknown) =>
    JSON.stringify(json, null, 4).replaceAll(/"(.+?)": /g, `$1: `)

