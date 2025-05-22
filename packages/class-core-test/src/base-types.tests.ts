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

import { isSameSet } from "./assertions.js"

import { DatatypeTestConcept, LinkTestConcept } from "./gen/TestLanguage.g.js"

describe("internals of base types", () => {
    it("children", () => {
        const ltc = LinkTestConcept.create("ltc")
        const dtc1 = DatatypeTestConcept.create("dtc1")
        const dtc2 = DatatypeTestConcept.create("dtc2")
        const dtc3 = DatatypeTestConcept.create("dtc3")
        const dtc4 = DatatypeTestConcept.create("dtc4")
        ltc.containment_0_1 = dtc1
        ltc.containment_1 = dtc2
        ltc.addContainment_0_n(dtc3)
        ltc.addContainment_0_n(dtc4)
        ltc.addContainment_1_n(dtc1)
        ltc.addContainment_1_n(dtc2)
        ltc.addContainment_1_n(dtc3)
        ltc.addAnnotation(dtc4)
        isSameSet(ltc.children, [dtc1, dtc2, dtc3, dtc4])
    })

    it("referenceTargets", () => {
        const ltc = LinkTestConcept.create("ltc")
        const dtc1 = DatatypeTestConcept.create("dtc1")
        const dtc2 = DatatypeTestConcept.create("dtc2")
        const dtc3 = DatatypeTestConcept.create("dtc3")
        const dtc4 = DatatypeTestConcept.create("dtc4")
        ltc.reference_0_1 = dtc1
        ltc.reference_1 = dtc2
        ltc.addReference_0_n(dtc3)
        ltc.addReference_0_n(dtc4)
        ltc.addReference_1_n(dtc1)
        ltc.addReference_1_n(dtc2)
        ltc.addReference_1_n(dtc3)
        isSameSet(ltc.referenceTargets, [dtc1, dtc2, dtc3, dtc4])
    })
})

