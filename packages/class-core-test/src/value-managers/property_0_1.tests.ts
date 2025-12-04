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
    PropertyAddedDelta,
    PropertyChangedDelta,
    PropertyDeletedDelta,
    serializeNodeBases
} from "@lionweb/class-core"
import { LionWebJsonMetaPointer } from "@lionweb/json"

import { DataTypeTestConcept, TestLanguageBase } from "@lionweb/class-core-test-language"
import { deepEqual, equal, isTrue } from "../assertions.js"
import { attachedDataTypeTestConcept, deserializeNodesAssertingNoProblems } from "./tests-helpers.js"

const testLanguageBase = TestLanguageBase.INSTANCE


describe("[0..1] string property", () => {

    it("getting an unset [0..1] string property", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const node = attachedDataTypeTestConcept("node", receiveDelta);

        // pre-check:
        equal(deltas.length, 1);

        // action+check:
        equal(node.stringValue_0_1, undefined);
        equal(deltas.length, 1);
    });

    const metaPointer: LionWebJsonMetaPointer = {
        language: "TestLanguage",
        version: "0",
        key: "DataTypeTestConcept-stringValue_0_1"
    };

    it("serializing and deserializing an unset [0..1] string property", () => {
        const node = DataTypeTestConcept.create("node");
        const serializationChunk = serializeNodeBases([node]);
        const {nodes} = serializationChunk;
        equal(nodes.length, 1);
        equal(nodes[0].properties.length, 0);

        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const deserializedNodes = deserializeNodesAssertingNoProblems(serializationChunk, receiveDelta);
        equal(deserializedNodes.length, 1);
        const root = deserializedNodes[0];
        isTrue(root instanceof DataTypeTestConcept);
        const deserializedNode = root as DataTypeTestConcept;
        equal(deserializedNode.id, "node");
        equal(deserializedNode.classifier, testLanguageBase.DataTypeTestConcept);
        equal(deserializedNode.parent, undefined);
        equal(deserializedNode.stringValue_0_1, undefined);
        equal(deltas.length, 0);
    });

    it("setting a [0..1] string property", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const node = attachedDataTypeTestConcept("node", receiveDelta);

        // pre-check:
        equal(deltas.length, 1);

        // action+check:
        node.stringValue_0_1 = "foo";
        equal(node.stringValue_0_1, "foo");
        equal(deltas.length, 2);
        deepEqual(
            deltas[1],
            new PropertyAddedDelta(node, testLanguageBase.DataTypeTestConcept_stringValue_0_1, "foo")
        );
    });

    it("serializing and deserializing a set [0..1] string property", () => {
        const node = DataTypeTestConcept.create("node");
        node.stringValue_0_1 = "foo";
        const serializationChunk = serializeNodeBases([node]);
        const {nodes} = serializationChunk;
        equal(nodes.length, 1);
        equal(nodes[0].properties.length, 1);
        deepEqual(
            nodes[0].properties[0],
            {
                property: metaPointer,
                value: "foo"
            }
        );

        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const deserializedNodes = deserializeNodesAssertingNoProblems(serializationChunk, receiveDelta);
        equal(deserializedNodes.length, 1);
        const root = deserializedNodes[0];
        isTrue(root instanceof DataTypeTestConcept);
        const deserializedNode = root as DataTypeTestConcept;
        equal(deserializedNode.id, "node");
        equal(deserializedNode.classifier, testLanguageBase.DataTypeTestConcept);
        equal(deserializedNode.parent, undefined);
        equal(deserializedNode.stringValue_0_1, "foo");
        equal(deltas.length, 0);
    });

    it("unsetting a [0..1] string property", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const node = attachedDataTypeTestConcept("node", receiveDelta);

        // pre-check:
        node.stringValue_0_1 = "foo";
        equal(deltas.length, 2);

        // action+check:
        node.stringValue_0_1 = undefined;
        equal(node.stringValue_0_1, undefined);
        equal(deltas.length, 3);
        deepEqual(
            deltas[2],
            new PropertyDeletedDelta(node, testLanguageBase.DataTypeTestConcept_stringValue_0_1, "foo")
        );
    });

    it("changing a [0..1] string property", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const node = attachedDataTypeTestConcept("node", receiveDelta);

        // pre-check:
        node.stringValue_0_1 = "foo";
        equal(deltas.length, 2);

        // action+check:
        node.stringValue_0_1 = "bar";
        equal(node.stringValue_0_1, "bar");
        equal(deltas.length, 3);
        deepEqual(
            deltas[2],
            new PropertyChangedDelta(node, testLanguageBase.DataTypeTestConcept_stringValue_0_1, "foo", "bar")
        );
    });

});

