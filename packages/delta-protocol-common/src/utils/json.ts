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

import { TextualLogger } from "../logging/textual-logging.js"

/**
 * @return the given text parsed as JSON.
 * @throws an exception when parsing fails, but not before printing the text being parsed on the error console.
 */
export const tryParseJson = (jsonText: string, log: TextualLogger): unknown => {
    try {
        return JSON.parse(jsonText)
    } catch (e) {
        log(`problem occurs when parsing the following text as JSON: ${jsonText}`, true)
        throw e
    }
}

