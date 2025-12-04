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
    INodeBase,
    nodeBaseDeserializer,
    PropertyAddedDelta,
    PropertyChangedDelta,
    serializeNodeBases
} from "@lionweb/class-core"
import { LionWebJsonChunk } from "@lionweb/json"
import { readFileAsJson, writeJsonAsFile } from "@lionweb/utilities"
import { join } from "path"

import {
    DataTypeTestConcept,
    TestEnumeration,
    TestLanguageBase,
    TestPartition
} from "@lionweb/class-core-test-language"
import { deepEqual, equal, isTrue, throws } from "./assertions.js"
import { attachedDataTypeTestConcept } from "./value-managers/tests-helpers.js"


describe("TestConcept", () => {

    const testLanguageBase = TestLanguageBase.INSTANCE

    it("direct instantiation", () => {
        const instance = DataTypeTestConcept.create("foo")
        equal(instance.id, "foo")
        equal(instance.classifier, testLanguageBase.DataTypeTestConcept)
        equal(instance.parent, undefined)
        equal(instance.containment, undefined)
    })

    it("instantiation via factory", () => {
        const instance = testLanguageBase.factory()(testLanguageBase.DataTypeTestConcept, "foo")
        equal(instance.id, "foo")
        equal(instance.classifier, testLanguageBase.DataTypeTestConcept)
        equal(instance.parent, undefined)
        equal(instance.containment, undefined)
    })

    it("getting and setting .stringValue_1", () => {
        const instance = DataTypeTestConcept.create("foo")
        throws(
            () => instance.stringValue_1,
            `can't read required property "stringValue_1" that's unset on instance of TestLanguage.DataTypeTestConcept with id=foo`
        )
        instance.stringValue_1 = "bar"
        equal(instance.stringValue_1, "bar")
        instance.stringValue_1 = "fiddlesticks"
        equal(instance.stringValue_1, "fiddlesticks")
    })

    it("getting and setting .stringValue_1 via a value manager", () => {
        const instance = DataTypeTestConcept.create("foo")
        equal(instance.getPropertyValueManager(testLanguageBase.DataTypeTestConcept_stringValue_1).getDirectly(), undefined)
        instance.stringValue_1 = "bar"
        equal(instance.getPropertyValueManager(testLanguageBase.DataTypeTestConcept_stringValue_1).getDirectly(), "bar")
    })

    it("getting and setting .enumValue_1", () => {
        const instance = DataTypeTestConcept.create("foo")
        throws(
            () => instance.enumValue_1,
            `can't read required property "enumValue_1" that's unset on instance of TestLanguage.DataTypeTestConcept with id=foo`
        )
        instance.enumValue_1 = TestEnumeration.literal1
        equal(instance.enumValue_1, TestEnumeration.literal1)
        instance.enumValue_1 = TestEnumeration.literal2
        equal(instance.enumValue_1, TestEnumeration.literal2)
    })

    it("getting and setting .newValue via a value manager", () => {
        const instance = DataTypeTestConcept.create("foo")
        equal(instance.getPropertyValueManager(testLanguageBase.DataTypeTestConcept_enumValue_1).getDirectly(), undefined)
        instance.enumValue_1 = TestEnumeration.literal3
        equal(instance.getPropertyValueManager(testLanguageBase.DataTypeTestConcept_enumValue_1).getDirectly(), TestEnumeration.literal3)
    })

    it("receiving ∂s when changing .stringValue_1", done => {
        const [deltaReceiver, deltas] = collectingDeltaReceiver()
        const instance = attachedDataTypeTestConcept("foo", deltaReceiver)

        // pre-check:
        equal(deltas.length, 1)

        // action+check:
        instance.stringValue_1 = "bar"
        equal(deltas.length, 2)
        deepEqual(deltas[1], new PropertyAddedDelta(instance, testLanguageBase.DataTypeTestConcept_stringValue_1, "bar"))

        instance.stringValue_1 = "fiddlesticks"
        equal(deltas.length, 3)
        deepEqual(deltas[2], new PropertyChangedDelta(instance, testLanguageBase.DataTypeTestConcept_stringValue_1, "bar", "fiddlesticks"))

        instance.stringValue_1 = "fiddlesticks" // change to the same value
        equal(deltas.length, 3)

        done()
    })

    const artifactsPath = "artifacts"

    const persistSerialization = (nodes: INodeBase[], name: string) => {
        const actual = serializeNodeBases(nodes)
        writeJsonAsFile(join(artifactsPath, `${name}.actual.json`), actual)
        const expected = readFileAsJson(join(artifactsPath, `${name}.expected.json`))
        deepEqual(actual, expected)
    }

    it("can be serialized", () => {
        const instance = DataTypeTestConcept.create("foo")
        persistSerialization([instance], "DataTypeTestConcept-values=undefined")
        instance.stringValue_1 = "bar"
        instance.enumValue_1 = TestEnumeration.literal3
        persistSerialization([instance], "DataTypeTestConcept-value=bar-enumValue_1=literal3")
    })

    it("can be deserialized without sending deltas, but then changes do send deltas", done => {
        const serializationChunk = readFileAsJson(
            join(artifactsPath, "DataTypeTestConcept-value=bar-enumValue_1=literal3.expected.json")
        ) as LionWebJsonChunk
        const [receiveDelta, deltas] = collectingDeltaReceiver()
        const deserialize = nodeBaseDeserializer([testLanguageBase], receiveDelta)
        const nodes = deserialize(serializationChunk)
        equal(deltas.length, 0)
        equal(nodes.length, 1)
        const node1 = nodes[0]
        equal(node1.id, "foo")
        equal(node1.classifier, testLanguageBase.DataTypeTestConcept)
        equal(node1.parent, undefined)
        equal(node1.containment, undefined)
        isTrue(node1 instanceof DataTypeTestConcept)
        const instance = node1 as DataTypeTestConcept
        const partition = TestPartition.create("partition", receiveDelta)
        partition.data = instance
        equal(instance.stringValue_1, "bar")
        equal(instance.enumValue_1, TestEnumeration.literal3)
        equal(deltas.length, 1)
        deepEqual(deltas[0], new ChildAddedDelta(partition, testLanguageBase.TestPartition_data, 0, instance))
        instance.stringValue_1 = "fiddlesticks"
        equal(deltas.length, 2)
        deepEqual(deltas[1], new PropertyChangedDelta(instance, testLanguageBase.DataTypeTestConcept_stringValue_1, "bar", "fiddlesticks"))
        instance.enumValue_1 = TestEnumeration.literal2
        equal(deltas.length, 3)
        deepEqual(deltas[2], new PropertyChangedDelta(instance, testLanguageBase.DataTypeTestConcept_enumValue_1, TestEnumeration.literal3, TestEnumeration.literal2))
        done()
    })

})

