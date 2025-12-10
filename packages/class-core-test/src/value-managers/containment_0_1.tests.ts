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
    ChildReplacedDelta,
    collectingDeltaReceiver,
    serializeNodeBases
} from "@lionweb/class-core"
import { LionWebJsonMetaPointer } from "@lionweb/json"

import { attachedLinkTestConcept, LinkTestConcept, TestLanguageBase } from "@lionweb/class-core-test-language"
import { deepEqual, equal, isTrue, isUndefined, throws } from "../assertions.js"
import { deserializeNodesAssertingNoProblems } from "./tests-helpers.js"


const testLanguageBase = TestLanguageBase.INSTANCE


describe("write access to a [0..1] containment through .set", () => {

    it("adding an unattached child (ChildAddedDelta)", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const parent = attachedLinkTestConcept("parent", receiveDelta);
        const child = LinkTestConcept.create("child", receiveDelta);

        // pre-check:
        equal(parent.containment_0_1, undefined);
        equal(deltas.length, 1);

        // action+check:
        parent.containment_0_1 = child;
        equal(parent.containment_0_1, child);
        equal(deltas.length, 2);
        deepEqual(deltas[1], new ChildAddedDelta(parent, testLanguageBase.LinkTestConcept_containment_0_1, 0, child));
    });

    it("deleting a child (ChildDeletedDelta)", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const parent = attachedLinkTestConcept("parent", receiveDelta);
        const child = LinkTestConcept.create("child", receiveDelta);
        parent.containment_0_1 = child;

        // pre-check:
        equal(parent.containment_0_1, child);
        equal(child.parent, parent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_0_1);
        equal(deltas.length, 2);

        // action+check:
        parent.containment_0_1 = undefined;
        equal(parent.containment_0_1, undefined);
        equal(child.containment, undefined);
        equal(deltas.length, 3);
        deepEqual(deltas[2], new ChildDeletedDelta(parent, testLanguageBase.LinkTestConcept_containment_0_1, 0, child));
    });

    it(`replacing a child with an unattached node (ChildReplacedDelta)`, () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const parent = attachedLinkTestConcept("parent", receiveDelta);
        const childAlreadyAssigned = LinkTestConcept.create("childAlreadyAssigned", receiveDelta);
        parent.containment_0_1 = childAlreadyAssigned;
        const childToAssign = LinkTestConcept.create("childToAssign", receiveDelta);

        // pre-check:
        equal(deltas.length, 2);
        equal(childToAssign.parent, undefined);

        // action:
        parent.containment_0_1 = childToAssign;

        // check:
        equal(parent.containment_0_1, childToAssign);
        equal(childToAssign.parent, parent);
        equal(childToAssign.containment, testLanguageBase.LinkTestConcept_containment_0_1);
        equal(childAlreadyAssigned.parent, undefined);
        equal(deltas.length, 3);
        deepEqual(deltas[2], new ChildReplacedDelta(parent, testLanguageBase.LinkTestConcept_containment_0_1, 0, childAlreadyAssigned, childToAssign));
    });

    it("moving a child between different parents (ChildMovedFromOtherContainmentDelta)", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const child = LinkTestConcept.create("child", receiveDelta);
        const srcParent = attachedLinkTestConcept("srcParent", receiveDelta);
        const dstParent = attachedLinkTestConcept("dstParent", receiveDelta);

        // pre-check:
        equal(srcParent.containment_0_1, undefined);
        equal(dstParent.containment_0_1, undefined);
        equal(deltas.length, 2);

        // action+check:
        srcParent.containment_0_1 = child;
        equal(child.parent, srcParent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_0_1);
        equal(dstParent.containment_0_1, undefined);
        equal(deltas.length, 3);
        deepEqual(deltas[2], new ChildAddedDelta(srcParent, testLanguageBase.LinkTestConcept_containment_0_1, 0, child));

        // action+check:
        dstParent.containment_0_1 = child;
        equal(child.parent, dstParent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_0_1);
        equal(srcParent.containment_0_1, undefined);
        equal(deltas.length, 4);
        deepEqual(deltas[3], new ChildMovedFromOtherContainmentDelta(srcParent, testLanguageBase.LinkTestConcept_containment_0_1, 0, dstParent, testLanguageBase.LinkTestConcept_containment_0_1, 0, child));
    });

    it("moving a child between different containments in same parent (ChildMovedFromOtherContainmentInSameParentDelta)", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const parent = attachedLinkTestConcept("parent", receiveDelta);
        const child = LinkTestConcept.create("child", receiveDelta);

        // setup+pre-check:
        parent.containment_1 = child;
        equal(parent.containment_1, child);
        equal(child.parent, parent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_1);
        equal(parent.containment_0_1, undefined);
        equal(deltas.length, 2);
        deepEqual(deltas[1], new ChildAddedDelta(parent, testLanguageBase.LinkTestConcept_containment_1, 0, child));

        // action+check:
        parent.containment_0_1 = child;
        equal(child.parent, parent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_0_1);
        throws(
            () => {
                equal(parent.containment_1, undefined);
            },
            `can't read required containment "containment_1" that's unset on instance of TestLanguage.LinkTestConcept with id=parent`
        );
        equal(deltas.length, 3);
        deepEqual(deltas[2], new ChildMovedFromOtherContainmentInSameParentDelta(parent, testLanguageBase.LinkTestConcept_containment_1, 0, child, testLanguageBase.LinkTestConcept_containment_0_1, 0));
    });

    it("moving a child within same containment (no ChildMovedInSameContainmentDelta)", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const parent = attachedLinkTestConcept("parent", receiveDelta);
        const child = LinkTestConcept.create("child", receiveDelta);

        // setup+pre-check:
        parent.containment_0_1 = child;
        equal(parent.containment_0_1, child);
        equal(child.parent, parent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_0_1);
        equal(deltas.length, 2);
        deepEqual(deltas[1], new ChildAddedDelta(parent, testLanguageBase.LinkTestConcept_containment_0_1, 0, child));

        // action+check:
        parent.containment_0_1 = child;
        equal(child.parent, parent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_0_1);
        equal(parent.containment_0_1, child);
        equal(deltas.length, 2);
    });

    it("moving a child between different parents, replacing an already-present child (ChildMovedAndReplacedFromOtherContainmentDelta)", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const childAlreadyAssigned = attachedLinkTestConcept("childAlreadyAssigned", receiveDelta);
        const dstParent = attachedLinkTestConcept("dstParent", receiveDelta);
        dstParent.containment_0_1 = childAlreadyAssigned;
        const srcParent = attachedLinkTestConcept("srcParent", receiveDelta);
        const childToMove = LinkTestConcept.create("childToMove", receiveDelta);
        srcParent.containment_0_1 = childToMove;

        // pre-check:
        equal(deltas.length, 5);

        // action+check:
        dstParent.containment_0_1 = childToMove;
        equal(srcParent.containment_0_1, undefined);
        equal(dstParent.containment_0_1, childToMove);
        equal(childToMove.parent, dstParent);
        equal(childAlreadyAssigned.parent, undefined);
        equal(deltas.length, 6);
        deepEqual(deltas[5], new ChildMovedAndReplacedFromOtherContainmentDelta(dstParent, testLanguageBase.LinkTestConcept_containment_0_1, 0, childToMove, srcParent, testLanguageBase.LinkTestConcept_containment_0_1, 0, childAlreadyAssigned));
    });

});


describe("serialization and deserialization w.r.t. a [0..1] containment", () => {

    const metaPointer: LionWebJsonMetaPointer = {
        language: "TestLanguage",
        version: "0",
        key: "LinkTestConcept-containment_0_1"
    };

    it("serializes and deserializes an unset containment correctly", () => {
        const ltc = attachedLinkTestConcept("ltc");    // leave .containment_0_1 unset
        const serializationChunk = serializeNodeBases([ltc]);
        const {nodes} = serializationChunk;
        equal(nodes.length, 1);
        const serContainment = nodes[0].containments.find(({containment}) => containment.key === metaPointer.key);
        isUndefined(serContainment);

        const deserializedNodes = deserializeNodesAssertingNoProblems(serializationChunk);
        equal(deserializedNodes.length, 1);
        const root = deserializedNodes[0];
        isTrue(root instanceof LinkTestConcept);
        const deserializedLtc = root as LinkTestConcept;
        equal(deserializedLtc.id, "ltc");
        equal(deserializedLtc.classifier, testLanguageBase.LinkTestConcept);
        equal(deserializedLtc.parent, undefined);
        equal(deserializedLtc.containment_0_1, undefined);
    });

    it("serializes a set containment correctly", () => {
        const child = LinkTestConcept.create("child");
        const parent = attachedLinkTestConcept("parent");
        parent.containment_0_1 = child;
        const serializationChunk = serializeNodeBases([parent]);
        const {nodes} = serializationChunk;
        equal(nodes.length, 2);
        const serContainment = nodes[0].containments.find(({containment}) => containment.key === metaPointer.key);
        deepEqual(serContainment, {
            containment: metaPointer,
            children: ["child"]
        });

        const deserializedNodes = deserializeNodesAssertingNoProblems(serializationChunk);
        equal(deserializedNodes.length, 1); // (because there's only one “root”)
        const root = deserializedNodes[0];
        isTrue(root instanceof LinkTestConcept);
        const deserializedParent = root as LinkTestConcept;
        equal(deserializedParent.id, "parent");
        equal(deserializedParent.classifier, testLanguageBase.LinkTestConcept);
        equal(deserializedParent.parent, undefined);
        isTrue(deserializedParent.containment_0_1 instanceof LinkTestConcept);
        const deserializedChild = deserializedParent.containment_0_1 as LinkTestConcept;
        equal(deserializedChild.id, "child");
        equal(deserializedChild.classifier, testLanguageBase.LinkTestConcept);
        equal(deserializedChild.parent, deserializedParent);
    });

});

