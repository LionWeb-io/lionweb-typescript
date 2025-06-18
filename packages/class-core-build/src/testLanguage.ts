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
    Annotation,
    builtinClassifiers,
    builtinPrimitives,
    Concept,
    Containment,
    Enumeration,
    EnumerationLiteral,
    Language,
    Property,
    Reference
} from "@lionweb/core"

export const TestLanguage = new Language("TestLanguage", "0", "TestLanguage", "TestLanguage")

const TestEnumeration = new Enumeration(TestLanguage, "TestEnumeration", "TestEnumeration", "TestEnumeration")
TestEnumeration.havingLiterals(
    ...([1, 2, 3].map((i) => new EnumerationLiteral(TestEnumeration, `literal${i}`, `TestEnumeration-literal${i}`, `TestEnumeration-literal${i}`)))
)

const SecondTestEnumeration = new Enumeration(TestLanguage, "SecondTestEnumeration", "SecondTestEnumeration", "SecondTestEnumeration")
SecondTestEnumeration.havingLiterals(
    ...([1, 2, 3].map((i) => new EnumerationLiteral(SecondTestEnumeration, `literal${i}`, `SecondTestEnumeration-literal${i}`, `SecondTestEnumeration-literal${i}`)))
)

const DataTypeTestConcept = new Concept(TestLanguage, "DataTypeTestConcept", "DataTypeTestConcept", "DataTypeTestConcept", false)
DataTypeTestConcept.havingFeatures(
    new Property(DataTypeTestConcept, "booleanValue_1", "DataTypeTestConcept-booleanValue_1", "DataTypeTestConcept-booleanValue_1").ofType(builtinPrimitives.booleanDataType),
    new Property(DataTypeTestConcept, "integerValue_1", "DataTypeTestConcept-integerValue_1", "DataTypeTestConcept-integerValue_1").ofType(builtinPrimitives.integerDataType),
    new Property(DataTypeTestConcept, "stringValue_1", "DataTypeTestConcept-stringValue_1", "DataTypeTestConcept-stringValue_1").ofType(builtinPrimitives.stringDataType),
    new Property(DataTypeTestConcept, "enumValue_1", "DataTypeTestConcept-enumValue_1", "DataTypeTestConcept-enumValue_1").ofType(TestEnumeration),
    new Property(DataTypeTestConcept, "booleanValue_0_1", "DataTypeTestConcept-booleanValue_0_1", "DataTypeTestConcept-booleanValue_0_1").ofType(builtinPrimitives.booleanDataType).isOptional(),
    new Property(DataTypeTestConcept, "integerValue_0_1", "DataTypeTestConcept-integerValue_0_1", "DataTypeTestConcept-integerValue_0_1").ofType(builtinPrimitives.integerDataType).isOptional(),
    new Property(DataTypeTestConcept, "stringValue_0_1", "DataTypeTestConcept-stringValue_0_1", "DataTypeTestConcept-stringValue_0_1").ofType(builtinPrimitives.stringDataType).isOptional(),
    new Property(DataTypeTestConcept, "enumValue_0_1", "DataTypeTestConcept-enumValue_0_1", "DataTypeTestConcept-enumValue_0_1").ofType(TestEnumeration).isOptional()
)

const LinkTestConcept = new Concept(TestLanguage, "LinkTestConcept", "LinkTestConcept", "LinkTestConcept", false)
LinkTestConcept.havingFeatures(
    new Containment(LinkTestConcept, "containment_0_1", "LinkTestConcept-containment_0_1", "LinkTestConcept-containment_0_1").ofType(DataTypeTestConcept).isOptional(),
    new Containment(LinkTestConcept, "containment_1", "LinkTestConcept-containment_1", "LinkTestConcept-containment_1").ofType(DataTypeTestConcept),
    new Containment(LinkTestConcept, "containment_0_n", "LinkTestConcept-containment_0_n", "LinkTestConcept-containment_0_n").ofType(DataTypeTestConcept).isOptional().isMultiple(),
    new Containment(LinkTestConcept, "containment_1_n", "LinkTestConcept-containment_1_n", "LinkTestConcept-containment_1_n").ofType(DataTypeTestConcept).isMultiple(),
    new Reference(LinkTestConcept, "reference_0_1", "LinkTestConcept-reference_0_1", "LinkTestConcept-reference_0_1").ofType(DataTypeTestConcept).isOptional(),
    new Reference(LinkTestConcept, "reference_1", "LinkTestConcept-reference_1", "LinkTestConcept-reference_1").ofType(DataTypeTestConcept),
    new Reference(LinkTestConcept, "reference_0_n", "LinkTestConcept-reference_0_n", "LinkTestConcept-reference_0_n").ofType(DataTypeTestConcept).isOptional().isMultiple(),
    new Reference(LinkTestConcept, "reference_1_n", "LinkTestConcept-reference_1_n", "LinkTestConcept-reference_1_n").ofType(DataTypeTestConcept).isMultiple()
)

const TestAnnotation = new Annotation(TestLanguage, "TestAnnotation", "TestAnnotation", "TestAnnotation")
TestAnnotation.annotates = builtinClassifiers.node

TestLanguage.havingEntities(TestEnumeration, SecondTestEnumeration, DataTypeTestConcept, LinkTestConcept, TestAnnotation)

