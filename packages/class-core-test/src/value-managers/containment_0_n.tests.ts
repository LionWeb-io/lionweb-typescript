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
    ChildMovedAndReplacedFromOtherContainmentDelta,
    ChildMovedFromOtherContainmentDelta,
    ChildMovedFromOtherContainmentInSameParentDelta,
    ChildMovedInSameContainmentDelta,
    collectingDeltaReceiver
} from "@lionweb/class-core"

import { LinkTestConcept, TestLanguageBase } from "@lionweb/class-core-test-language"
import { deepEqual, equal, latestDeltaAsserter, throws } from "../assertions.js"

const testLanguageBase = TestLanguageBase.INSTANCE

describe("[0..n] containment", () => {

    it("getting an unset [0..n] containment", () => {
        const [receiveDeltas, deltas] = collectingDeltaReceiver();
        const ltc = LinkTestConcept.create("ltc", receiveDeltas);

        // pre-check:
        equal(deltas.length, 0);

        // action+check:
        deepEqual(ltc.containment_0_n, []);
    });

    it("adding to a [0..n] containment", () => {
        const [receiveDeltas, deltas] = collectingDeltaReceiver();
        const assertLatestDelta = latestDeltaAsserter(deltas);
        const child1 = LinkTestConcept.create("child1", receiveDeltas);
        const parent = LinkTestConcept.create("parent", receiveDeltas);

        // pre-check:
        equal(deltas.length, 0);

        // action+check:
        parent.addContainment_0_n(child1);
        deepEqual(parent.containment_0_n, [child1]);
        equal(child1.parent, parent);
        equal(child1.containment, testLanguageBase.LinkTestConcept_containment_0_n);
        assertLatestDelta(new ChildAddedDelta(parent, testLanguageBase.LinkTestConcept_containment_0_n, 0, child1));

        // action+check:
        const child2 = LinkTestConcept.create("child2", receiveDeltas);
        parent.addContainment_0_n(child2);
        deepEqual(parent.containment_0_n, [child1, child2]);
        equal(child2.parent, parent);
        equal(child2.containment, testLanguageBase.LinkTestConcept_containment_0_n);
        assertLatestDelta(new ChildAddedDelta(parent, testLanguageBase.LinkTestConcept_containment_0_n, 1, child2));
    });

    it("unsetting a [0..n] containment", () => {
        const [receiveDeltas, deltas] = collectingDeltaReceiver();
        const assertLatestDelta = latestDeltaAsserter(deltas);
        const child = LinkTestConcept.create("child", receiveDeltas);
        const parent = LinkTestConcept.create("parent", receiveDeltas);

        // pre-check:
        parent.addContainment_0_n(child);
        equal(child.parent, parent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_0_n);
        assertLatestDelta(new ChildAddedDelta(parent, testLanguageBase.LinkTestConcept_containment_0_n, 0, child));

        // action+check:
        parent.removeContainment_0_n(child);
        equal(child.parent, undefined);
        assertLatestDelta(new ChildDeletedDelta(parent, testLanguageBase.LinkTestConcept_containment_0_n, 0, child));
    });

    it("remove a target", () => {
        const [receiveDeltas, deltas] = collectingDeltaReceiver();
        const assertLatestDelta = latestDeltaAsserter(deltas);
        const child1 = LinkTestConcept.create("child1", receiveDeltas);
        const child2 = LinkTestConcept.create("child2", receiveDeltas);
        const child3 = LinkTestConcept.create("child3", receiveDeltas);
        const parent = LinkTestConcept.create("parent", receiveDeltas);

        // pre-check:
        parent.addContainment_0_n(child1);
        equal(child1.parent, parent);
        equal(child1.containment, testLanguageBase.LinkTestConcept_containment_0_n);
        assertLatestDelta(new ChildAddedDelta(parent, testLanguageBase.LinkTestConcept_containment_0_n, 0, child1));
        parent.addContainment_0_n(child2);
        equal(child2.parent, parent);
        equal(child2.containment, testLanguageBase.LinkTestConcept_containment_0_n);
        assertLatestDelta(new ChildAddedDelta(parent, testLanguageBase.LinkTestConcept_containment_0_n, 1, child2));
        parent.addContainment_0_n(child3);
        equal(child3.parent, parent);
        equal(child3.containment, testLanguageBase.LinkTestConcept_containment_0_n);
        assertLatestDelta(new ChildAddedDelta(parent, testLanguageBase.LinkTestConcept_containment_0_n, 2, child3));

        // action+check:
        parent.removeContainment_0_n(child2);
        equal(child2.parent, undefined);
        deepEqual(parent.containment_0_n, [child1, child3]);
        assertLatestDelta(new ChildDeletedDelta(parent, testLanguageBase.LinkTestConcept_containment_0_n, 1, child2));
    });


    it("trying to remove a target that wasn't in there", () => {
        const [receiveDeltas, deltas] = collectingDeltaReceiver();
        const child1 = LinkTestConcept.create("child1", receiveDeltas);
        const parent = LinkTestConcept.create("parent", receiveDeltas);

        // pre-check:
        parent.addContainment_0_n(child1);
        equal(child1.parent, parent);
        equal(child1.containment, testLanguageBase.LinkTestConcept_containment_0_n);
        equal(deltas.length, 1);

        const child2 = LinkTestConcept.create("child2", receiveDeltas);

        // action+check:
        parent.removeContainment_0_n(child2);
        equal(child2.parent, undefined);
        equal(deltas.length, 1);
        deepEqual(parent.containment_0_n, [child1]);
    });

    it("moving a child between parents ([0..1] -> [0..n])", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const assertLatestDelta = latestDeltaAsserter(deltas);
        const child = LinkTestConcept.create("child", receiveDelta);
        const srcParent = LinkTestConcept.create("srcParent", receiveDelta);
        const dstParent = LinkTestConcept.create("dstParent", receiveDelta);

        srcParent.containment_0_1 = child;

        // pre-check:
        equal(srcParent.containment_0_1, child);
        equal(child.parent, srcParent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_0_1);
        deepEqual(dstParent.containment_0_n, []);
        assertLatestDelta(new ChildAddedDelta(srcParent, testLanguageBase.LinkTestConcept_containment_0_1, 0, child));

        // action+check:
        dstParent.addContainment_0_n(child);
        equal(child.parent, dstParent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_0_n);
        equal(srcParent.containment_0_1, undefined);
        assertLatestDelta(new ChildMovedFromOtherContainmentDelta(srcParent, testLanguageBase.LinkTestConcept_containment_0_1, 0, dstParent, testLanguageBase.LinkTestConcept_containment_0_n, 0, child));
    });

    it("moving a child between parents ([0..n] -> [0..n])", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const assertLatestDelta = latestDeltaAsserter(deltas);
        const child = LinkTestConcept.create("child", receiveDelta);
        const srcParent = LinkTestConcept.create("srcParent", receiveDelta);
        const dstParent = LinkTestConcept.create("dstParent", receiveDelta);

        srcParent.addContainment_0_n(child);

        // pre-check:
        deepEqual(srcParent.containment_0_n, [child]);
        equal(child.parent, srcParent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_0_n);
        deepEqual(dstParent.containment_0_n, []);
        assertLatestDelta(new ChildAddedDelta(srcParent, testLanguageBase.LinkTestConcept_containment_0_n, 0, child));

        // action+check:
        dstParent.addContainment_0_n(child);
        equal(child.parent, dstParent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_0_n);
        deepEqual(srcParent.containment_0_n, []);
        assertLatestDelta(new ChildMovedFromOtherContainmentDelta(srcParent, testLanguageBase.LinkTestConcept_containment_0_n, 0, dstParent, testLanguageBase.LinkTestConcept_containment_0_n, 0, child));
    });

    // FIXME  this is a test for a [0..1] containment, not for [0..n]
    it.skip("moving a child between parents, replacing an already-present child", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const childAlreadyAssigned = LinkTestConcept.create("childAlreadyAssigned", receiveDelta);
        const dstParent = LinkTestConcept.create("dstParent", receiveDelta);
        dstParent.containment_0_1 = childAlreadyAssigned;
        const srcParent = LinkTestConcept.create("srcParent", receiveDelta);
        const childToMove = LinkTestConcept.create("childToMove", receiveDelta);
        srcParent.containment_0_1 = childToMove;

        // pre-check:
        equal(deltas.length, 2);

        // action+check:
        dstParent.containment_0_1 = childToMove;
        equal(srcParent.containment_0_1, undefined);
        equal(dstParent.containment_0_1, childToMove);
        equal(childToMove.parent, dstParent);
        equal(childAlreadyAssigned.parent, undefined);
        equal(deltas.length, 3);
        deepEqual(deltas[2], new ChildMovedAndReplacedFromOtherContainmentDelta(dstParent, testLanguageBase.LinkTestConcept_containment_0_1, 0, childToMove, srcParent, testLanguageBase.LinkTestConcept_containment_0_1, 0, childAlreadyAssigned));
    });

    it("addAtIndex", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const assertLatestDelta = latestDeltaAsserter(deltas);

        const parent1 = LinkTestConcept.create("parent1", receiveDelta);
        const parent2 = LinkTestConcept.create("parent2", receiveDelta);
        const child1 = LinkTestConcept.create("child1", receiveDelta);
        const child2 = LinkTestConcept.create("child2", receiveDelta);

        // pre-check:
        equal(deltas.length, 0);
        equal(child1.parent, undefined);
        equal(child2.parent, undefined);

        throws(
            () => {
                parent1.addContainment_0_nAtIndex(child1, Math.PI);
            },
            `an array index must be an integer, but got: 3.141592653589793`
        );
        throws(
            () => {
                parent1.addContainment_0_nAtIndex(child1, -1);
            },
            `an array index must be a non-negative integer, but got: -1`
        );
        throws(
            () => {
                parent1.addContainment_0_nAtIndex(child1, 1);
            },
            `the largest valid insert index for an array with 0 elements is 0, but got: 1`
        );

        // action+check:
        parent1.addContainment_0_n(child1);
        deepEqual(parent1.containment_0_n, [child1]);   // child1 added at parent1.containment_0_n[0]
        equal(child1.parent, parent1);
        equal(child1.containment, testLanguageBase.LinkTestConcept_containment_0_n);
        assertLatestDelta(new ChildAddedDelta(parent1, testLanguageBase.LinkTestConcept_containment_0_n, 0, child1));

        // action+check:
        throws(
            () => {
                parent1.addContainment_0_nAtIndex(child2, 2);
            },
            `the largest valid insert index for an array with 1 element is 1, but got: 2`
        );
        parent1.addContainment_0_nAtIndex(child2, 0);   // child2 added at parent1.containment_0_n[0]
        deepEqual(parent1.containment_0_n, [child2, child1]);
        equal(child2.parent, parent1);
        equal(child2.containment, testLanguageBase.LinkTestConcept_containment_0_n);
        assertLatestDelta(new ChildAddedDelta(parent1, testLanguageBase.LinkTestConcept_containment_0_n, 0, child2));

        // action+check:
        parent1.addContainment_0_nAtIndex(child1, 0);   // child1 moved from parent1.containment_0_n[1] to parent1.containment_0_n[0]
        deepEqual(parent1.containment_0_n, [child1, child2]);
        equal(child1.parent, parent1);
        equal(child1.containment, testLanguageBase.LinkTestConcept_containment_0_n);
        equal(child2.parent, parent1);
        equal(child2.containment, testLanguageBase.LinkTestConcept_containment_0_n);
        assertLatestDelta(new ChildMovedInSameContainmentDelta(parent1, testLanguageBase.LinkTestConcept_containment_0_n, 1, 0,child1));

        // action+check:
        parent1.addContainment_1_nAtIndex(child2, 0);   // child2 moved from parent1.containment_0_n[1] to parent1.containment_1_n[0]
        deepEqual(parent1.containment_0_n, [child1]);
        deepEqual(parent1.containment_1_n, [child2]);
        equal(child1.parent, parent1);
        equal(child1.containment, testLanguageBase.LinkTestConcept_containment_0_n);
        equal(child2.parent, parent1);
        equal(child2.containment, testLanguageBase.LinkTestConcept_containment_1_n);
        assertLatestDelta(new ChildMovedFromOtherContainmentInSameParentDelta(parent1, testLanguageBase.LinkTestConcept_containment_0_n, 1, child2, testLanguageBase.LinkTestConcept_containment_1_n, 0));

        // action+check:
        parent2.addContainment_1_nAtIndex(child1, 0);   // child1 moved from parent1.containment_0_n[0] to parent2.containment_1_n[0]
        deepEqual(parent1.containment_0_n, []);
        deepEqual(parent2.containment_1_n, [child1]);
        equal(child1.parent, parent2);
        equal(child1.containment, testLanguageBase.LinkTestConcept_containment_1_n);
        assertLatestDelta(new ChildMovedFromOtherContainmentDelta(parent1, testLanguageBase.LinkTestConcept_containment_0_n, 0, parent2, testLanguageBase.LinkTestConcept_containment_1_n, 0, child1));
    });

});

