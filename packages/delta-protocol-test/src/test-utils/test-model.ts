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

import { INodeBase, serializeNodeBases } from "@lionweb/class-core"
import { DataTypeTestConcept, TestLanguageBase, TestPartition } from "@lionweb/class-core-test-language"

const base = TestLanguageBase.INSTANCE
const factory = base.factory()
const partition = factory(base.TestPartition, "a") as TestPartition
const data = factory(base.DataTypeTestConcept, "data") as DataTypeTestConcept
partition.data = data
data.stringValue_1 = "hello there"  // (a wild Ewan McGregor spawns ;))

export const testModelChunk = serializeNodeBases([partition])

export const getTextFrom = (model: INodeBase[]) =>
    (model[0] as TestPartition).data!.stringValue_1

export const setTextOn = (model: INodeBase[], newValue: string) => {
    (model[0] as TestPartition).data!.stringValue_1 = newValue
}

