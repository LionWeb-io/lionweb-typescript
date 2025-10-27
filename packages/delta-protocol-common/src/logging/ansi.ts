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

const colors = {
    black: 30,
    red: 31,
    green: 32,
    yellow: 33,
    blue: 34,
    magenta: 35,
    cyan: 36,
    white: 37,
    default: 39
} as const

const styles = {
    default: 0,
    bold: 1,
    italic: 3
} as const


const withColorAndStyleApplied = (color: keyof typeof colors, style: keyof typeof styles) =>
    (text: string) =>
        `\x1b[${style === "default" ? "" : `${styles[style]}`}${color === "default" ? "" : `;${colors[color]}m`}${text}\x1b[0m`


const clientInfo = withColorAndStyleApplied("magenta", "bold")
const clientWarning = withColorAndStyleApplied("magenta", "italic")
const repositoryInfo = withColorAndStyleApplied("cyan", "bold")
const repositoryWarning = withColorAndStyleApplied("cyan", "italic")
const genericError = withColorAndStyleApplied("red", "bold")
const genericWarning = withColorAndStyleApplied("red", "italic")

const colorSchemeExplanationString = `${withColorAndStyleApplied("magenta", "default")("magenta=client")}, ${withColorAndStyleApplied("cyan", "default")("cyan=repository")}`

export const ansi = {
    colors,
    styles,
    withColorAndStyleApplied,
    clientInfo,
    clientWarning,
    repositoryInfo,
    repositoryWarning,
    genericError,
    genericWarning,
    colorSchemeExplanationString
}

