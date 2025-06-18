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

import { deepDuplicatorFor } from "@lionweb/class-core"
import { equal, isTrue, notEqual } from "./assertions.js"

import { DataTypeTestConcept, LinkTestConcept, TestLanguageBase } from "./gen/TestLanguage.g.js"

describe("deep-duplication", () => {
    it("works", () => {
        const ltc = LinkTestConcept.create("ltc")
        const dtc1 = DataTypeTestConcept.create("dtc1")
        const dtc2 = DataTypeTestConcept.create("dtc2")
        ltc.reference_0_1 = dtc1
        ltc.containment_0_1 = dtc2

        const ltcDuplicate = deepDuplicatorFor([TestLanguageBase.INSTANCE], originalNode => originalNode.id + "-copied")(ltc)[0]

        equal(ltcDuplicate.id, "ltc-copied")
        isTrue(ltcDuplicate instanceof LinkTestConcept)
        equal((ltcDuplicate as LinkTestConcept).reference_0_1, dtc1)
        notEqual((ltcDuplicate as LinkTestConcept).containment_0_1, dtc2)
        equal((ltcDuplicate as LinkTestConcept).containment_0_1?.id, "dtc2-copied")
    })
})

