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
    collectingDeltaReceiver,
    ReferenceAddedDelta,
    ReferenceChangedDelta
} from "@lionweb/class-core"
import { LionWebId } from "@lionweb/json"

import { LinkTestConcept, TestLanguageBase, TestPartition } from "@lionweb/class-core-test-language"
import { latestDeltaAsserter } from "../assertions.js"

const testLanguageBase = TestLanguageBase.INSTANCE

describe("reference (mixed)", () => {

    it(`integration test: "ChangeReference"`, () => {
        const [receiveDeltas, deltas] = collectingDeltaReceiver();
        const newLTC = (id: LionWebId)=>
            LinkTestConcept.create(id, receiveDeltas);
        const topLTC = newLTC("a");
        const partition = TestPartition.create("partition", receiveDeltas)
        partition.addLinks(topLTC)
        const assertLatestDelta = latestDeltaAsserter(deltas);

        // 1] ~AddContainment_0_1: topLTC.containment_0_1 <- new LTC("containment_0_1")
        const containment_0_1 = newLTC("containment_0_1");
        topLTC.containment_0_1 = containment_0_1;
        assertLatestDelta(new ChildAddedDelta(topLTC, testLanguageBase.LinkTestConcept_containment_0_1, 0, containment_0_1));

        // 2] ~AddContainment_1: topLTC.containment_1 <- new LTC("containment_1")
        const containment_1 = newLTC("containment_1");
        topLTC.containment_1 = containment_1;
        assertLatestDelta(new ChildAddedDelta(topLTC, testLanguageBase.LinkTestConcept_containment_1, 0, containment_1));

        // 3] ~AddReference_0_1_to_Containment_0_1: topLTC.reference_0_1 = topLTC.containment_0_1
        topLTC.reference_0_1 = topLTC.containment_0_1;
        assertLatestDelta(new ReferenceAddedDelta(topLTC, testLanguageBase.LinkTestConcept_reference_0_1, 0, containment_0_1));

        // 4] ~AddReference_0_1_to_Containment_1: topLTC.reference_0_1 = topLTC.containment_1
        topLTC.reference_0_1 = topLTC.containment_1;
        assertLatestDelta(new ReferenceChangedDelta(topLTC, testLanguageBase.LinkTestConcept_reference_0_1, 0, containment_1, containment_0_1));
    });

});

