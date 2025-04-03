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
    ChildMovedDelta,
    ChildReplacedDelta,
    collectingDeltaHandler
} from "@lionweb/class-core";

import {deepEqual, equal, throws} from "../assertions.js";
import {DatatypeTestConcept, LinkTestConcept, TestLanguageBase} from "../gen/TestLanguage.g.js";


const testLanguageBase = TestLanguageBase.INSTANCE;


describe("[0..n] containment", () => {

    it("getting an unset [0..n] containment", () => {
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const ltc = LinkTestConcept.create("ltc", handleDeltas);

        // pre-check:
        equal(deltas.length, 0);

        // action+check:
        deepEqual(ltc.containment_0_n, []);
    });

    it("adding to a [0..n] containment", () => {
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const dtc1 = DatatypeTestConcept.create("dtc1", handleDeltas);
        const ltc = LinkTestConcept.create("ltc", handleDeltas);

        // pre-check:
        equal(deltas.length, 0);

        // action+check:
        ltc.addContainment_0_n(dtc1);
        deepEqual(ltc.containment_0_n, [dtc1]);
        equal(dtc1.parent, ltc);
        equal(dtc1.containment, testLanguageBase.LinkTestConcept_containment_0_n);
        equal(deltas.length, 1);
        deepEqual(
            deltas[0],
            new ChildAddedDelta(ltc, testLanguageBase.LinkTestConcept_containment_0_n, 0, dtc1)
        );

        // action+check:
        const dtc2 = DatatypeTestConcept.create("dtc2", handleDeltas);
        ltc.addContainment_0_n(dtc2);
        deepEqual(ltc.containment_0_n, [dtc1, dtc2]);
        equal(dtc2.parent, ltc);
        equal(dtc2.containment, testLanguageBase.LinkTestConcept_containment_0_n);
        equal(deltas.length, 2);
        deepEqual(
            deltas[1],
            new ChildAddedDelta(ltc, testLanguageBase.LinkTestConcept_containment_0_n, 1, dtc2)
        );
    });

    it("unsetting a [0..n] containment", () => {
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const dtc = DatatypeTestConcept.create("dtc", handleDeltas);
        const ltc = LinkTestConcept.create("ltc", handleDeltas);

        // pre-check:
        ltc.addContainment_0_n(dtc);
        equal(dtc.parent, ltc);
        equal(dtc.containment, testLanguageBase.LinkTestConcept_containment_0_n);
        equal(deltas.length, 1);

        // action+check:
        ltc.removeContainment_0_n(dtc);
        equal(dtc.parent, undefined);
        equal(deltas.length, 2);
        deepEqual(
            deltas[1],
            new ChildDeletedDelta(ltc, testLanguageBase.LinkTestConcept_containment_0_n, 0, dtc)
        );
    });

    it("remove a target", () => {
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const dtc1 = DatatypeTestConcept.create("dtc1", handleDeltas);
        const dtc2 = DatatypeTestConcept.create("dtc2", handleDeltas);
        const dtc3 = DatatypeTestConcept.create("dtc3", handleDeltas);
        const ltc = LinkTestConcept.create("ltc", handleDeltas);

        // pre-check:
        ltc.addContainment_0_n(dtc1);
        equal(dtc1.parent, ltc);
        equal(dtc1.containment, testLanguageBase.LinkTestConcept_containment_0_n);
        ltc.addContainment_0_n(dtc2);
        equal(dtc2.parent, ltc);
        equal(dtc2.containment, testLanguageBase.LinkTestConcept_containment_0_n);
        ltc.addContainment_0_n(dtc3);
        equal(dtc3.parent, ltc);
        equal(dtc3.containment, testLanguageBase.LinkTestConcept_containment_0_n);
        equal(deltas.length, 3);
        deepEqual(
            deltas,
            [
                new ChildAddedDelta(ltc, testLanguageBase.LinkTestConcept_containment_0_n, 0, dtc1),
                new ChildAddedDelta(ltc, testLanguageBase.LinkTestConcept_containment_0_n, 1, dtc2),
                new ChildAddedDelta(ltc, testLanguageBase.LinkTestConcept_containment_0_n, 2, dtc3)
            ]
        );

        // action+check:
        ltc.removeContainment_0_n(dtc2);
        equal(dtc2.parent, undefined);
        deepEqual(ltc.containment_0_n, [dtc1, dtc3]);
        equal(deltas.length, 4);
        deepEqual(
            deltas[3],
            new ChildDeletedDelta(ltc, testLanguageBase.LinkTestConcept_containment_0_n, 1, dtc2)
        );
    });


    it("trying to remove a target that wasn't in there", () => {
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const dtc1 = DatatypeTestConcept.create("dtc1", handleDeltas);
        const ltc = LinkTestConcept.create("ltc", handleDeltas);

        // pre-check:
        ltc.addContainment_0_n(dtc1);
        equal(dtc1.parent, ltc);
        equal(dtc1.containment, testLanguageBase.LinkTestConcept_containment_0_n);
        equal(deltas.length, 1);

        const dtc2 = DatatypeTestConcept.create("dtc2", handleDeltas);

        // action+check:
        ltc.removeContainment_0_n(dtc2);
        equal(dtc2.parent, undefined);
        equal(deltas.length, 1);
        deepEqual(ltc.containment_0_n, [dtc1]);
    });

    it("moving a child between parents ([0..1] -> [0..n])", () => {
        const [handleDelta, deltas] = collectingDeltaHandler();
        const child = DatatypeTestConcept.create("child", handleDelta);
        const srcParent = LinkTestConcept.create("srcParent", handleDelta);
        const dstParent = LinkTestConcept.create("dstParent", handleDelta);

        srcParent.containment_0_1 = child;

        // pre-check:
        equal(srcParent.containment_0_1, child);
        equal(child.parent, srcParent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_0_1);
        deepEqual(dstParent.containment_0_n, []);
        equal(deltas.length, 1);
        deepEqual(deltas[0], new ChildAddedDelta(srcParent, testLanguageBase.LinkTestConcept_containment_0_1, 0, child));

        // action+check:
        dstParent.addContainment_0_n(child);
        equal(child.parent, dstParent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_0_n);
        equal(srcParent.containment_0_1, undefined);
        equal(deltas.length, 2);
        deepEqual(deltas[1], new ChildMovedDelta(srcParent, testLanguageBase.LinkTestConcept_containment_0_1, 0, dstParent, testLanguageBase.LinkTestConcept_containment_0_n, 0, child));
    });

    it("moving a child between parents ([0..n] -> [0..n])", () => {
        const [handleDelta, deltas] = collectingDeltaHandler();
        const child = DatatypeTestConcept.create("child", handleDelta);
        const srcParent = LinkTestConcept.create("srcParent", handleDelta);
        const dstParent = LinkTestConcept.create("dstParent", handleDelta);

        srcParent.addContainment_0_n(child);

        // pre-check:
        deepEqual(srcParent.containment_0_n, [child]);
        equal(child.parent, srcParent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_0_n);
        deepEqual(dstParent.containment_0_n, []);
        equal(deltas.length, 1);
        deepEqual(deltas[0], new ChildAddedDelta(srcParent, testLanguageBase.LinkTestConcept_containment_0_n, 0, child));

        // action+check:
        dstParent.addContainment_0_n(child);
        equal(child.parent, dstParent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_0_n);
        deepEqual(srcParent.containment_0_n, []);
        equal(deltas.length, 2);
        deepEqual(deltas[1], new ChildMovedDelta(srcParent, testLanguageBase.LinkTestConcept_containment_0_n, 0, dstParent, testLanguageBase.LinkTestConcept_containment_0_n, 0, child));
    });

    it("moving a child between parents, replacing an already-present child", () => {
        const [handleDelta, deltas] = collectingDeltaHandler();
        const childAlreadyAssigned = DatatypeTestConcept.create("childAlreadyAssigned", handleDelta);
        const dstParent = LinkTestConcept.create("dstParent", handleDelta);
        dstParent.containment_0_1 = childAlreadyAssigned;
        const srcParent = LinkTestConcept.create("srcParent", handleDelta);
        const childToMove = DatatypeTestConcept.create("childToMove", handleDelta);
        srcParent.containment_0_1 = childToMove;

        // pre-check:
        equal(deltas.length, 2);

        // action+check:
        dstParent.containment_0_1 = childToMove;
        equal(srcParent.containment_0_1, undefined);
        equal(dstParent.containment_0_1, childToMove);
        equal(childToMove.parent, dstParent);
        equal(childAlreadyAssigned.parent, undefined);
        equal(deltas.length, 4);
        const indices = deltas[2] instanceof ChildReplacedDelta ? [2, 3] : [3, 2];
        deepEqual(deltas[indices[0]], new ChildReplacedDelta(dstParent, testLanguageBase.LinkTestConcept_containment_0_1, 0, childAlreadyAssigned, childToMove));
        deepEqual(deltas[indices[1]], new ChildDeletedDelta(dstParent, testLanguageBase.LinkTestConcept_containment_0_1, 0, childAlreadyAssigned));
    });

    it("addAtIndex", () => {
        const [handleDelta, deltas] = collectingDeltaHandler();
        const ltc1 = LinkTestConcept.create("ltc1", handleDelta);
        const ltc2 = LinkTestConcept.create("ltc2", handleDelta);
        const dtc1 = DatatypeTestConcept.create("dtc1", handleDelta);
        const dtc2 = DatatypeTestConcept.create("dtc2", handleDelta);

        // pre-check:
        equal(deltas.length, 0);
        equal(dtc1.parent, undefined);
        equal(dtc2.parent, undefined);

        throws(
            () => {
                ltc1.addContainment_0_nAtIndex(dtc1, Math.PI);
            },
            `an array index must be an integer, but got: 3.141592653589793`
        );
        throws(
            () => {
                ltc1.addContainment_0_nAtIndex(dtc1, -1);
            },
            `an array index must be a non-negative integer, but got: -1`
        );
        throws(
            () => {
                ltc1.addContainment_0_nAtIndex(dtc1, 1);
            },
            `the largest valid insert index for an array with 0 elements is 0, but got: 1`
        );

        // action+check:
        ltc1.addContainment_0_n(dtc1);
        equal(dtc1.parent, ltc1);
        equal(deltas.length, 1);
        deepEqual(deltas[0], new ChildAddedDelta(ltc1, testLanguageBase.LinkTestConcept_containment_0_n, 0, dtc1));
        throws(
            () => {
                ltc1.addContainment_0_nAtIndex(dtc1, 2);
            },
            `the largest valid insert index for an array with 1 element is 1, but got: 2`
        );

        // action+check:
        ltc1.addContainment_0_nAtIndex(dtc2, 0);
        deepEqual(ltc1.containment_0_n, [dtc2, dtc1]);
        equal(dtc2.parent, ltc1);
        equal(deltas.length, 2);
        deepEqual(deltas[1], new ChildAddedDelta(ltc1, testLanguageBase.LinkTestConcept_containment_0_n, 0, dtc2));

        // action+check:
        ltc2.addContainment_1_nAtIndex(dtc1, 0);
        deepEqual(ltc1.containment_0_n, [dtc2]);
        deepEqual(ltc2.containment_1_n, [dtc1]);
        equal(dtc1.parent, ltc2);
        equal(dtc1.containment, testLanguageBase.LinkTestConcept_containment_1_n);
        equal(deltas.length, 3);
        deepEqual(deltas[2], new ChildMovedDelta(ltc1, testLanguageBase.LinkTestConcept_containment_0_n, 1, ltc2, testLanguageBase.LinkTestConcept_containment_1_n, 0, dtc1));
    });

});

