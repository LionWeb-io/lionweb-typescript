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

import { readFileSync } from "fs"

const messageKinds = readFileSync("../delta-protocol-impl/src/payload/command-types.ts", { encoding: "utf8" })
    .split(/\r*\n/)
    .map((line) =>
        line.match(/^ {4}messageKind: "(\w+)"$/)
            ? line.substring("    messageKind: \"".length, line.length - 1)
            : undefined
    )
    .filter((matchOrUndefined) => !!matchOrUndefined)

messageKinds.forEach((messageKind) => {
    console.log(`                case "${messageKind}":`)
})

