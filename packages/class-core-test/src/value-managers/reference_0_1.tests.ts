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
    collectingDeltaReceiver,
    ReferenceAddedDelta,
    ReferenceChangedDelta,
    ReferenceDeletedDelta,
    serializeNodeBases
} from "@lionweb/class-core"
import { LionWebJsonMetaPointer } from "@lionweb/json"

import { attachedLinkTestConcept, LinkTestConcept, TestLanguageBase } from "@lionweb/class-core-test-language"
import { deepEqual, equal, isTrue, isUndefined } from "../assertions.js"
import { deserializeNodesAssertingNoProblems } from "./tests-helpers.js"

const testLanguageBase = TestLanguageBase.INSTANCE


describe("[0..1] reference", () => {

    it("getting an unset [0..1] reference", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const node = LinkTestConcept.create("node", receiveDelta);

        // pre-check:
        equal(deltas.length, 0);

        // action+check:
        equal(node.reference_0_1, undefined);
    });

    it("setting a [0..1] reference", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const dst = LinkTestConcept.create("dst", receiveDelta);
        const src = attachedLinkTestConcept("src", receiveDelta);

        // pre-check:
        equal(deltas.length, 1);

        // action+check:
        src.reference_0_1 = dst;
        equal(src.reference_0_1, dst);
        equal(dst.parent, undefined);
        equal(deltas.length, 2);
        deepEqual(
            deltas[1],
            new ReferenceAddedDelta(src, testLanguageBase.LinkTestConcept_reference_0_1, 0, dst)
        );

        // action+check:
        src.reference_0_1 = dst;
        equal(src.reference_0_1, dst);
        equal(dst.parent, undefined);
        equal(deltas.length, 2);    // (no new delta)
    });

    it("unsetting a [0..1] reference", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const dst = LinkTestConcept.create("dst", receiveDelta);
        const src = attachedLinkTestConcept("src", receiveDelta);

        // pre-check:
        src.reference_0_1 = dst;
        equal(dst.parent, undefined);
        equal(deltas.length, 2);

        // action+check:
        src.reference_0_1 = undefined;
        equal(deltas.length, 3);
        deepEqual(
            deltas[2],
            new ReferenceDeletedDelta(src, testLanguageBase.LinkTestConcept_reference_0_1, 0, dst)
        )
    });

    it("setting a [0..1] reference, replacing an already set target", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const dst1 = LinkTestConcept.create("dst1", receiveDelta);
        const dst2 = LinkTestConcept.create("dst2", receiveDelta);
        const src = attachedLinkTestConcept("src", receiveDelta);

        // pre-check:
        src.reference_0_1 = dst1;
        equal(dst1.parent, undefined);
        equal(deltas.length, 2);

        // action+check:
        src.reference_0_1 = dst2;
        equal(src.reference_0_1, dst2);
        equal(dst2.parent, undefined);
        equal(deltas.length, 3);
        deepEqual(
            deltas[2],
            new ReferenceChangedDelta(src, testLanguageBase.LinkTestConcept_reference_0_1, 0, dst2, dst1)
        );
    });

});


describe("serialization and deserialization w.r.t. a [0..1] reference", () => {

    const metaPointer: LionWebJsonMetaPointer = {
        language: "TestLanguage",
        version: "0",
        key: "LinkTestConcept-reference_0_1"
    };

    it("serializes and deserializes an unset reference correctly", () => {
        const node = LinkTestConcept.create("node");    // leave .reference_0_1 unset
        const serializationChunk = serializeNodeBases([node]);
        const {nodes} = serializationChunk;
        equal(nodes.length, 1);
        const serReference = nodes[0].references.find(({reference}) => reference.key === metaPointer.key);
        isUndefined(serReference);

        const deserializedNodes = deserializeNodesAssertingNoProblems(serializationChunk);
        equal(deserializedNodes.length, 1);
        const root = deserializedNodes[0];
        isTrue(root instanceof LinkTestConcept);
        const deserializedNode = root as LinkTestConcept;
        equal(deserializedNode.id, "node");
        equal(deserializedNode.classifier, testLanguageBase.LinkTestConcept);
        equal(deserializedNode.parent, undefined);
        equal(deserializedNode.reference_0_1, undefined);
    });

    it("serializes a set reference correctly", () => {
        const dst = LinkTestConcept.create("dst");
        const src = LinkTestConcept.create("src");
        src.reference_0_1 = dst;
        const serializationChunk = serializeNodeBases([src, dst]);
        const {nodes} = serializationChunk;
        equal(nodes.length, 2);
        const serReference = nodes[0].references.find(({reference}) => reference.key === metaPointer.key);
        deepEqual(serReference, {
            reference: metaPointer,
            targets: [{
                reference: "dst",
                resolveInfo: null
            }]
        });

        const deserializedNodes = deserializeNodesAssertingNoProblems(serializationChunk);
        equal(deserializedNodes.length, 2);
        const node1 = deserializedNodes[0];
        isTrue(node1 instanceof LinkTestConcept);
        const deserializedSrc = node1 as LinkTestConcept;
        equal(deserializedSrc.id, "src");
        equal(deserializedSrc.classifier, testLanguageBase.LinkTestConcept);
        equal(deserializedSrc.parent, undefined);
        isTrue(deserializedSrc.reference_0_1 instanceof LinkTestConcept);
        const deserializedDst = deserializedSrc.reference_0_1 as LinkTestConcept;
        equal(deserializedDst.id, "dst");
        equal(deserializedDst.classifier, testLanguageBase.LinkTestConcept);
        equal(deserializedDst.parent, undefined);
    });

});

