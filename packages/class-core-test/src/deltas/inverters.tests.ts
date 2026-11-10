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

import {
    applyDelta,
    ChildAddedDelta,
    ChildDeletedDelta,
    CompositeDelta,
    invertDelta,
    NoOpDelta
} from "@lionweb/class-core"

import { LinkTestConcept, TestLanguageBase } from "@lionweb/class-core-test-language"
import { deepEqual, equal, isUndefined } from "../assertions.js"


const testLanguageBase = TestLanguageBase.INSTANCE

describe("invertDelta for CompositeDelta", () => {

    it("inverts empty CompositeDelta", () => {
        const delta = new CompositeDelta([])
        const inverted = invertDelta(delta)

        equal(inverted instanceof CompositeDelta, true)
        deepEqual((inverted as CompositeDelta).parts, [])
    })

    it("inverts CompositeDelta with single delta", () => {
        const parent = LinkTestConcept.create("parent")
        const child = LinkTestConcept.create("child")
        const containment = testLanguageBase.LinkTestConcept_containment_0_1

        const childAdded = new ChildAddedDelta(parent, containment, 0, child)
        const delta = new CompositeDelta([childAdded])
        const inverted = invertDelta(delta)

        equal(inverted instanceof CompositeDelta, true)
        const parts = (inverted as CompositeDelta).parts
        equal(parts.length, 1)
        equal(parts[0] instanceof ChildDeletedDelta, true)
        const childDeleted = parts[0] as ChildDeletedDelta
        equal(childDeleted.parent, parent)
        equal(childDeleted.containment, containment)
        equal(childDeleted.index, 0)
        equal(childDeleted.deletedChild, child)

        // apply forward and inverted deltas to verify inversion:
        applyDelta(delta)
        equal(parent.containment_0_1, child)
        applyDelta(inverted)
        isUndefined(parent.containment_0_1)
    })

    it("inverts CompositeDelta with multiple deltas and reverses order", () => {
        const parent = LinkTestConcept.create("parent")
        const child1 = LinkTestConcept.create("child1")
        const child2 = LinkTestConcept.create("child2")
        const containment = testLanguageBase.LinkTestConcept_containment_0_n

        const delta1 = new ChildAddedDelta(parent, containment, 0, child1)
        const delta2 = new ChildAddedDelta(parent, containment, 1, child2)
        const compositeDelta = new CompositeDelta([delta1, delta2])

        const inverted = invertDelta(compositeDelta)

        equal(inverted instanceof CompositeDelta, true)
        const parts = (inverted as CompositeDelta).parts
        equal(parts.length, 2)

        // order should be reversed - delta2's inversion (delete child2) should come first:
        equal(parts[0] instanceof ChildDeletedDelta, true)
        const childDeleted0 = parts[0] as ChildDeletedDelta
        equal(childDeleted0.index, 1)
        equal(childDeleted0.deletedChild.id, child2.id)

        equal(parts[1] instanceof ChildDeletedDelta, true)
        const childDeleted1 = parts[1] as ChildDeletedDelta
        equal(childDeleted1.index, 0)
        equal(childDeleted1.deletedChild.id, child1.id)

        // apply forward and inverted deltas to verify inversion:
        applyDelta(compositeDelta)
        deepEqual(parent.containment_0_n, [child1, child2])

        applyDelta(inverted)
        deepEqual(parent.containment_0_n, [])
    })

    it("inverts nested CompositeDelta", () => {
        const parent = LinkTestConcept.create("parent")
        const child1 = LinkTestConcept.create("child1")
        const child2 = LinkTestConcept.create("child2")
        const containment = testLanguageBase.LinkTestConcept_containment_0_n

        const delta1 = new ChildAddedDelta(parent, containment, 0, child1)
        const delta2 = new ChildAddedDelta(parent, containment, 1, child2)

        const innerComposite = new CompositeDelta([delta1, delta2])
        const outerComposite = new CompositeDelta([innerComposite, new NoOpDelta()])

        const inverted = invertDelta(outerComposite)

        equal(inverted instanceof CompositeDelta, true)
        const parts = (inverted as CompositeDelta).parts
        equal(parts.length, 2)

        // order should be reversed:
        equal(parts[0] instanceof NoOpDelta, true)

        equal(parts[1] instanceof CompositeDelta, true)
        const invertedInner = parts[1] as CompositeDelta
        equal(invertedInner.parts.length, 2)

        // inner composite should also be reversed and inverted:
        equal(invertedInner.parts[0] instanceof ChildDeletedDelta, true)
        equal((invertedInner.parts[0] as ChildDeletedDelta).deletedChild.id, child2.id)

        equal(invertedInner.parts[1] instanceof ChildDeletedDelta, true)
        equal((invertedInner.parts[1] as ChildDeletedDelta).deletedChild.id, child1.id)

        // apply forward and inverted deltas to verify inversion:
        applyDelta(outerComposite)
        deepEqual(parent.containment_0_n, [child1, child2])

        applyDelta(inverted)
        deepEqual(parent.containment_0_n, [])
    })

    it("inverts CompositeDelta with NoOpDelta", () => {
        const noOp = new NoOpDelta()
        const delta = new CompositeDelta([noOp])
        const inverted = invertDelta(delta)

        equal(inverted instanceof CompositeDelta, true)
        const parts = (inverted as CompositeDelta).parts
        equal(parts.length, 1)
        equal(parts[0] instanceof NoOpDelta, true)

        // apply forward and inverted deltas - NoOpDelta should not change state:
        const parent = LinkTestConcept.create("parent")
        applyDelta(delta)
        deepEqual(parent.containment_0_n, [])

        applyDelta(inverted)
        deepEqual(parent.containment_0_n, [])
    })

    it("inverts CompositeDelta with mixed delta types", () => {
        const parent = LinkTestConcept.create("parent")
        const child1 = LinkTestConcept.create("child1")
        const child2 = LinkTestConcept.create("child2")
        const containment1 = testLanguageBase.LinkTestConcept_containment_0_1
        const containment2 = testLanguageBase.LinkTestConcept_containment_0_n

        const childAdded1 = new ChildAddedDelta(parent, containment1, 0, child1)
        const childAdded2 = new ChildAddedDelta(parent, containment2, 0, child2)

        const compositeDelta = new CompositeDelta([childAdded1, childAdded2])
        const inverted = invertDelta(compositeDelta)

        equal(inverted instanceof CompositeDelta, true)
        const parts = (inverted as CompositeDelta).parts
        equal(parts.length, 2)

        // order should be reversed:
        equal(parts[0] instanceof ChildDeletedDelta, true)
        const childDeleted2 = parts[0] as ChildDeletedDelta
        equal(childDeleted2.deletedChild.id, child2.id)
        equal(childDeleted2.parent.id, parent.id)
        equal(childDeleted2.containment.key, containment2.key)

        equal(parts[1] instanceof ChildDeletedDelta, true)
        const childDeleted1 = parts[1] as ChildDeletedDelta
        equal(childDeleted1.deletedChild.id, child1.id)
        equal(childDeleted1.parent.id, parent.id)
        equal(childDeleted1.containment.key, containment1.key)

        // apply forward and inverted deltas to verify inversion:
        applyDelta(compositeDelta)
        equal(parent.containment_0_1, child1)
        deepEqual(parent.containment_0_n, [child2])

        applyDelta(inverted)
        isUndefined(parent.containment_0_1)
        deepEqual(parent.containment_0_n, [])
    })

    it("double inversion of CompositeDelta returns original structure", () => {
        const parent = LinkTestConcept.create("parent")
        const child1 = LinkTestConcept.create("child1")
        const child2 = LinkTestConcept.create("child2")
        const containment = testLanguageBase.LinkTestConcept_containment_0_n

        const delta1 = new ChildAddedDelta(parent, containment, 0, child1)
        const delta2 = new ChildAddedDelta(parent, containment, 1, child2)
        const originalComposite = new CompositeDelta([delta1, delta2])

        const invertedOnce = invertDelta(originalComposite)
        const invertedTwice = invertDelta(invertedOnce)

        // double inversion should give us back the original structure:
        equal(invertedTwice instanceof CompositeDelta, true)
        const parts = (invertedTwice as CompositeDelta).parts
        equal(parts.length, 2)

        // the deltas should be the same type and have the same properties:
        equal(parts[0] instanceof ChildAddedDelta, true)
        equal((parts[0] as ChildAddedDelta).newChild.id, child1.id)
        equal((parts[0] as ChildAddedDelta).parent.id, parent.id)
        equal((parts[0] as ChildAddedDelta).containment.key, containment.key)
        equal((parts[0] as ChildAddedDelta).index, 0)

        equal(parts[1] instanceof ChildAddedDelta, true)
        equal((parts[1] as ChildAddedDelta).newChild.id, child2.id)
        equal((parts[1] as ChildAddedDelta).parent.id, parent.id)
        equal((parts[1] as ChildAddedDelta).containment.key, containment.key)
        equal((parts[1] as ChildAddedDelta).index, 1)

        // apply forward deltas, then double-inverted deltas should have same effect:
        const parent2 = LinkTestConcept.create("parent2")
        const child1_2 = LinkTestConcept.create("child1_2")
        const child2_2 = LinkTestConcept.create("child2_2")

        // create a new composite with the same structure for double inversion:
        const delta1_2 = new ChildAddedDelta(parent2, containment, 0, child1_2)
        const delta2_2 = new ChildAddedDelta(parent2, containment, 1, child2_2)
        const composite2 = new CompositeDelta([delta1_2, delta2_2])
        const doubleInverted = invertDelta(invertDelta(composite2))

        applyDelta(doubleInverted)
        deepEqual(parent2.containment_0_n, [child1_2, child2_2])
    })

})

