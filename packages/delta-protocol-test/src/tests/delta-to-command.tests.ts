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

import { collectingDeltaReceiver, PropertyAddedDelta } from "@lionweb/class-core"
import { AddPropertyCommand, deltaToCommandTranslator } from "@lionweb/delta-protocol-common"

import { expect } from "chai"
import {
    DataTypeTestConcept,
    TestEnumeration,
    TestLanguageBase,
    TestPartition
} from "@lionweb/class-core-test-language"

const testLanguageBase = TestLanguageBase.INSTANCE


describe("delta-to-command translator", () => {

    it("works for changing an enumeration-typed property", () => {
        const [receiveDelta, deltas] = collectingDeltaReceiver();
        const partition = TestPartition.create("partition", receiveDelta);
        const dttc = DataTypeTestConcept.create("mg", receiveDelta);
        partition.data = dttc;

        // pre-check:
        expect(dttc.enumValue_0_1).to.equal(undefined);
        expect(deltas.length).to.equal(1);

        // action+check:
        dttc.enumValue_0_1 = TestEnumeration.literal1;
        expect(deltas.length).to.equal(2);
        expect(deltas[1]).to.deep.equal(new PropertyAddedDelta(dttc, testLanguageBase.DataTypeTestConcept_enumValue_0_1, TestEnumeration.literal1));

        const deltaAsCommand = deltaToCommandTranslator();
        const command = deltaAsCommand(deltas[1], "cmd-1");
        expect(command).to.deep.equal({
            messageKind: "AddProperty",
            node: "mg",
            property: { language: testLanguageBase.language.key, version: testLanguageBase.language.version, key: testLanguageBase.DataTypeTestConcept_enumValue_0_1.key },
            newValue: testLanguageBase.TestEnumeration_literal1.key,
            commandId: "cmd-1",
            protocolMessages: []
        } as AddPropertyCommand);
    });

});

