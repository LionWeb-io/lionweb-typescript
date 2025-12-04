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
    PropertyAddedSerializedDelta,
    serializeDelta
} from "@lionweb/class-core"

import { TestEnumeration, TestLanguageBase } from "@lionweb/class-core-test-language"
import { deepEqual, equal } from "./assertions.js"
import { attachedDataTypeTestConcept } from "./value-managers/tests-helpers.js"

const testLanguageBase = TestLanguageBase.INSTANCE


describe("serializing a delta", () => {

    it("works for changing an enumeration-typed property", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const dttc = attachedDataTypeTestConcept("dttc", receiveDelta);

        // pre-check:
        equal(dttc.enumValue_0_1, undefined);
        equal(deltas.length, 1);

        // action+check:
        dttc.enumValue_0_1 = TestEnumeration.literal1;
        equal(deltas.length, 2);
        deepEqual(deltas[1], new PropertyAddedDelta(dttc, testLanguageBase.DataTypeTestConcept_enumValue_0_1, TestEnumeration.literal1));
        const serializedDelta = serializeDelta(deltas[1]);
        deepEqual(serializedDelta, {
            kind: "PropertyAdded",
            node: "dttc",
            property: { language: testLanguageBase.language.key, version: testLanguageBase.language.version, key: testLanguageBase.DataTypeTestConcept_enumValue_0_1.key },
            value: "TestEnumeration-literal1"
        } as PropertyAddedSerializedDelta);
    });

});

