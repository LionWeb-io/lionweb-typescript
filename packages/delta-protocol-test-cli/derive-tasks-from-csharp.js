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

const taskNames = readFileSync("../../../lionweb-integration-testing/src/cs/LionWeb.Integration.WebSocket.Client/Tasks.cs", { encoding: "utf8" })
    .split(/\r*\n/)
    .map((line) => line.match(/^ {4}(\w+),?$/))
    .filter((matchOrUndefined) => !!matchOrUndefined)
    .map((match) => match[1])

taskNames.forEach((taskName, index) => {
    console.log(`    "${taskName}": true${index < taskNames.length - 1 ? "," : ""}`)
})

