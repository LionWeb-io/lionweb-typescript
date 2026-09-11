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

import { LinkTestConcept } from "@lionweb/class-core-test-language"
import { isINamed, referenceToSet, UnresolvedReference } from "@lionweb/core"
import { asTreeTextWith } from "@lionweb/class-core"

import { equal } from "./assertions.js"


describe("textualizer", () => {

    it("works for unset or unresolved references", () => {
        const node = LinkTestConcept.create("node")
        const unresolvedNode = new UnresolvedReference("foo", "bar")
        node.reference_0_1 = referenceToSet
        node.reference_1 = unresolvedNode
        const other = LinkTestConcept.create("other")
        other.name = `"the other"`
        node.addReference_1_n(other)
        node.addReference_1_n(referenceToSet as unknown as LinkTestConcept) // some type counterfeiting, just for testing
        node.addReference_1_n(other)
        const text = asTreeTextWith((node) =>
            isINamed(node) ? node.name : node.id
        )([node])
        equal(text, `LinkTestConcept (id: node)
    containment_0_1: <not set>
    containment_1: <not set>
    containment_0_n: <none>
    containment_1_n: <none>
    reference_0_1 -> <not set>
    reference_1 -> unresolved reference to target: targetId=foo, resolveInfo=bar  // = unresolvedNode
    reference_0_n -> <none>
    reference_1_n -> "the other", <not set>, "the other"   // = 2x other, with a smuggled-in referenceToSet in between
    otherContainment_0_1: <not set>
    name = <not set>
`.replaceAll(/\s*\/\/.+$/mg, ""))
    })

})

