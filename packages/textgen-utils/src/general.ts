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

import { indentWith } from "littoral-templates"

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
 * @return a function that takes one string argument, and returns that argument wrapped between `left()` and `right`, provided `condition` is true.
 * @param condition boolean
 * @param left thunk returning a string
 * @param right string
 */
export const wrapInIf = (condition: boolean, left: () => string, right: string): ((text: string) => string) =>
    condition
        ? (text) => `${left()}${text}${right}`  // (don't pre-eval left, as it might have side-effects)
        : (text) => text


