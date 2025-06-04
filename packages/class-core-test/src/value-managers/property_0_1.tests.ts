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
    collectingDeltaHandler,
    nodeBaseDeserializer,
    PropertyAddedDelta,
    PropertyChangedDelta,
    PropertyDeletedDelta,
    serializeNodeBases
} from "@lionweb/class-core"
import { AccumulatingSimplisticHandler, BuiltinPropertyValueDeserializer } from "@lionweb/core"
import { LionWebJsonMetaPointer } from "@lionweb/json"

import { deepEqual, equal, isTrue } from "../assertions.js"
import { DataTypeTestConcept, TestLanguageBase } from "../gen/TestLanguage.g.js"

const testLanguageBase = TestLanguageBase.INSTANCE


describe("[0..1] string property", () => {

    it("getting an unset [0..1] string property", () => {
        const [handleDelta, deltas] = collectingDeltaHandler();
        const dtc = DataTypeTestConcept.create("dtc", handleDelta);

        // pre-check:
        equal(deltas.length, 0);

        // action+check:
        equal(dtc.stringValue_0_1, undefined);
        equal(deltas.length, 0);
    });

    const metaPointer: LionWebJsonMetaPointer = {
        language: "TestLanguage",
        version: "0",
        key: "DataTypeTestConcept-stringValue_0_1"
    };

    it("serializing and deserializing an unset [0..1] string property", () => {
        const dtc = DataTypeTestConcept.create("dtc");
        const serializationChunk = serializeNodeBases([dtc]);
        const {nodes} = serializationChunk;
        equal(nodes.length, 1);
        equal(nodes[0].properties.length, 0);

        const [handleDelta, deltas] = collectingDeltaHandler();
        const deserialize = nodeBaseDeserializer([testLanguageBase], handleDelta);
        const problemHandler = new AccumulatingSimplisticHandler();
        const deserializedNodes = deserialize(serializationChunk, [], new BuiltinPropertyValueDeserializer(), problemHandler);
        equal(problemHandler.allProblems.length, 0);
        equal(deserializedNodes.length, 1);
        const root = deserializedNodes[0];
        isTrue(root instanceof DataTypeTestConcept);
        const deserializedLtc = root as DataTypeTestConcept;
        equal(deserializedLtc.id, "dtc");
        equal(deserializedLtc.classifier, testLanguageBase.DataTypeTestConcept);
        equal(deserializedLtc.parent, undefined);
        equal(deserializedLtc.stringValue_0_1, undefined);
        equal(deltas.length, 0);
    });

    it("setting a [0..1] string property", () => {
        const [handleDelta, deltas] = collectingDeltaHandler();
        const dtc = DataTypeTestConcept.create("dtc", handleDelta);

        // pre-check:
        equal(deltas.length, 0);

        // action+check:
        dtc.stringValue_0_1 = "foo";
        equal(dtc.stringValue_0_1, "foo");
        equal(deltas.length, 1);
        deepEqual(
            deltas[0],
            new PropertyAddedDelta(dtc, testLanguageBase.DataTypeTestConcept_stringValue_0_1, "foo")
        );
    });

    it("serializing and deserializing a set [0..1] string property", () => {
        const dtc = DataTypeTestConcept.create("dtc");
        dtc.stringValue_0_1 = "foo";
        const serializationChunk = serializeNodeBases([dtc]);
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

        const [handleDelta, deltas] = collectingDeltaHandler();
        const deserialize = nodeBaseDeserializer([testLanguageBase], handleDelta);
        const problemHandler = new AccumulatingSimplisticHandler();
        const deserializedNodes = deserialize(serializationChunk, [], new BuiltinPropertyValueDeserializer(), problemHandler);
        equal(problemHandler.allProblems.length, 0);
        equal(deserializedNodes.length, 1);
        const root = deserializedNodes[0];
        isTrue(root instanceof DataTypeTestConcept);
        const deserializedLtc = root as DataTypeTestConcept;
        equal(deserializedLtc.id, "dtc");
        equal(deserializedLtc.classifier, testLanguageBase.DataTypeTestConcept);
        equal(deserializedLtc.parent, undefined);
        equal(deserializedLtc.stringValue_0_1, "foo");
        equal(deltas.length, 0);
    });

    it("unsetting a [0..1] string property", () => {
        const [handleDelta, deltas] = collectingDeltaHandler();
        const dtc = DataTypeTestConcept.create("dtc", handleDelta);

        // pre-check:
        dtc.stringValue_0_1 = "foo";
        equal(deltas.length, 1);

        // action+check:
        dtc.stringValue_0_1 = undefined;
        equal(dtc.stringValue_0_1, undefined);
        equal(deltas.length, 2);
        deepEqual(
            deltas[1],
            new PropertyDeletedDelta(dtc, testLanguageBase.DataTypeTestConcept_stringValue_0_1, "foo")
        );
    });

    it("changing a [0..1] string property", () => {
        const [handleDelta, deltas] = collectingDeltaHandler();
        const dtc = DataTypeTestConcept.create("dtc", handleDelta);

        // pre-check:
        dtc.stringValue_0_1 = "foo";
        equal(deltas.length, 1);

        // action+check:
        dtc.stringValue_0_1 = "bar";
        equal(dtc.stringValue_0_1, "bar");
        equal(deltas.length, 2);
        deepEqual(
            deltas[1],
            new PropertyChangedDelta(dtc, testLanguageBase.DataTypeTestConcept_stringValue_0_1, "foo", "bar")
        );
    });

});

