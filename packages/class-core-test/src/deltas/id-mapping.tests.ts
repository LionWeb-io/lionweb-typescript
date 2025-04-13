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

import { IdMapping } from "@lionweb/class-core"
import { equal } from "../assertions.js"

import { DatatypeTestConcept, LinkTestConcept } from "../gen/TestLanguage.g.js"

describe("updating ID mapping", () => {
    it("registers children as well", () => {
        const idMapping = new IdMapping({})
        const dtc = DatatypeTestConcept.create("dtc")
        const ltc = LinkTestConcept.create("ltc")
        ltc.containment_1 = dtc
        idMapping.updateWith(ltc)
        equal(idMapping.fromId("dtc"), dtc)
        equal(idMapping.fromId("ltc"), ltc)
    })
})

