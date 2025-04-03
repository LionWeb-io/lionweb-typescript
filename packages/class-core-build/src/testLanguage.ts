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

const DatatypeTestConcept = new Concept(TestLanguage, "DatatypeTestConcept", "DatatypeTestConcept", "DatatypeTestConcept", false)
DatatypeTestConcept.havingFeatures(
    new Property(DatatypeTestConcept, "booleanValue_1", "DatatypeTestConcept-booleanValue_1", "DatatypeTestConcept-booleanValue_1").ofType(builtinPrimitives.booleanDatatype),
    new Property(DatatypeTestConcept, "integerValue_1", "DatatypeTestConcept-integerValue_1", "DatatypeTestConcept-integerValue_1").ofType(builtinPrimitives.integerDatatype),
    new Property(DatatypeTestConcept, "stringValue_1", "DatatypeTestConcept-stringValue_1", "DatatypeTestConcept-stringValue_1").ofType(builtinPrimitives.stringDatatype),
    new Property(DatatypeTestConcept, "enumValue_1", "DatatypeTestConcept-enumValue_1", "DatatypeTestConcept-enumValue_1").ofType(TestEnumeration),
    new Property(DatatypeTestConcept, "booleanValue_0_1", "DatatypeTestConcept-booleanValue_0_1", "DatatypeTestConcept-booleanValue_0_1").ofType(builtinPrimitives.booleanDatatype).isOptional(),
    new Property(DatatypeTestConcept, "integerValue_0_1", "DatatypeTestConcept-integerValue_0_1", "DatatypeTestConcept-integerValue_0_1").ofType(builtinPrimitives.integerDatatype).isOptional(),
    new Property(DatatypeTestConcept, "stringValue_0_1", "DatatypeTestConcept-stringValue_0_1", "DatatypeTestConcept-stringValue_0_1").ofType(builtinPrimitives.stringDatatype).isOptional(),
    new Property(DatatypeTestConcept, "enumValue_0_1", "DatatypeTestConcept-enumValue_0_1", "DatatypeTestConcept-enumValue_0_1").ofType(TestEnumeration).isOptional()
)

const LinkTestConcept = new Concept(TestLanguage, "LinkTestConcept", "LinkTestConcept", "LinkTestConcept", false)
LinkTestConcept.havingFeatures(
    new Containment(LinkTestConcept, "containment_0_1", "LinkTestConcept-containment_0_1", "LinkTestConcept-containment_0_1").ofType(DatatypeTestConcept).isOptional(),
    new Containment(LinkTestConcept, "containment_1", "LinkTestConcept-containment_1", "LinkTestConcept-containment_1").ofType(DatatypeTestConcept),
    new Containment(LinkTestConcept, "containment_0_n", "LinkTestConcept-containment_0_n", "LinkTestConcept-containment_0_n").ofType(DatatypeTestConcept).isOptional().isMultiple(),
    new Containment(LinkTestConcept, "containment_1_n", "LinkTestConcept-containment_1_n", "LinkTestConcept-containment_1_n").ofType(DatatypeTestConcept).isMultiple(),
    new Reference(LinkTestConcept, "reference_0_1", "LinkTestConcept-reference_0_1", "LinkTestConcept-reference_0_1").ofType(DatatypeTestConcept).isOptional(),
    new Reference(LinkTestConcept, "reference_1", "LinkTestConcept-reference_1", "LinkTestConcept-reference_1").ofType(DatatypeTestConcept),
    new Reference(LinkTestConcept, "reference_0_n", "LinkTestConcept-reference_0_n", "LinkTestConcept-reference_0_n").ofType(DatatypeTestConcept).isOptional().isMultiple(),
    new Reference(LinkTestConcept, "reference_1_n", "LinkTestConcept-reference_1_n", "LinkTestConcept-reference_1_n").ofType(DatatypeTestConcept).isMultiple()
)

const TestAnnotation = new Annotation(TestLanguage, "TestAnnotation", "TestAnnotation", "TestAnnotation")
TestAnnotation.annotates = builtinClassifiers.node

TestLanguage.havingEntities(TestEnumeration, SecondTestEnumeration, DatatypeTestConcept, LinkTestConcept, TestAnnotation)

