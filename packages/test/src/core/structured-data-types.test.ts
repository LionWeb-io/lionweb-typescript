// Copyright 2026 TRUMPF Laser SE and other contributors
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
// SPDX-FileCopyrightText: 2026 TRUMPF Laser SE and other contributors
// SPDX-License-Identifier: Apache-2.0

import {
    AccumulatingProblemReporter,
    consoleProblemReporter,
    deserializeLanguagesFrom,
    LanguageFactory,
    LionWebVersions,
    serializeLanguagesFor,
    StructuredData,
    structuredDataDeserializer,
    structuredDataSerializer,
    StructuredDataType
} from "@lionweb/core"
import { concatenator, lastOf } from "@lionweb/ts-utils"

import { expect } from "chai"
import { Amount, ComplexNumber, Decimal, FaultySDT, languageWithSDTs } from "../languages/with-SDTs.js"
import { deepEqual, equal, isTrue } from "../test-utils/assertions.js"
import {
    decimal42,
    eur42NonDigital,
    exampleComplexNumber,
    simpleDataDeserializer,
    simpleDataSerializer
} from "../instances/with-SDTs.js"


describe("structured data types", () => {

    it("roundtrip (de-)serialization of M2: Language-with-SDTs", () => {
        const serialization = serializeLanguagesFor({ lionWebVersion: LionWebVersions.v2024_1, languages: [languageWithSDTs] })
        const deserialization = deserializeLanguagesFrom({ serializationChunk: serialization, lionWebVersion: LionWebVersions.v2024_1 })
        deepEqual(deserialization.length, 1)
        deepEqual(deserialization[0], languageWithSDTs)
        const language = deserialization[0]
        const entity1 = language.entities[1]
        isTrue(entity1 instanceof StructuredDataType)
        const sdt1 = entity1 as StructuredDataType
        deepEqual(sdt1.name, "Amount")
        deepEqual(sdt1.fields.length, 3)
        const field1 = sdt1.fields[0]
        deepEqual(field1.name, "value")
        deepEqual(field1.type, LionWebVersions.v2024_1.builtinsFacade.primitiveTypes.integerDataType)
    })

    const serialized = structuredDataSerializer(simpleDataSerializer)
    const deserialized = structuredDataDeserializer(simpleDataDeserializer)

    const checkSerializationRoundtrip = (structuredData: StructuredData, structuredDataType: StructuredDataType, expectedSerialization: StructuredData) => {
        const accumulator = new AccumulatingProblemReporter()
        const serialization = serialized(structuredDataType, structuredData, accumulator)
        deepEqual(serialization, expectedSerialization)
        equal(accumulator.allProblems.length, 0)
        const deserialization = deserialized(structuredDataType, serialization, accumulator)
        deepEqual(deserialization, structuredData)
        equal(accumulator.allProblems.length, 0)
    }

    it("roundtrip (de-)serialization (as structured JSON) of an M1: Amount 42 EUR non-digital", () => {
        checkSerializationRoundtrip(
            eur42NonDigital,
            Amount,
            {
                "amount-val":  "42",
                "amount-cur": "cur-eur",
                "digital": "false"
            }
        )
    })

    it("roundtrip (de-)serialization (as structured JSON) of an M1: Decimal 42.0", () => {
        checkSerializationRoundtrip(
            decimal42,
            Decimal,
            {
                "decimal-int": "42",
                "decimal-frac": "0"
            }
        )
    })

    it("roundtrip (de-)serialization (as structured JSON) of an M1: ComplexNumber 23.17 + 42.0i", () => {
        checkSerializationRoundtrip(
            exampleComplexNumber,
            ComplexNumber,
            {
                "complex-real": { "decimal-int": "23", "decimal-frac": "17" },
                "complex-imaginary": { "decimal-int": "42", "decimal-frac": "0" }
            }
        )
    })


    const assertSerializationProblems = (structuredDataType: StructuredDataType, json: StructuredData, ...expectedProblems: string[]) => {
        const accumulator = new AccumulatingProblemReporter()
        serialized(structuredDataType, json, accumulator)
        deepEqual(
            accumulator.allProblems,
            expectedProblems
        )
    }

    it("serialization reports invalid field values", () => {
        assertSerializationProblems(
            ComplexNumber,
            { real: "real bad", imaginary: { int: 1, frac: 2 } },
            `field with name "real" and key "complex-real" in SDT "ComplexNumber" — its value is not structured data despite its type being the SDT "Decimal"`,
        )
    })

    it("serialization reports unresolved field types", () => {
        assertSerializationProblems(
            FaultySDT,
            { typeless: null },
            `field with name "typeless" and key "typeless" in SDT "FaultySDT" has an unresolved type`,
        )
    })

    it("serialization reports missing field values", () => {
        assertSerializationProblems(
            ComplexNumber,
            { real: { int: 1 }, imaginary: { frac: 2 } },
            `field with name "frac" and key "decimal-frac" in SDT "Decimal" is not set in given structure: {"int":1}`,
            `field with name "int" and key "decimal-int" in SDT "Decimal" is not set in given structure: {"frac":2}`
        )
    })

    it("serialization reports values of unknown field", () => {
        assertSerializationProblems(
            Decimal,
            { int: 1, frac: 2, precision: 3 },
            `the following unknown field names were encountered in structured data of SDT type "Decimal": "precision"`
        )
    })


    const assertDeserializationProblems = (structuredDataType: StructuredDataType, json: StructuredData, ...expectedProblems: string[]) => {
        const accumulator = new AccumulatingProblemReporter()
        deserialized(structuredDataType, json, accumulator)
        deepEqual(
            accumulator.allProblems,
            expectedProblems
        )
    }

    it("deserialization reports invalid field values [1/2]", () => {
        assertDeserializationProblems(
            ComplexNumber,
            { "complex-real": false, "complex-imaginary": { "decimal-int": "42", "decimal-frac": "0" } },
            `field with name "real" and key "complex-real" in SDT "ComplexNumber" is not serialized as structured data despite its type being the SDT "Decimal"`
        )
    })

    it("deserialization reports invalid field values [2/2]", () => {
        assertDeserializationProblems(
            ComplexNumber,
            { "complex-real": { "decimal-int": "nothing", "decimal-frac": "false" }, "complex-imaginary": { "decimal-int": 42, "decimal-frac": null } },
            'field with name "int" and key "decimal-int" in SDT "Decimal" doesn’t deserialize as integer from: "nothing"',
            'field with name "frac" and key "decimal-frac" in SDT "Decimal" doesn’t deserialize as integer from: "false"',
            'field with name "int" and key "decimal-int" in SDT "Decimal" is not encoded as string or null in deserialization, but as: 42 (number)',
            'field with name "frac" and key "decimal-frac" in SDT "Decimal" doesn’t deserialize as integer from: "null"'
        )
    })

    it("deserialization reports unresolved field types", () => {
        assertDeserializationProblems(
            FaultySDT,
            { "typeless": null },
            `field with name "typeless" and key "typeless" in SDT "FaultySDT" has an unresolved type`,
        )
    })

    it("deserialization reports missing field values", () => {
        assertDeserializationProblems(
            Decimal,
            { "decimal-int": "42" },
            `field with name "frac" and key "decimal-frac" in SDT "Decimal" is not present in serialization: {"decimal-int":"42"}`
        )
    })

    it("serialization reports values of unknown field", () => {
        assertDeserializationProblems(
            Decimal,
            { "decimal-int": "1", "decimal-frac": "2", "decimal-precision": "3" },
            `the following unknown field keys were encountered in a serialization of an instance of SDT type "Decimal": "decimal-precision"`
        )
    })


    it("fails early with [de-]serializing cyclic structured data", () => {
        const factory = new LanguageFactory("SDTlang", "0", concatenator("-"), lastOf)
        const MySDT = factory.structuredDataType("MySDT")
        factory.field(MySDT, "directCycle").ofType(MySDT)
        // MySDT.directCycle -> MySDT

        const value: StructuredData = {}
        value["directCycle"] = value

        expect(() => {
            serialized(MySDT, value, consoleProblemReporter)
        }).to.throw("unable to serialize cyclic structured data")
        expect(() => {
            deserialized(MySDT, value, consoleProblemReporter)
        }).to.throw("unable to deserialize cyclic structured data")
    })

})

