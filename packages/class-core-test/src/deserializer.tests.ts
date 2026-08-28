// Copyright 2026 TRUMPF Laser SE and other contributors
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
// SPDX-FileCopyrightText: 2026 TRUMPF Laser SE and other contributors
// SPDX-License-Identifier: Apache-2.0

import { nodeBaseDetailedDeserializer, serializeNodeBases } from "@lionweb/class-core"
import { LinkTestConcept, TestLanguageBase, TestPartition } from "@lionweb/class-core-test-language"
import { AggregatingProblemReporter, idOf } from "@lionweb/core"

import { deepEqual, equal, isTrue } from "./assertions.js"


describe("deserializer", () => {

    it("doesn’t return orphaned nodes as roots", () => {
        const partitionToKeep = TestPartition.create("partitionToKeep")
        const linkTestConcept1 = LinkTestConcept.create("linkTestConcept1")
        partitionToKeep.addLinks(linkTestConcept1)
        const partitionToRemove = TestPartition.create("partitionToRemove")
        const linkTestConcept2 = LinkTestConcept.create("linkTestConcept2")
        partitionToRemove.addLinks(linkTestConcept2)

        const chunk = serializeNodeBases([partitionToKeep, partitionToRemove])
        chunk.nodes = chunk.nodes.filter(({id}) => id !== "partitionToRemove")  // => linkTestConcept2 is now an orphan

        const aggregator = new AggregatingProblemReporter()
        const {roots, idMapping} = nodeBaseDetailedDeserializer({ languageBases: [TestLanguageBase.INSTANCE], problemReporter: aggregator })(chunk)
        deepEqual(roots.map(idOf), ["partitionToKeep"])
        deepEqual(aggregator.allProblems(), { "orphaned node encountered, with ID: linkTestConcept2": 1 })
        const deserializedLinkTestConcept2 = idMapping.tryFromId("linkTestConcept2")
        isTrue(deserializedLinkTestConcept2 !== undefined)               // linkTestConcept2 is not returned as root, but it is known...
        equal(deserializedLinkTestConcept2!.parent, undefined)  // ...although it doesn’t have a parent
    })

})

