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

import { languageFileFor } from "@lionweb/class-core-generator/dist/language-file.templates.js"
import { generateApiFromLanguages, generateLanguage } from "@lionweb/class-core-generator"
import { ConceptModifier, LanguageFactory, LionWebVersions } from "@lionweb/core"
import { ioLionWebMpsSpecificLanguage } from "@lionweb/io-lionweb-mps-specific"
import { concatenator } from "@lionweb/ts-utils"
import { isTrue } from "./assertions.js"

describe(`class-core generator`, () => {

    const lionWebVersion = LionWebVersions.v2023_1

    const { node } = lionWebVersion.builtinsFacade.classifiers

    const dashSeparator = concatenator("-")

    it(`concept extends from Node or from nothing => class extends from NodeBase`, () => {
        const factory = new LanguageFactory("test", "0", dashSeparator, dashSeparator)
        factory.concept("ConceptExtendingNode", ConceptModifier.concrete, node)
        factory.concept("ConceptExtendingNothing", ConceptModifier.concrete)

        const languageFile = languageFileFor(factory.language, lionWebVersion, { verbose: false, genericImportLocation: "@lionweb/class-core" })
        const matchExtendsNode = languageFile.match(/export class ConceptExtendingNode extends ([A-Za-z.$]+) \{/)
        isTrue(matchExtendsNode !== null && matchExtendsNode[1] === "$lwClassCore.NodeBase")
        const matchExtendsNothing = languageFile.match(/export class ConceptExtendingNothing extends ([A-Za-z.$]+) \{/)
        isTrue(matchExtendsNothing !== null && matchExtendsNothing[1] === "$lwClassCore.NodeBase")
    })

    it(`reference on a classifier refers to Node => the Node type is used instead of INodeBase`, () => {
        const factory = new LanguageFactory("test", "0", dashSeparator, dashSeparator)
        const AConcept = factory.concept("AConcept", ConceptModifier.concrete)
        factory.reference(AConcept, "ref").ofType(node)
        const AnAnnotation = factory.annotation("AnAnnotation").annotating(AConcept)
        factory.reference(AnAnnotation, "ref").ofType(node)
        const AnInterface = factory.interface("AnInterface")
        factory.reference(AnInterface, "ref").ofType(node)

        const languageFile = languageFileFor(factory.language, lionWebVersion, { verbose: false, genericImportLocation: "@lionweb/class-core" })
        isTrue(languageFile.match(/<\$lwClassCore\.INodeBase>/) === null, "found <INodeBase>")
        isTrue(languageFile.match(/<\$lwCore\.Node>/) !== null, "didn’t find <Node>")
    })

    it(`generate API for: LionCore, LionCore-builtins, and io.lionweb.mps.specific`, () => {
        generateApiFromLanguages([lionWebVersion.builtinsFacade.language, lionWebVersion.lioncoreFacade.language, ioLionWebMpsSpecificLanguage], "src/gen", lionWebVersion)
    })

    it(`generate code for language with concept named "Class"`, () => {
        const factory = new LanguageFactory("Meta-test", "1", dashSeparator, dashSeparator)
        const {inamed} = lionWebVersion.builtinsFacade.classifiers
        const Class = factory.concept("Class", ConceptModifier.concrete).implementing(inamed)
        const Property = factory.concept("Property", ConceptModifier.concrete).implementing(inamed)
        factory.containment(Class, "property").ofType(Property)

        generateLanguage(factory.language, "src/gen", lionWebVersion, { verbose: false })
    })

})

