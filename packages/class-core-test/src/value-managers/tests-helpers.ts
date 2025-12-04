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
import {
    DataTypeTestConcept,
    LinkTestConcept,
    TestLanguageBase,
    TestPartition
} from "@lionweb/class-core-test-language"
import { AccumulatingSimplisticHandler } from "@lionweb/core"
import { LionWebId, LionWebJsonChunk } from "@lionweb/json"

import { equal } from "../assertions.js"


export const deserializeNodesAssertingNoProblems = (serializationChunk: LionWebJsonChunk, receiveDelta?: DeltaReceiver) => {
    const problemsHandler = new AccumulatingSimplisticHandler()
    const deserialize = nodeBaseDeserializer({ languageBases: [TestLanguageBase.INSTANCE], receiveDelta, problemsHandler })
    const deserializedNodes = deserialize(serializationChunk)
    equal(problemsHandler.allProblems.length, 0)
    return deserializedNodes
}


let sequenceNumber = 0

/**
 * @return a {@link LinkTestConcept} instance that’s attached through containment by a {@link TestPartition} instances
 *  — the latter has a unique ID.
 */
export const attachedLinkTestConcept = (id: LionWebId, receiveDelta?: DeltaReceiver) => {
    const partition = TestPartition.create(`partition-${++sequenceNumber}`, receiveDelta)
    const linkTestConcept = LinkTestConcept.create(id, receiveDelta)
    partition.addLinks(linkTestConcept)
    return linkTestConcept
}

/**
 * @return a {@link DataTypeTestConcept} instance that’s attached through containment by a {@link TestPartition} instances
 *  — the latter has a unique ID.
 */
export const attachedDataTypeTestConcept = (id: LionWebId, receiveDelta?: DeltaReceiver) => {
    const partition = TestPartition.create(`partition-${++sequenceNumber}`, receiveDelta)
    const dataTypeTestConcept = DataTypeTestConcept.create(id, receiveDelta)
    partition.data = dataTypeTestConcept
    return dataTypeTestConcept
}

