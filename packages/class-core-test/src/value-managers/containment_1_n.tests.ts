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
} from "@lionweb/class-core"

import { deepEqual, equal, throws } from "../assertions.js"
import { LinkTestConcept, TestLanguageBase } from "../gen/TestLanguage.g.js"

const testLanguageBase = TestLanguageBase.INSTANCE


describe("[1..n] containment", () => {

    it("getting an unset [1..n] containment", () => {
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const node = LinkTestConcept.create("node", handleDeltas);

        // pre-check:
        equal(deltas.length, 0);

        // action+check:
        throws(
            () => {
                deepEqual(node.containment_1_n, []);
            },
            `can't read required containment "containment_1_n" that's unset on instance of TestLanguage.LinkTestConcept with id=node`
        );
    });

    it("adding to a [1..n] containment", () => {
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const child1 = LinkTestConcept.create("child1", handleDeltas);
        const parent = LinkTestConcept.create("parent", handleDeltas);

        // pre-check:
        equal(deltas.length, 0);

        // action+check:
        parent.addContainment_1_n(child1);
        deepEqual(parent.containment_1_n, [child1]);
        equal(child1.parent, parent);
        equal(child1.containment, testLanguageBase.LinkTestConcept_containment_1_n);
        equal(deltas.length, 1);
        deepEqual(
            deltas[0],
            new ChildAddedDelta(parent, testLanguageBase.LinkTestConcept_containment_1_n, 0, child1)
        );

        // action+check:
        const child2 = LinkTestConcept.create("child2", handleDeltas);
        parent.addContainment_1_n(child2);
        deepEqual(parent.containment_1_n, [child1, child2]);
        equal(child2.parent, parent);
        equal(child2.containment, testLanguageBase.LinkTestConcept_containment_1_n);
        equal(deltas.length, 2);
        deepEqual(
            deltas[1],
            new ChildAddedDelta(parent, testLanguageBase.LinkTestConcept_containment_1_n, 1, child2)
        );
    });

    it("unsetting a [1..n] containment", () => {
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const child = LinkTestConcept.create("child", handleDeltas);
        const parent = LinkTestConcept.create("parent", handleDeltas);

        // pre-check:
        parent.addContainment_1_n(child);
        equal(child.parent, parent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_1_n);
        equal(deltas.length, 1);

        // action+check:
        throws(
            () => {
                parent.removeContainment_1_n(child);
            },
            `can't unset required containment "containment_1_n" on instance of TestLanguage.LinkTestConcept with id=parent`
        );
        equal(deltas.length, 1);
    });

    it("remove a target", () => {
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const child1 = LinkTestConcept.create("child1", handleDeltas);
        const child2 = LinkTestConcept.create("child2", handleDeltas);
        const child3 = LinkTestConcept.create("child3", handleDeltas);
        const parent = LinkTestConcept.create("parent", handleDeltas);

        // pre-check:
        parent.addContainment_1_n(child1);
        equal(child1.parent, parent);
        equal(child1.containment, testLanguageBase.LinkTestConcept_containment_1_n);
        parent.addContainment_1_n(child2);
        equal(child2.parent, parent);
        equal(child2.containment, testLanguageBase.LinkTestConcept_containment_1_n);
        parent.addContainment_1_n(child3);
        equal(child3.parent, parent);
        equal(child3.containment, testLanguageBase.LinkTestConcept_containment_1_n);
        equal(deltas.length, 3);
        deepEqual(
            deltas,
            [
                new ChildAddedDelta(parent, testLanguageBase.LinkTestConcept_containment_1_n, 0, child1),
                new ChildAddedDelta(parent, testLanguageBase.LinkTestConcept_containment_1_n, 1, child2),
                new ChildAddedDelta(parent, testLanguageBase.LinkTestConcept_containment_1_n, 2, child3)
            ]
        );

        // action+check:
        parent.removeContainment_1_n(child2);
        deepEqual(parent.containment_1_n, [child1, child3]);
        equal(child2.parent, undefined);
        equal(deltas.length, 4);
        deepEqual(
            deltas[3],
            new ChildDeletedDelta(parent, testLanguageBase.LinkTestConcept_containment_1_n, 1, child2)
        );
    });


    it("trying to remove a target that wasn't in there", () => {
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const child1 = LinkTestConcept.create("child1", handleDeltas);
        const parent = LinkTestConcept.create("parent", handleDeltas);

        // pre-check:
        parent.addContainment_1_n(child1);
        equal(child1.parent, parent);
        equal(child1.containment, testLanguageBase.LinkTestConcept_containment_1_n);
        equal(deltas.length, 1);

        const child2 = LinkTestConcept.create("child2", handleDeltas);

        // action+check:
        parent.removeContainment_1_n(child2);
        equal(child2.parent, undefined);
        equal(deltas.length, 1);
        deepEqual(parent.containment_1_n, [child1]);
    });

    it("moving a child between parents ([0..1] -> [1..n])", () => {
        const [handleDelta, deltas] = collectingDeltaHandler();
        const child = LinkTestConcept.create("child", handleDelta);
        const srcParent = LinkTestConcept.create("srcParent", handleDelta);
        const dstParent = LinkTestConcept.create("dstParent", handleDelta);

        srcParent.containment_0_1 = child;

        // pre-check:
        equal(srcParent.containment_0_1, child);
        equal(child.parent, srcParent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_0_1);
        throws(
            () => {
                deepEqual(dstParent.containment_1_n, []);
            },
            `can't read required containment "containment_1_n" that's unset on instance of TestLanguage.LinkTestConcept with id=dstParent`
        );
        equal(deltas.length, 1);
        deepEqual(deltas[0], new ChildAddedDelta(srcParent, testLanguageBase.LinkTestConcept_containment_0_1, 0, child));

        // action+check:
        dstParent.addContainment_1_n(child);
        equal(child.parent, dstParent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_1_n);
        equal(srcParent.containment_0_1, undefined);
        equal(deltas.length, 2);
        deepEqual(deltas[1], new ChildMovedDelta(srcParent, testLanguageBase.LinkTestConcept_containment_0_1, 0, dstParent, testLanguageBase.LinkTestConcept_containment_1_n, 0, child));
    });

    it("moving a child between parents ([0..n] -> [1..n])", () => {
        const [handleDelta, deltas] = collectingDeltaHandler();
        const child = LinkTestConcept.create("child", handleDelta);
        const srcParent = LinkTestConcept.create("srcParent", handleDelta);
        const dstParent = LinkTestConcept.create("dstParent", handleDelta);

        srcParent.addContainment_0_n(child);

        // pre-check:
        deepEqual(srcParent.containment_0_n, [child]);
        equal(child.parent, srcParent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_0_n);
        throws(
            () => {
                deepEqual(dstParent.containment_1_n, []);
            },
            `can't read required containment "containment_1_n" that's unset on instance of TestLanguage.LinkTestConcept with id=dstParent`
        );
        equal(deltas.length, 1);
        deepEqual(deltas[0], new ChildAddedDelta(srcParent, testLanguageBase.LinkTestConcept_containment_0_n, 0, child));

        // action+check:
        dstParent.addContainment_1_n(child);
        equal(child.parent, dstParent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_1_n);
        deepEqual(srcParent.containment_0_n, []);
        deepEqual(dstParent.containment_1_n, [child]);
        equal(deltas.length, 2);
        deepEqual(deltas[1], new ChildMovedDelta(srcParent, testLanguageBase.LinkTestConcept_containment_0_n, 0, dstParent, testLanguageBase.LinkTestConcept_containment_1_n, 0, child));
    });

    it("moving a child between parents ([1..n] -> [1..n])", () => {
        const [handleDelta, deltas] = collectingDeltaHandler();
        const child = LinkTestConcept.create("child", handleDelta);
        const srcParent = LinkTestConcept.create("srcParent", handleDelta);
        const dstParent = LinkTestConcept.create("dstParent", handleDelta);

        srcParent.addContainment_1_n(child);

        // pre-check:
        deepEqual(srcParent.containment_1_n, [child]);
        equal(child.parent, srcParent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_1_n);
        throws(
            () => {
                deepEqual(dstParent.containment_1_n, []);
            },
            `can't read required containment "containment_1_n" that's unset on instance of TestLanguage.LinkTestConcept with id=dstParent`
        );
        equal(deltas.length, 1);
        deepEqual(deltas[0], new ChildAddedDelta(srcParent, testLanguageBase.LinkTestConcept_containment_1_n, 0, child));

        // action+check:
        dstParent.addContainment_1_n(child);
        equal(child.parent, dstParent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_1_n);
        throws(
            () => {
                deepEqual(srcParent.containment_1_n, []);
            },
            `can't read required containment "containment_1_n" that's unset on instance of TestLanguage.LinkTestConcept with id=srcParent`
        );
        equal(deltas.length, 2);
        deepEqual(deltas[1], new ChildMovedDelta(srcParent, testLanguageBase.LinkTestConcept_containment_1_n, 0, dstParent, testLanguageBase.LinkTestConcept_containment_1_n, 0, child));
    });

    it("moving a child between parents, replacing an already-present child", () => {
        const [handleDelta, deltas] = collectingDeltaHandler();
        const childAlreadyAssigned = LinkTestConcept.create("childAlreadyAssigned", handleDelta);
        const dstParent = LinkTestConcept.create("dstParent", handleDelta);
        dstParent.containment_0_1 = childAlreadyAssigned;
        const srcParent = LinkTestConcept.create("srcParent", handleDelta);
        const childToMove = LinkTestConcept.create("childToMove", handleDelta);
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

});

