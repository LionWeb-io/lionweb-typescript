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
    ReferenceAddedDelta,
    ReferenceDeletedDelta,
    ReferenceReplacedDelta,
    serializeNodeBases
} from "@lionweb/class-core"
import { AccumulatingSimplisticHandler, BuiltinPropertyValueDeserializer } from "@lionweb/core"
import { LionWebJsonMetaPointer } from "@lionweb/json"

import { deepEqual, equal, isTrue, isUndefined } from "../assertions.js"
import { DatatypeTestConcept, LinkTestConcept, TestLanguageBase } from "../gen/TestLanguage.g.js"

const testLanguageBase = TestLanguageBase.INSTANCE


describe("[0..1] reference", () => {

    it("getting an unset [0..1] reference", () => {
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const ltc = LinkTestConcept.create("ltc", handleDeltas);

        // pre-check:
        equal(deltas.length, 0);

        // action+check:
        equal(ltc.reference_0_1, undefined);
    });

    it("setting a [0..1] reference", () => {
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const dtc = DatatypeTestConcept.create("dtc", handleDeltas);
        const ltc = LinkTestConcept.create("ltc", handleDeltas);

        // pre-check:
        equal(deltas.length, 0);

        // action+check:
        ltc.reference_0_1 = dtc;
        equal(ltc.reference_0_1, dtc);
        equal(dtc.parent, undefined);
        equal(deltas.length, 1);
        deepEqual(
            deltas[0],
            new ReferenceAddedDelta(ltc, testLanguageBase.LinkTestConcept_reference_0_1, 0, dtc)
        );

        // action+check:
        ltc.reference_0_1 = dtc;
        equal(ltc.reference_0_1, dtc);
        equal(dtc.parent, undefined);
        equal(deltas.length, 1);    // (no new delta)
    });

    it("unsetting a [0..1] reference", () => {
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const dtc = DatatypeTestConcept.create("dtc", handleDeltas);
        const ltc = LinkTestConcept.create("ltc", handleDeltas);

        // pre-check:
        ltc.reference_0_1 = dtc;
        equal(dtc.parent, undefined);
        equal(deltas.length, 1);

        // action+check:
        ltc.reference_0_1 = undefined;
        equal(deltas.length, 2);
        deepEqual(
            deltas[1],
            new ReferenceDeletedDelta(ltc, testLanguageBase.LinkTestConcept_reference_0_1, 0, dtc)
        )
    });

    it("setting a [0..1] reference, replacing an already set target", () => {
        const [handleDeltas, deltas] = collectingDeltaHandler();
        const dtc1 = DatatypeTestConcept.create("dtc1", handleDeltas);
        const dtc2 = DatatypeTestConcept.create("dtc2", handleDeltas);
        const ltc = LinkTestConcept.create("ltc", handleDeltas);

        // pre-check:
        ltc.reference_0_1 = dtc1;
        equal(dtc1.parent, undefined);
        equal(deltas.length, 1);

        // action+check:
        ltc.reference_0_1 = dtc2;
        equal(ltc.reference_0_1, dtc2);
        equal(dtc2.parent, undefined);
        equal(deltas.length, 2);
        deepEqual(
            deltas[1],
            new ReferenceReplacedDelta(ltc, testLanguageBase.LinkTestConcept_reference_0_1, 0, dtc1, dtc2)
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
        const ltc = LinkTestConcept.create("ltc");    // leave .reference_0_1 unset
        const serializationChunk = serializeNodeBases([ltc]);
        const {nodes} = serializationChunk;
        equal(nodes.length, 1);
        const serReference = nodes[0].references.find(({reference}) => reference.key === metaPointer.key);
        isUndefined(serReference);

        const deserialize = nodeBaseDeserializer([testLanguageBase]);
        const problemHandler = new AccumulatingSimplisticHandler();
        const deserializedNodes = deserialize(serializationChunk, [], new BuiltinPropertyValueDeserializer(), problemHandler);
        equal(problemHandler.allProblems.length, 0);
        equal(deserializedNodes.length, 1);
        const root = deserializedNodes[0];
        isTrue(root instanceof LinkTestConcept);
        const deserializedLtc = root as LinkTestConcept;
        equal(deserializedLtc.id, "ltc");
        equal(deserializedLtc.classifier, testLanguageBase.LinkTestConcept);
        equal(deserializedLtc.parent, undefined);
        equal(deserializedLtc.reference_0_1, undefined);
    });

    it("serializes a set reference correctly", () => {
        const dtc = DatatypeTestConcept.create("dtc");
        const ltc = LinkTestConcept.create("ltc");
        ltc.reference_0_1 = dtc;
        const serializationChunk = serializeNodeBases([ltc, dtc]);
        const {nodes} = serializationChunk;
        equal(nodes.length, 2);
        const serReference = nodes[0].references.find(({reference}) => reference.key === metaPointer.key);
        deepEqual(serReference, {
            reference: metaPointer,
            targets: [{
                reference: "dtc",
                resolveInfo: null
            }]
        });

        const deserialize = nodeBaseDeserializer([testLanguageBase]);
        const problemHandler = new AccumulatingSimplisticHandler();
        const deserializedNodes = deserialize(serializationChunk, [], new BuiltinPropertyValueDeserializer(), problemHandler);
        equal(problemHandler.allProblems.length, 0);
        equal(deserializedNodes.length, 2);
        const node1 = deserializedNodes[0];
        isTrue(node1 instanceof LinkTestConcept);
        const deserializedLtc = node1 as LinkTestConcept;
        equal(deserializedLtc.id, "ltc");
        equal(deserializedLtc.classifier, testLanguageBase.LinkTestConcept);
        equal(deserializedLtc.parent, undefined);
        isTrue(deserializedLtc.reference_0_1 instanceof DatatypeTestConcept);
        const deserializedTC = deserializedLtc.reference_0_1 as DatatypeTestConcept;
        equal(deserializedTC.id, "dtc");
        equal(deserializedTC.classifier, testLanguageBase.DatatypeTestConcept);
        equal(deserializedTC.parent, undefined);
    });

});

