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

import { deepDuplicatorFor } from "@lionweb/class-core"
import { equal, isTrue, notEqual } from "./assertions.js"

import { LinkTestConcept, TestLanguageBase } from "./gen/TestLanguage.g.js"

describe("deep-duplication", () => {
    it("works", () => {
        const parent = LinkTestConcept.create("parent")
        const child1 = LinkTestConcept.create("child1")
        const child2 = LinkTestConcept.create("child2")
        parent.reference_0_1 = child1
        parent.containment_0_1 = child2

        const parentDuplicate = deepDuplicatorFor([TestLanguageBase.INSTANCE], originalNode => originalNode.id + "-copied")(parent)[0]

        equal(parentDuplicate.id, "parent-copied")
        isTrue(parentDuplicate instanceof LinkTestConcept)
        equal((parentDuplicate as LinkTestConcept).reference_0_1, child1)
        notEqual((parentDuplicate as LinkTestConcept).containment_0_1, child2)
        equal((parentDuplicate as LinkTestConcept).containment_0_1?.id, "child2-copied")
    })
})

