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
    ChildMovedFromOtherContainmentDelta,
    ChildReplacedDelta,
    collectingDeltaReceiver,
    nodeBaseDeserializer,
    serializeNodeBases
} from "@lionweb/class-core"
import { AccumulatingSimplisticHandler } from "@lionweb/core"
import { LionWebJsonMetaPointer } from "@lionweb/json"

import { LinkTestConcept, TestLanguageBase } from "@lionweb/class-core-test-language"
import { deepEqual, equal, isTrue, isUndefined } from "../assertions.js"

const testLanguageBase = TestLanguageBase.INSTANCE

describe("read+write access to a [0..1] containment", () => {

    it("setting of a [0..1] containment", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const child = LinkTestConcept.create("child", receiveDelta);
        const parent = LinkTestConcept.create("parent", receiveDelta);

        // pre-check:
        equal(parent.containment_0_1, undefined);
        equal(deltas.length, 0);

        // action+check:
        parent.containment_0_1 = child;
        equal(parent.containment_0_1, child);
        equal(deltas.length, 1);
        deepEqual(deltas[0], new ChildAddedDelta(parent, testLanguageBase.LinkTestConcept_containment_0_1, 0, child));
    });

    it("moving a child (through a [0..1] containment) from parent to parent", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const child = LinkTestConcept.create("child", receiveDelta);
        const srcParent = LinkTestConcept.create("srcParent", receiveDelta);
        const dstParent = LinkTestConcept.create("dstParent", receiveDelta);

        // pre-check:
        equal(srcParent.containment_0_1, undefined);
        equal(dstParent.containment_0_1, undefined);
        equal(deltas.length, 0);

        // action+check:
        srcParent.containment_0_1 = child;
        equal(child.parent, srcParent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_0_1);
        equal(dstParent.containment_0_1, undefined);
        equal(deltas.length, 1);
        deepEqual(deltas[0], new ChildAddedDelta(srcParent, testLanguageBase.LinkTestConcept_containment_0_1, 0, child));

        // action+check:
        srcParent.containment_0_1 = undefined; // 1. remove child again
        equal(child.parent, undefined);
        equal(child.containment, undefined);
        equal(deltas.length, 2);
        deepEqual(deltas[1], new ChildDeletedDelta(srcParent, testLanguageBase.LinkTestConcept_containment_0_1, 0, child));

        // action+check:
        dstParent.containment_0_1 = child;
        equal(dstParent.containment_0_1, child);
        equal(child.parent, dstParent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_0_1);
        equal(deltas.length, 3);
        deepEqual(deltas[2], new ChildAddedDelta(dstParent, testLanguageBase.LinkTestConcept_containment_0_1, 0, child));
    });

    it("moving a child (through a [0..1] containment) directly between parents", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const child = LinkTestConcept.create("child", receiveDelta);
        const srcParent = LinkTestConcept.create("srcParent", receiveDelta);
        const dstParent = LinkTestConcept.create("dstParent", receiveDelta);

        // pre-check:
        equal(srcParent.containment_0_1, undefined);
        equal(dstParent.containment_0_1, undefined);
        equal(deltas.length, 0);

        // action+check:
        srcParent.containment_0_1 = child;
        equal(child.parent, srcParent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_0_1);
        equal(dstParent.containment_0_1, undefined);
        equal(deltas.length, 1);
        deepEqual(deltas[0], new ChildAddedDelta(srcParent, testLanguageBase.LinkTestConcept_containment_0_1, 0, child));

        // action+check:
        dstParent.containment_0_1 = child;
        equal(child.parent, dstParent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_0_1);
        equal(srcParent.containment_0_1, undefined);
        equal(deltas.length, 2);
        deepEqual(deltas[1], new ChildMovedFromOtherContainmentDelta(srcParent, testLanguageBase.LinkTestConcept_containment_0_1, 0, dstParent, testLanguageBase.LinkTestConcept_containment_0_1, 0, child));
    });

    it("moving a child (through a [0..1] containment) directly between parents, replacing an already-present child", () => {
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
        equal(deltas.length, 4);
        const indices = deltas[2] instanceof ChildReplacedDelta ? [2, 3] : [3, 2];
        deepEqual(deltas[indices[0]], new ChildReplacedDelta(dstParent, testLanguageBase.LinkTestConcept_containment_0_1, 0, childAlreadyAssigned, childToMove));
        deepEqual(deltas[indices[1]], new ChildDeletedDelta(dstParent, testLanguageBase.LinkTestConcept_containment_0_1, 0, childAlreadyAssigned));
    });

});


describe("serialization and deserialization w.r.t. a [0..1] containment", () => {

    const metaPointer: LionWebJsonMetaPointer = {
        language: "TestLanguage",
        version: "0",
        key: "LinkTestConcept-containment_0_1"
    };

    it("serializes and deserializes an unset containment correctly", () => {
        const ltc = LinkTestConcept.create("ltc");    // leave .containment_0_1 unset
        const serializationChunk = serializeNodeBases([ltc]);
        const {nodes} = serializationChunk;
        equal(nodes.length, 1);
        const serContainment = nodes[0].containments.find(({containment}) => containment.key === metaPointer.key);
        isUndefined(serContainment);

        const deserialize = nodeBaseDeserializer([testLanguageBase]);
        const problemHandler = new AccumulatingSimplisticHandler();
        const deserializedNodes = deserialize(serializationChunk, undefined, undefined, undefined, problemHandler);
        equal(problemHandler.allProblems.length, 0);
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
        const parent = LinkTestConcept.create("parent");
        parent.containment_0_1 = child;
        const serializationChunk = serializeNodeBases([parent]);
        const {nodes} = serializationChunk;
        equal(nodes.length, 2);
        const serContainment = nodes[0].containments.find(({containment}) => containment.key === metaPointer.key);
        deepEqual(serContainment, {
            containment: metaPointer,
            children: ["child"]
        });

        const deserialize = nodeBaseDeserializer([testLanguageBase]);
        const problemHandler = new AccumulatingSimplisticHandler();
        const deserializedNodes = deserialize(serializationChunk, undefined, undefined, undefined, problemHandler);
        equal(problemHandler.allProblems.length, 0);
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

