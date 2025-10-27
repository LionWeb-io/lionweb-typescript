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

import { sameMembers } from "./assertions.js"

import { LinkTestConcept } from "./gen/TestLanguage.g.js"

describe("internals of base types", () => {
    it("children", () => {
        const parent = LinkTestConcept.create("parent")
        const child1 = LinkTestConcept.create("child1")
        const child2 = LinkTestConcept.create("child2")
        const child3 = LinkTestConcept.create("child3")
        const child4 = LinkTestConcept.create("child4")
        const child5 = LinkTestConcept.create("child5")
        parent.containment_0_1 = child1
        parent.containment_1 = child2
        parent.addContainment_0_n(child3)
        parent.addContainment_1_n(child4)
        parent.addAnnotation(child5)
        sameMembers(parent.children, [child1, child2, child3, child4, child5])
    })

    it("referenceTargets", () => {
        const parent = LinkTestConcept.create("parent")
        const child1 = LinkTestConcept.create("child1")
        const child2 = LinkTestConcept.create("child2")
        const child3 = LinkTestConcept.create("child3")
        const child4 = LinkTestConcept.create("child4")
        parent.reference_0_1 = child1
        parent.reference_1 = child2
        parent.addReference_0_n(child3)
        parent.addReference_1_n(child4)
        sameMembers(parent.referenceTargets, [child1, child2, child3, child4])
    })
})

