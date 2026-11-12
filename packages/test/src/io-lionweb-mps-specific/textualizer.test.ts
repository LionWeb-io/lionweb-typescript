// Copyright 2026 TRUMPF Laser SE and other contributors
//
// Licensed under the Apache License, Version 2.0 (the "License");
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
    Classifier,
    ConceptModifier,
    Enumeration,
    EnumerationLiteral,
    Feature,
    LanguageFactory,
    Node
} from "@lionweb/core"
import { TestLanguageBase } from "@lionweb/class-core-test-language"
import {
    ConceptDescription,
    Deprecated,
    ioLionWebMpsSpecificLanguage,
    KeyedDescription,
    ShortDescription,
    textualizationOfAnnotationsIn,
    VirtualPackage
} from "@lionweb/io-lionweb-mps-specific"
import { concatenator } from "@lionweb/ts-utils"

import { equal } from "../test-utils/assertions.js"


describe("io.lionweb.mps.specific textualizer (textualizationOfAnnotationsIn)", () => {

    it("returns empty string for empty language array", () => {
        equal(textualizationOfAnnotationsIn([]), "")
    })

    it("textualizes the io.lionweb.mps.specific language itself", () => {
        equal(textualizationOfAnnotationsIn([ioLionWebMpsSpecificLanguage]), "")
        // (ioLionWebMpsSpecificLanguage has itself no annotations)
    })

    const removeAnnotationsFrom = (node: Node) => {
        node.annotations.splice(0, node.annotations.length)
    }

    it("textualizes all annotation types on TestLanguage", () => {
        const testLanguage = TestLanguageBase.INSTANCE.language

        const dataTypeConcept = testLanguage.entities.find(e => e.name === "DataTypeTestConcept") as Classifier
        const linkConcept = testLanguage.entities.find(e => e.name === "LinkTestConcept") as Classifier
        const testPartition = testLanguage.entities.find(e => e.name === "TestPartition") as Classifier
        const testEnum = testLanguage.entities.find(e => e.name === "TestEnumeration") as Enumeration
        const literal1 = testEnum.literals.find((l: EnumerationLiteral) => l.name === "literal1")!

        // add annotations:
        const conceptDesc = new ConceptDescription("cd-1")
        conceptDesc.conceptAlias = "alias"
        conceptDesc.conceptShortDescription = "short desc"
        conceptDesc.helpUrl = "https://example.com"
        dataTypeConcept.annotations.push(conceptDesc)

        const deprecated = new Deprecated("dep-1")
        deprecated.comment = "Use NewConcept instead"
        deprecated.build = "1.2.3"
        linkConcept.annotations.push(deprecated)

        const shortDesc = new ShortDescription("sd-1")
        shortDesc.description = "A short description"
        testPartition.annotations.push(shortDesc)

        const keyedDesc = new KeyedDescription("kd-1")
        keyedDesc.documentation = "Detailed documentation"
        keyedDesc.seeAlso.push(linkConcept)
        dataTypeConcept.annotations.push(keyedDesc)

        const virtualPackage = new VirtualPackage("vp-1")
        virtualPackage.name = "my-package"
        dataTypeConcept.annotations.push(virtualPackage)

        const literalDesc = new ShortDescription("sd-lit1")
        literalDesc.description = "First literal"
        literal1.annotations.push(literalDesc)

        try {
            equal(
                textualizationOfAnnotationsIn([testLanguage]),
`language TestLanguage:
    enumeration TestEnumeration:
        enumeration literal literal1:
            @ShortDescription:
                description: First literal
    concept DataTypeTestConcept:
        @ConceptDescription:
            short description: short desc
            alias: alias
            help URL: https://example.com
        @KeyedDescription: 
            documentation: Detailed documentation
            see also:
                concept LinkTestConcept in language TestLanguage
        @VirtualPackage:
            name: my-package
    concept LinkTestConcept:
        @Deprecated:
            comment: Use NewConcept instead
            build: 1.2.3
    concept TestPartition:
        @ShortDescription:
            description: A short description
`
            )
        } finally {
            // remove annotations again to not pollute the singleton TestLanguage language:
            for (const node of [ dataTypeConcept, linkConcept, testPartition, literal1 ]) {
                removeAnnotationsFrom(node)
            }
        }
    })

    it("textualizes annotations with no properties showing (no info)", () => {
        const testLanguage = TestLanguageBase.INSTANCE.language
        const concept = testLanguage.entities.find(e => e.name === "DataTypeTestConcept") as Classifier

        try {
            concept.annotations.push(new ConceptDescription("cd-empty"))
            concept.annotations.push(new Deprecated("dep-empty"))
            concept.annotations.push(new ShortDescription("sd-empty"))
            concept.annotations.push(new KeyedDescription("kd-empty"))

            equal(
                textualizationOfAnnotationsIn([testLanguage]),
`language TestLanguage:
    concept DataTypeTestConcept:
        @ConceptDescription: (no info)
        @Deprecated: (no info)
        @ShortDescription: (no info)
        @KeyedDescription: (no info)
`
            )
        } finally {
            // clean up:
            removeAnnotationsFrom(concept)
        }
    })

    it("textualizes annotations on various language element types", () => {
        const testLanguage = TestLanguageBase.INSTANCE.language
        const dataTypeConcept = testLanguage.entities.find(e => e.name === "DataTypeTestConcept") as Classifier
        const enumType = testLanguage.entities.find(e => e.name === "TestEnumeration") as Enumeration
        const literal1 = enumType.literals.find((l: EnumerationLiteral) => l.name === "literal1")!

        try {
            const prop = dataTypeConcept.features.find((f: Feature) => f.name === "stringValue_1")!
            const deprecatedProp = new Deprecated("prop-dep")
            deprecatedProp.comment = "property deprecated"
            prop.annotations.push(deprecatedProp)

            const literalDesc = new ShortDescription("lit-desc")
            literalDesc.description = "literal description"
            literal1.annotations.push(literalDesc)

            equal(
                textualizationOfAnnotationsIn([testLanguage]),
`language TestLanguage:
    enumeration TestEnumeration:
        enumeration literal literal1:
            @ShortDescription:
                description: literal description
    concept DataTypeTestConcept:
        property stringValue_1:
            @Deprecated:
                comment: property deprecated
`
            )
        } finally {
            // clean up:
            const property = dataTypeConcept.features.find(({ name }) => name === "stringValue_1")!
            removeAnnotationsFrom(property)
            removeAnnotationsFrom(literal1)
        }
    })

    it("handles multiple languages with annotations", () => {
        const idAndKeyGenerator = concatenator("-")
        const factory1 = new LanguageFactory("Lang1", "1", idAndKeyGenerator, idAndKeyGenerator)
        const concept1 = factory1.concept("Concept1", ConceptModifier.concrete)
        const desc1 = new ShortDescription("desc1")
        desc1.description = "First language concept"
        concept1.annotations.push(desc1)

        const factory2 = new LanguageFactory("Lang2", "1", idAndKeyGenerator, idAndKeyGenerator)
        const concept2 = factory2.concept("Concept2", ConceptModifier.concrete)
        const desc2 = new ShortDescription("desc2")
        desc2.description = "Second language concept"
        concept2.annotations.push(desc2)

        equal(
            textualizationOfAnnotationsIn([factory1.language, factory2.language]),
`language Lang1:
    concept Concept1:
        @ShortDescription:
            description: First language concept
language Lang2:
    concept Concept2:
        @ShortDescription:
            description: Second language concept
`
        )
    })

})

