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

import { DeltaReceiver, nodeBaseDeserializer } from "@lionweb/class-core"
import { TestLanguageBase } from "@lionweb/class-core-test-language"
import { AccumulatingProblemReporter } from "@lionweb/core"
import { LionWebJsonChunk } from "@lionweb/json"

import { equal } from "../assertions.js"


export const deserializeNodesAssertingNoProblems = (serializationChunk: LionWebJsonChunk, receiveDelta?: DeltaReceiver) => {
    const problemReporter = new AccumulatingProblemReporter()
    const deserialize = nodeBaseDeserializer({ languageBases: [TestLanguageBase.INSTANCE], receiveDelta, problemReporter })
    const deserializedNodes = deserialize(serializationChunk)
    equal(problemReporter.allProblems.length, 0)
    return deserializedNodes
}

