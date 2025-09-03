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
import { AccumulatingSimplisticHandler, BuiltinPropertyValueDeserializer } from "@lionweb/core"
import { LionWebJsonMetaPointer } from "@lionweb/json"

import { deepEqual, equal, isTrue, isUndefined, throws } from "../assertions.js"
import { LinkTestConcept, TestLanguageBase } from "../gen/TestLanguage.g.js"

const testLanguageBase = TestLanguageBase.INSTANCE


describe("[1] containment", () => {

    it("getting an unset required containment throws", () => {
        const [receiveDeltas, deltas] = collectingDeltaReceiver();
        const node = LinkTestConcept.create("node", receiveDeltas);

        // pre-check:
        equal(deltas.length, 0);

        // action+check:
        throws(
            () => {
                equal(node.containment_1, undefined);
            },
            `can't read required containment "containment_1" that's unset on instance of TestLanguage.LinkTestConcept with id=node`
        );
    });

    it("setting a single value works", () => {
        const [receiveDeltas, deltas] = collectingDeltaReceiver();
        const child = LinkTestConcept.create("child", receiveDeltas);
        const parent = LinkTestConcept.create("parent", receiveDeltas);

        // pre-check:
        equal(deltas.length, 0);

        // action+check:
        parent.containment_1 = child;
        equal(parent.containment_1, child);
        equal(child.parent, parent);
        equal(deltas.length, 1);
        deepEqual(
            deltas[0],
            new ChildAddedDelta(parent, testLanguageBase.LinkTestConcept_containment_1, 0, child)
        );
    });

    it("unsetting a single value throws", () => {
        const child = LinkTestConcept.create("child");
        const parent = LinkTestConcept.create("parent");

        // action+check:
        parent.containment_1 = child;
        throws(
            () => {
                // @ts-expect-error Doesn't compile, but we want to test the behavior anyway.
                parent.containment_1 = undefined;
            },
            `can't unset required containment "containment_1" on instance of TestLanguage.LinkTestConcept with id=parent`
        );
    });

    it("moving a child in 1 step between parents", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const child = LinkTestConcept.create("child", receiveDelta);
        const srcParent = LinkTestConcept.create("srcParent", receiveDelta);
        const dstParent = LinkTestConcept.create("dstParent", receiveDelta);

        // action+check:
        srcParent.containment_1 = child;
        equal(srcParent.containment_1, child);
        equal(child.parent, srcParent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_1);
        throws(
            () => {
                equal(dstParent.containment_1, undefined);
            },
            `can't read required containment "containment_1" that's unset on instance of TestLanguage.LinkTestConcept with id=dstParent`
        );
        equal(deltas.length, 1);
        deepEqual(deltas[0], new ChildAddedDelta(srcParent, testLanguageBase.LinkTestConcept_containment_1, 0, child));

        // action+check:
        dstParent.containment_1 = child;
        equal(child.parent, dstParent);
        equal(child.containment, testLanguageBase.LinkTestConcept_containment_1);
        throws(
            () => {
                equal(srcParent.containment_1, undefined);
            },
            `can't read required containment "containment_1" that's unset on instance of TestLanguage.LinkTestConcept with id=srcParent`
        );
        equal(deltas.length, 2);
        deepEqual(deltas[1], new ChildMovedFromOtherContainmentDelta(srcParent, testLanguageBase.LinkTestConcept_containment_1, 0, dstParent, testLanguageBase.LinkTestConcept_containment_1, 0, child));
    });

    it("moving a child (through a [1] containment) directly between parents, replacing an already-present child", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const childAlreadyAssigned = LinkTestConcept.create("childAlreadyAssigned", receiveDelta);
        const dstParent = LinkTestConcept.create("dstParent", receiveDelta);
        dstParent.containment_1 = childAlreadyAssigned;
        const srcParent = LinkTestConcept.create("srcParent", receiveDelta);
        const childToMove = LinkTestConcept.create("childToMove", receiveDelta);
        srcParent.containment_1 = childToMove;

        // pre-check:
        equal(deltas.length, 2);

        // action+check:
        dstParent.containment_1 = childToMove;
        throws(
            () => {
                equal(srcParent.containment_1, undefined);
            },
            `can't read required containment "containment_1" that's unset on instance of TestLanguage.LinkTestConcept with id=srcParent`
        );

        equal(dstParent.containment_1, childToMove);
        equal(childToMove.parent, dstParent);
        equal(childAlreadyAssigned.parent, undefined);
        equal(deltas.length, 4);
        const indices = deltas[2] instanceof ChildReplacedDelta ? [2, 3] : [3, 2];
        deepEqual(deltas[indices[0]], new ChildReplacedDelta(dstParent, testLanguageBase.LinkTestConcept_containment_1, 0, childAlreadyAssigned, childToMove));
        deepEqual(deltas[indices[1]], new ChildDeletedDelta(dstParent, testLanguageBase.LinkTestConcept_containment_1, 0, childAlreadyAssigned));
    });

});


describe("serialization and deserialization w.r.t. a [1] containment", () => {

    const metaPointer: LionWebJsonMetaPointer = {
        language: "TestLanguage",
        version: "0",
        key: "LinkTestConcept-containment_1"
    };

    it("serializes and deserializes an unset containment correctly", () => {
        const node = LinkTestConcept.create("node");    // leave .containment_1 unset
        const serializationChunk = serializeNodeBases([node]);
        const {nodes} = serializationChunk;
        equal(nodes.length, 1);
        const serContainment = nodes[0].containments.find(({containment}) => containment.key === metaPointer.key);
        isUndefined(serContainment);

        const deserialize = nodeBaseDeserializer([testLanguageBase]);
        const problemHandler = new AccumulatingSimplisticHandler();
        const deserializedNodes = deserialize(serializationChunk, [], new BuiltinPropertyValueDeserializer(), problemHandler);
        equal(problemHandler.allProblems.length, 0);
        equal(deserializedNodes.length, 1);
        const root = deserializedNodes[0];
        isTrue(root instanceof LinkTestConcept);
        const deserializedNode = root as LinkTestConcept;
        equal(deserializedNode.id, "node");
        equal(deserializedNode.classifier, testLanguageBase.LinkTestConcept);
        equal(deserializedNode.parent, undefined);
        throws(
            () => {
                equal(deserializedNode.containment_1, undefined);
            },
            `can't read required containment "containment_1" that's unset on instance of TestLanguage.LinkTestConcept with id=node`
        );
    });

    it("serializes a set containment correctly", () => {
        const child = LinkTestConcept.create("child");
        const parent = LinkTestConcept.create("parent");
        parent.containment_1 = child;
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
        const deserializedNodes = deserialize(serializationChunk, [], new BuiltinPropertyValueDeserializer(), problemHandler);
        equal(problemHandler.allProblems.length, 0);
        equal(deserializedNodes.length, 1); // (because there's only one “root”)
        const root = deserializedNodes[0];
        isTrue(root instanceof LinkTestConcept);
        const deserializedParent = root as LinkTestConcept;
        equal(deserializedParent.id, "parent");
        equal(deserializedParent.classifier, testLanguageBase.LinkTestConcept);
        equal(deserializedParent.parent, undefined);
        isTrue(deserializedParent.containment_1 instanceof LinkTestConcept);
        const deserializedChild = deserializedParent.containment_1;
        equal(deserializedChild.id, "child");
        equal(deserializedChild.classifier, testLanguageBase.LinkTestConcept);
        equal(deserializedChild.parent, deserializedParent);
    });

});

