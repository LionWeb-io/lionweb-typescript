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
import { equal, throws } from "../assertions.js"

import { LinkTestConcept } from "../gen/TestLanguage.g.js"
import { unresolved } from "@lionweb/core"

describe("updating ID mapping", () => {
    it("registers children as well", () => {
        const idMapping = new IdMapping({})
        const child = LinkTestConcept.create("child")
        const parent = LinkTestConcept.create("parent")
        parent.containment_1 = child
        idMapping.updateWith(parent)
        equal(idMapping.fromId("child"), child)
        equal(idMapping.fromId("parent"), parent)
    })
})

describe("ID mapping", () => {

    it("fromRefId", () => {
        const idMapping = new IdMapping({})
        equal(idMapping.fromRefId(unresolved), unresolved)

        const node = LinkTestConcept.create("node")
        idMapping.updateWith(node)
        equal(idMapping.fromRefId("node"), node)
        equal(idMapping.fromRefId("foo"), unresolved)
    })

    it("fromId", () => {
        const idMapping = new IdMapping({})
        const node = LinkTestConcept.create("node")
        idMapping.updateWith(node)

        equal(idMapping.fromId("node"), node)
        throws(
            () => {
                idMapping.fromId("bar")
            },
            `node with id=bar not in ID mapping`
        )
    })

    it("tryFromId", () => {
        const idMapping = new IdMapping({})
        const node = LinkTestConcept.create("node")
        idMapping.updateWith(node)

        equal(idMapping.tryFromId("node"), node)
        equal(idMapping.tryFromId("foo"), undefined)
    })

    it("updating ID mapping registers children as well", () => {
        const idMapping = new IdMapping({})
        const child = LinkTestConcept.create("child")
        const parent = LinkTestConcept.create("parent")
        parent.containment_1 = child
        idMapping.updateWith(parent)
        equal(idMapping.fromId("child"), child)
        equal(idMapping.fromId("parent"), parent)
    })

})

