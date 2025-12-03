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
    Forest,
    IDelta,
    ObservableForest,
    PartitionAddedDelta,
    PartitionDeletedDelta,
    serializeNodeBases
} from "@lionweb/class-core"

import { TestLanguageBase } from "@lionweb/class-core-test-language"
import { idOf } from "@lionweb/core"
import { when } from "mobx"
import { deepEqual, equal, isTrue, throws } from "./assertions.js"


describe("Forest", () => {

    const testLanguage = TestLanguageBase.INSTANCE

    type Fixture = [forest: Forest, deltas: IDelta[]]

    const fixture = (): Fixture => {
        const [receiveDelta, deltas] = collectingDeltaReceiver()
        const forest = new Forest({ languageBases: [testLanguage], receiveDelta })
        return [forest, deltas]
    }

    it("creating an unattached node doesn’t change the forest’s state, and doesn’t emit deltas", () => {
        const [forest, deltas] = fixture()

        forest.createNode(testLanguage.LinkTestConcept, "ltc")

        deepEqual(forest.partitions, [])
        equal(forest.idMapping.tryFromId("ltc"), undefined)
        deepEqual(deltas, [])
    })

    it("adding a partition", () => {
        const [forest, deltas] = fixture()
        const partition = forest.createNode(testLanguage.PartitionTestConcept, "ptc")
        deepEqual(forest.partitions, [])

        forest.addPartition(partition)

        deepEqual(forest.partitions, [partition])
        equal(forest.idMapping.fromId("ptc"), partition)
        deepEqual(deltas, [new PartitionAddedDelta(partition)])
    })

    it("adding a non-partition as a partition throws", () => {
        const [forest, deltas] = fixture()
        const nonPartition = forest.createNode(testLanguage.NonPartitionTestConcept, "nptc")

        throws(
            () => {
                forest.addPartition(nonPartition)
            },
            "node with ID nptc is a NonPartitionTestConcept which is not a <<partition>> concept"
        )
        equal(forest.idMapping.tryFromId("nptc"), undefined)
        deepEqual(deltas, [])
    })

    it("adding a partition again is idempotent", () => {
        const [forest, deltas] = fixture()
        const partition = forest.createNode(testLanguage.PartitionTestConcept, "ptc")
        forest.addPartition(partition)
        deepEqual(forest.partitions, [partition])
        deepEqual(deltas, [new PartitionAddedDelta(partition)])

        forest.addPartition(partition)

        deepEqual(forest.partitions, [partition])
        equal(forest.idMapping.fromId("ptc"), partition)
        deepEqual(deltas, [new PartitionAddedDelta(partition)])
    })

    it("deleting a partition", () => {
        const [forest, deltas] = fixture()
        const partition = forest.createNode(testLanguage.PartitionTestConcept, "ptc")
        forest.addPartition(partition)
        deepEqual(deltas, [new PartitionAddedDelta(partition)])

        forest.deletePartition(partition)

        deepEqual(forest.partitions, [])
        equal(forest.idMapping.fromId("ptc"), partition)    // partition is still in the ID mapping!
        deepEqual(deltas, [new PartitionAddedDelta(partition), new PartitionDeletedDelta(partition)])
    })

    it("deleting a partition that wasn’t added throws", () => {
        const [forest, deltas] = fixture()
        const partition = forest.createNode(testLanguage.PartitionTestConcept, "ptc")

        throws(
            () => {
                forest.deletePartition(partition)
            },
            "node with id \"ptc\" is not an added partition"
        )

        deepEqual(forest.partitions, [])
        equal(forest.idMapping.tryFromId("ptc"), undefined)    // partition is still in the ID mapping!
        deepEqual(deltas, [])
    })

    it("deserializing into forest", () => {
        const [forest, deltas] = fixture()
        const partition = forest.createNode(testLanguage.PartitionTestConcept, "ptc")
        const nonPartition = forest.createNode(testLanguage.NonPartitionTestConcept, "nptc")
        const serializationChunk = serializeNodeBases([partition, nonPartition])

        forest.deserializeInto(serializationChunk)
        deepEqual(forest.partitions.map(idOf), [partition.id])
        equal(forest.idMapping.tryFromId("ptc")?.id, partition.id)
        deepEqual(forest.idMapping.tryFromId("nptc")?.id, nonPartition.id) // nonPartition is in the ID mapping!
        deepEqual(deltas, [])
    })

    it("using deserializeWithIdMapping doesn’t change the forest’s state, and doesn’t emit deltas", () => {
        const [forest, deltas] = fixture()
        const partition = forest.createNode(testLanguage.PartitionTestConcept, "ptc")
        const nonPartition = forest.createNode(testLanguage.NonPartitionTestConcept, "nptc")
        const serializationChunk = serializeNodeBases([partition, nonPartition])

        const { roots } = forest.deserializeWithIdMapping(serializationChunk)
        equal(roots.length, 2)
        deepEqual(forest.partitions, [])
        equal(forest.idMapping.tryFromId("ptc"), undefined)
        equal(forest.idMapping.tryFromId("nptc"), undefined)
        deepEqual(deltas, [])
    })

    it("applying a partition added delta", () => {
        const [forest, deltas] = fixture()
        deepEqual(forest.partitions, [])
        const partition = forest.createNode(testLanguage.PartitionTestConcept, "ptc")

        forest.applyDelta(new PartitionAddedDelta(partition))

        deepEqual(forest.partitions, [partition])
        equal(forest.idMapping.tryFromId("ptc"), partition)
        deepEqual(deltas, [])
    })

    it("applying a partition deleted delta", () => {
        const [forest, deltas] = fixture()
        const partition = forest.createNode(testLanguage.PartitionTestConcept, "ptc")
        forest.addPartition(partition)
        deepEqual(forest.partitions, [partition])
        deepEqual(deltas, [new PartitionAddedDelta(partition)])

        forest.applyDelta(new PartitionDeletedDelta(partition))

        deepEqual(forest.partitions, [])
        equal(forest.idMapping.tryFromId("ptc"), partition) // partition is still in ID mapping
        deepEqual(deltas, [new PartitionAddedDelta(partition)]) // no partition deleted delta re-emitted
    })

})


describe("ObservableForest", () => {

    const testLanguageBase = TestLanguageBase.INSTANCE

    it("emits observable changes", (done) => {
        const forest = new ObservableForest({ languageBases: [testLanguageBase] })
        const linkTestConcept = forest.createNode(testLanguageBase.LinkTestConcept, "ltt")
        let sawChange = false
        when(() => forest.partitions.length > 0, () => {
            sawChange = true
        })
        forest.addPartition(linkTestConcept)
        equal(forest.partitions[0], linkTestConcept)
        isTrue(sawChange)
        done()
    })

})

