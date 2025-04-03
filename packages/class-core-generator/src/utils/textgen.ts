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

/*
 * NOTE: this code is copied verbatim from the @lionweb/utilities package, and subsequently modified/added to.
 * This code should “flow back” to the @lionweb packages.
 */


import {asString, indentWith, Template} from "littoral-templates"


/**
 * @return an indenter function that indents by 4 spaces.
 */
export const indent = indentWith("    ")(1)


const withFirstCased = (charFunc: (ch: string) => string) =>
    (str: string) => {
        if (str.length === 0) {
            return str
        }
        return charFunc(str.charAt(0))
            + (str.length > 1 ? str.substring(1) : "")
    }

/**
 * @return the given string but with its first character lower-cased (when possible).
 */
export const withFirstLower = withFirstCased((ch) => ch.toLowerCase())

/**
 * @return the given string but with its first character upper-cased (when possible).
 */
export const withFirstUpper = withFirstCased((ch) => ch.toUpperCase())


/**
 * @return a sanitized version of the given string that should be suitable as a valid JavaScript identifier.
 */
export const asJSIdentifier = (str: string): string =>
    str
        .replaceAll(".", "_")
        .replaceAll("-", "_")


export const wrapInIf = (condition: boolean, left: () => string, right: string) =>
    (text: string) =>
        condition
            ? `${left()}${text}${right}`
            : text


export type MatchCase = [caseExpression: string, returnValue: string]

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

