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

import {
    ChildAddedDelta,
    ChildDeletedDelta,
    ChildMovedAndReplacedFromContainmentInOtherParentDelta,
    ChildMovedAndReplacedFromOtherContainmentInSameParentDelta,
    ChildMovedAndReplacedInSameContainmentInSameParentDelta,
    ChildMovedFromContainmentInOtherParentDelta,
    ChildReplacedDelta,
    collectingDeltaReceiver
} from "@lionweb/class-core"

import { attachedLinkTestConcept, LinkTestConcept, TestLanguageBase } from "@lionweb/class-core-test-language"
import { deepEqual, equal, isTrue, throws } from "../assertions.js"

const testLanguageBase = TestLanguageBase.INSTANCE


describe("[1..n] containment", () => {

    it("getting an unset [1..n] containment", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver()
        const node = LinkTestConcept.create("node", receiveDelta)

        // pre-check:
        equal(deltas.length, 0)

        // action+check:
        throws(
            () => {
                deepEqual(node.containment_1_n, [])
            },
            `can't read required containment "containment_1_n" that's unset on instance of TestLanguage.LinkTestConcept with id=node`
        )
    })

    it("adding to a [1..n] containment", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver()
        const child1 = LinkTestConcept.create("child1", receiveDelta)
        const parent = attachedLinkTestConcept("parent", receiveDelta)

        // pre-check:
        equal(deltas.length, 1)

        // action+check:
        parent.addContainment_1_n(child1)
        deepEqual(parent.containment_1_n, [child1])
        equal(child1.parent, parent)
        equal(child1.containment, testLanguageBase.LinkTestConcept_containment_1_n)
        equal(deltas.length, 2)
        deepEqual(
            deltas[1],
            new ChildAddedDelta(parent, testLanguageBase.LinkTestConcept_containment_1_n, 0, child1)
        )

        // action+check:
        const child2 = LinkTestConcept.create("child2", receiveDelta)
        parent.addContainment_1_n(child2)
        deepEqual(parent.containment_1_n, [child1, child2])
        equal(child2.parent, parent)
        equal(child2.containment, testLanguageBase.LinkTestConcept_containment_1_n)
        equal(deltas.length, 3)
        deepEqual(
            deltas[2],
            new ChildAddedDelta(parent, testLanguageBase.LinkTestConcept_containment_1_n, 1, child2)
        )
    })

    it("unsetting a [1..n] containment", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver()
        const child = LinkTestConcept.create("child", receiveDelta)
        const parent = attachedLinkTestConcept("parent", receiveDelta)

        // pre-check:
        parent.addContainment_1_n(child)
        equal(child.parent, parent)
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_1_n)
        equal(deltas.length, 2)

        // action+check:
        throws(
            () => {
                parent.removeContainment_1_n(child)
            },
            `can't unset required containment "containment_1_n" on instance of TestLanguage.LinkTestConcept with id=parent`
        )
        equal(deltas.length, 2)
    })

    it("remove a target", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver()
        const child1 = LinkTestConcept.create("child1", receiveDelta)
        const child2 = LinkTestConcept.create("child2", receiveDelta)
        const child3 = LinkTestConcept.create("child3", receiveDelta)
        const parent = attachedLinkTestConcept("parent", receiveDelta)

        // pre-check:
        parent.addContainment_1_n(child1)
        equal(child1.parent, parent)
        equal(child1.containment, testLanguageBase.LinkTestConcept_containment_1_n)
        parent.addContainment_1_n(child2)
        equal(child2.parent, parent)
        equal(child2.containment, testLanguageBase.LinkTestConcept_containment_1_n)
        parent.addContainment_1_n(child3)
        equal(child3.parent, parent)
        equal(child3.containment, testLanguageBase.LinkTestConcept_containment_1_n)
        equal(deltas.length, 4)
        deepEqual(
            deltas.slice(1),
            [
                new ChildAddedDelta(parent, testLanguageBase.LinkTestConcept_containment_1_n, 0, child1),
                new ChildAddedDelta(parent, testLanguageBase.LinkTestConcept_containment_1_n, 1, child2),
                new ChildAddedDelta(parent, testLanguageBase.LinkTestConcept_containment_1_n, 2, child3)
            ]
        )

        // action+check:
        parent.removeContainment_1_n(child2)
        deepEqual(parent.containment_1_n, [child1, child3])
        equal(child2.parent, undefined)
        equal(deltas.length, 5)
        deepEqual(
            deltas[4],
            new ChildDeletedDelta(parent, testLanguageBase.LinkTestConcept_containment_1_n, 1, child2)
        )
    })


    it("trying to remove a target that wasn't in there", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver()
        const child1 = LinkTestConcept.create("child1", receiveDelta)
        const parent = attachedLinkTestConcept("parent", receiveDelta)

        // pre-check:
        parent.addContainment_1_n(child1)
        equal(child1.parent, parent)
        equal(child1.containment, testLanguageBase.LinkTestConcept_containment_1_n)
        equal(deltas.length, 2)

        const child2 = LinkTestConcept.create("child2", receiveDelta)

        // action+check:
        parent.removeContainment_1_n(child2)
        equal(child2.parent, undefined)
        equal(deltas.length, 2)
        deepEqual(parent.containment_1_n, [child1])
    })

    it("moving a child between parents ([0..1] -> [1..n])", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver()
        const child = LinkTestConcept.create("child", receiveDelta)
        const srcParent = attachedLinkTestConcept("srcParent", receiveDelta)
        const dstParent = attachedLinkTestConcept("dstParent", receiveDelta)

        srcParent.containment_0_1 = child

        // pre-check:
        equal(srcParent.containment_0_1, child)
        equal(child.parent, srcParent)
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_0_1)
        throws(
            () => {
                deepEqual(dstParent.containment_1_n, [])
            },
            `can't read required containment "containment_1_n" that's unset on instance of TestLanguage.LinkTestConcept with id=dstParent`
        )
        equal(deltas.length, 3)
        deepEqual(deltas[2], new ChildAddedDelta(srcParent, testLanguageBase.LinkTestConcept_containment_0_1, 0, child))

        // action+check:
        dstParent.addContainment_1_n(child)
        equal(child.parent, dstParent)
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_1_n)
        equal(srcParent.containment_0_1, undefined)
        equal(deltas.length, 4)
        deepEqual(deltas[3], new ChildMovedFromContainmentInOtherParentDelta(srcParent, testLanguageBase.LinkTestConcept_containment_0_1, 0, dstParent, testLanguageBase.LinkTestConcept_containment_1_n, 0, child))
    })

    it("moving a child between parents ([0..n] -> [1..n])", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver()
        const child = LinkTestConcept.create("child", receiveDelta)
        const srcParent = attachedLinkTestConcept("srcParent", receiveDelta)
        const dstParent = attachedLinkTestConcept("dstParent", receiveDelta)

        srcParent.addContainment_0_n(child)

        // pre-check:
        deepEqual(srcParent.containment_0_n, [child])
        equal(child.parent, srcParent)
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_0_n)
        throws(
            () => {
                deepEqual(dstParent.containment_1_n, [])
            },
            `can't read required containment "containment_1_n" that's unset on instance of TestLanguage.LinkTestConcept with id=dstParent`
        )
        equal(deltas.length, 3)
        deepEqual(deltas[2], new ChildAddedDelta(srcParent, testLanguageBase.LinkTestConcept_containment_0_n, 0, child))

        // action+check:
        dstParent.addContainment_1_n(child)
        equal(child.parent, dstParent)
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_1_n)
        deepEqual(srcParent.containment_0_n, [])
        deepEqual(dstParent.containment_1_n, [child])
        equal(deltas.length, 4)
        deepEqual(deltas[3], new ChildMovedFromContainmentInOtherParentDelta(srcParent, testLanguageBase.LinkTestConcept_containment_0_n, 0, dstParent, testLanguageBase.LinkTestConcept_containment_1_n, 0, child))
    })

    it("moving a child between parents ([1..n] -> [1..n])", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver()
        const child = LinkTestConcept.create("child", receiveDelta)
        const srcParent = attachedLinkTestConcept("srcParent", receiveDelta)
        const dstParent = attachedLinkTestConcept("dstParent", receiveDelta)

        srcParent.addContainment_1_n(child)

        // pre-check:
        deepEqual(srcParent.containment_1_n, [child])
        equal(child.parent, srcParent)
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_1_n)
        throws(
            () => {
                deepEqual(dstParent.containment_1_n, [])
            },
            `can't read required containment "containment_1_n" that's unset on instance of TestLanguage.LinkTestConcept with id=dstParent`
        )
        equal(deltas.length, 3)
        deepEqual(deltas[2], new ChildAddedDelta(srcParent, testLanguageBase.LinkTestConcept_containment_1_n, 0, child))

        // action+check:
        dstParent.addContainment_1_n(child)
        equal(child.parent, dstParent)
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_1_n)
        throws(
            () => {
                deepEqual(srcParent.containment_1_n, [])
            },
            `can't read required containment "containment_1_n" that's unset on instance of TestLanguage.LinkTestConcept with id=srcParent`
        )
        equal(deltas.length, 4)
        deepEqual(deltas[3], new ChildMovedFromContainmentInOtherParentDelta(srcParent, testLanguageBase.LinkTestConcept_containment_1_n, 0, dstParent, testLanguageBase.LinkTestConcept_containment_1_n, 0, child))
    })

    it("replaces a contained child with a fresh node", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver()
        const parent = attachedLinkTestConcept("parent", receiveDelta)
        const oldChild = LinkTestConcept.create("old", receiveDelta)
        const newChild = LinkTestConcept.create("new", receiveDelta)
        parent.addContainment_1_n(oldChild)
        deltas.length = 0   // cheap way to clear the deltas array

        parent.replaceContainment_1_nAtIndex(newChild, 0)

        deepEqual(parent.containment_1_n, [newChild])
        equal(newChild.parent, parent)
        equal(oldChild.parent, undefined)
        equal(deltas.length, 1)
        isTrue(deltas[0] instanceof ChildReplacedDelta)
        const delta = deltas[0] as ChildReplacedDelta
        equal(delta.replacedChild, oldChild)
        equal(delta.newChild, newChild)
    })

    it("replaceAtIndex - no-op when replacing a child with itself", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver()
        const parent = attachedLinkTestConcept("parent", receiveDelta)
        const child = LinkTestConcept.create("child", receiveDelta)
        parent.addContainment_1_n(child)
        deltas.length = 0

        parent.replaceContainment_1_nAtIndex(child, 0)

        equal(parent.containment_1_n.length, 1)
        equal(parent.containment_1_n[0], child)
        equal(child.parent, parent)
        equal(deltas.length, 0)
    })

    it("replaceAtIndex - same parent, same containment", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver()
        const parent = attachedLinkTestConcept("parent", receiveDelta)
        const child1 = LinkTestConcept.create("child1", receiveDelta)
        const child2 = LinkTestConcept.create("child2", receiveDelta)
        const child3 = LinkTestConcept.create("child3", receiveDelta)
        parent.addContainment_1_n(child1)
        parent.addContainment_1_n(child2)
        parent.addContainment_1_n(child3)
        deltas.length = 0

        parent.replaceContainment_1_nAtIndex(child2, 0)

        equal(parent.containment_1_n.length, 2)
        equal(parent.containment_1_n[0].id, child2.id)
        equal(parent.containment_1_n[1].id, child3.id)
        equal(child1.parent, undefined)
        equal(child2.parent, parent)
        equal(child3.parent, parent)
        equal(deltas.length, 1)
        isTrue(deltas[0] instanceof ChildMovedAndReplacedInSameContainmentInSameParentDelta)
        const delta = deltas[0] as ChildMovedAndReplacedInSameContainmentInSameParentDelta
        equal(delta.movedChild.id, child2.id)
        equal(delta.replacedChild.id, child1.id)
    })

    it("replaceAtIndex - same parent, different containment", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver()
        const parent = attachedLinkTestConcept("parent", receiveDelta)
        const child1 = LinkTestConcept.create("child1", receiveDelta)
        const child2 = LinkTestConcept.create("child2", receiveDelta)
        parent.addContainment_1_n(child1)
        parent.addContainment_0_n(child2)
        deltas.length = 0

        parent.replaceContainment_1_nAtIndex(child2, 0)

        equal(parent.containment_1_n.length, 1)
        equal(parent.containment_1_n[0].id, child2.id)
        equal(parent.containment_0_n.length, 0)
        equal(child2.parent, parent)
        equal(child2.containment, testLanguageBase.LinkTestConcept_containment_1_n)
        equal(child1.parent, undefined)
        equal(deltas.length, 1)
        isTrue(deltas[0] instanceof ChildMovedAndReplacedFromOtherContainmentInSameParentDelta)
        const delta = deltas[0] as ChildMovedAndReplacedFromOtherContainmentInSameParentDelta
        equal(delta.movedChild.id, child2.id)
        equal(delta.replacedChild.id, child1.id)
    })

    it("replaceAtIndex - different parent", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver()
        const parent1 = attachedLinkTestConcept("parent1", receiveDelta)
        const parent2 = attachedLinkTestConcept("parent2", receiveDelta)
        const child1 = LinkTestConcept.create("child1", receiveDelta)
        const child2 = LinkTestConcept.create("child2", receiveDelta)
        parent1.addContainment_1_n(child1)
        parent2.addContainment_1_n(child2)
        deltas.length = 0

        parent1.replaceContainment_1_nAtIndex(child2, 0)

        equal(parent1.containment_1_n.length, 1)
        equal(parent1.containment_1_n[0].id, child2.id)
        throws(
            () => parent2.containment_1_n.length,
            `can't read required containment "containment_1_n" that's unset on instance of TestLanguage.LinkTestConcept with id=parent2`
        )
        equal(child2.parent, parent1)
        equal(child1.parent, undefined)
        equal(deltas.length, 1)
        isTrue(deltas[0] instanceof ChildMovedAndReplacedFromContainmentInOtherParentDelta)
        const delta = deltas[0] as ChildMovedAndReplacedFromContainmentInOtherParentDelta
        equal(delta.movedChild.id, child2.id)
        equal(delta.replacedChild.id, child1.id)
    })

})

