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
    ChildMovedAndReplacedFromOtherContainmentDelta,
    ChildReplacedDelta,
    collectingDeltaReceiver
} from "@lionweb/class-core"
import { LionWebId } from "@lionweb/json"

import { equal, latestDeltaAsserter } from "../assertions.js"
import { LinkTestConcept, TestLanguageBase } from "../gen/TestLanguage.g.js"

const testLanguageBase = TestLanguageBase.INSTANCE


describe("containment (mixed)", () => {

    it(`integration test: "MoveAndReplaceChildFromOtherContainment_Single"`, () => {
        const [receiveDeltas, deltas] = collectingDeltaReceiver();
        const newLTC = (id: LionWebId)=>
            LinkTestConcept.create(id, receiveDeltas);
        const assertLatestDelta = latestDeltaAsserter(deltas);
        const partition = newLTC("a");

        // 1] ~AddContainment_0_1: partition.containment_0_1 <- new LTC("containment_0_1")
        const containment_0_1 = newLTC("containment_0_1");
        partition.containment_0_1 = containment_0_1;
        assertLatestDelta(new ChildAddedDelta(partition, testLanguageBase.LinkTestConcept_containment_0_1, 0, containment_0_1));

        // 2] ~AddContainment_0_1_Containment_0_1: partition.containment_0_1.containment_0_1 <- new LTC("containment_0_1_containment_0_1")
        const containment_0_1_containment_0_1 = newLTC("containment_0_1_containment_0_1");
        partition.containment_0_1.containment_0_1 = containment_0_1_containment_0_1;
        assertLatestDelta(new ChildAddedDelta(partition.containment_0_1, testLanguageBase.LinkTestConcept_containment_0_1, 0, containment_0_1_containment_0_1));

        // 3] ~AddContainment_1: partition.containment_1 <- new LTC("containment_1")
        const containment_1 = newLTC("containment_1");
        partition.containment_1 = containment_1;
        assertLatestDelta(new ChildAddedDelta(partition, testLanguageBase.LinkTestConcept_containment_1, 0, containment_1));

        // 4] ~AddContainment_1_Containment_0_1: partition.containment_1.containment_0_1 <- new LTC("containment_1_containment_0_1")
        const containment_1_containment_0_1 = newLTC("containment_1_containment_0_1");
        partition.containment_1.containment_0_1 = containment_1_containment_0_1;
        assertLatestDelta(new ChildAddedDelta(containment_1, testLanguageBase.LinkTestConcept_containment_0_1, 0, containment_1_containment_0_1));

        // 5] ~MoveAndReplaceChildFromOtherContainment_Single: partition.containment_1.containment_0_1.replaceWith({ partition.containment_0_1.containment_0_1 === LTC("containment_0_1_containment_0_1") })
        equal(partition.containment_0_1.containment_0_1, containment_0_1_containment_0_1);
        partition.containment_1.replaceContainment_0_1With(partition.containment_0_1.containment_0_1);
        assertLatestDelta(new ChildMovedAndReplacedFromOtherContainmentDelta(partition.containment_1, testLanguageBase.LinkTestConcept_containment_0_1, 0, partition.containment_0_1.containment_0_1, containment_0_1, testLanguageBase.LinkTestConcept_containment_0_1, 0, containment_1_containment_0_1));
    });

    it(`integration test: "ReplaceChild"`, () => {
        const [receiveDeltas, deltas] = collectingDeltaReceiver();
        const newLTC = (id: LionWebId)=>
            LinkTestConcept.create(id, receiveDeltas);
        const assertLatestDelta = latestDeltaAsserter(deltas);
        const partition = newLTC("a");

        // 1] ~AddContainment_0_1: partition.containment_0_1 <- new LTC("containment_0_1")
        const containment_0_1 = newLTC("containment_0_1");
        partition.containment_0_1 = containment_0_1;
        assertLatestDelta(new ChildAddedDelta(partition, testLanguageBase.LinkTestConcept_containment_0_1, 0, containment_0_1));

        // 2] ~ReplaceContainment_0_1: partition.containment_0_1.replaceWith(new LTC("substitute"))
        const substitute = newLTC("substitute");
        partition.replaceContainment_0_1With(substitute);
        assertLatestDelta(new ChildReplacedDelta(partition, testLanguageBase.LinkTestConcept_containment_0_1, 0, containment_0_1, substitute));
        equal(partition.containment_0_1, substitute);
    });

});

