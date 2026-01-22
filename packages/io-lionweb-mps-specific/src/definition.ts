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

import { Annotation, Classifier, LanguageFactory, lioncoreBuiltinsFacade, lioncoreFacade } from "@lionweb/core"
import { StringsMapper } from "@lionweb/ts-utils"

const languageName = "io.lionweb.mps.specific"
const dashedLanguageName = languageName.replaceAll(".", "-")

const idKeyGen: StringsMapper = (...names) =>
    names.length === 1
        ? names[0]
        : names.slice(1).join("-")

const factory = new LanguageFactory(dashedLanguageName, "2024-01", idKeyGen, idKeyGen)


const { inamed, node } = lioncoreBuiltinsFacade.classifiers

const defineAnnotation = (nameOfAnnotation: string, annotates: Classifier, ...namesOfOptionalStringProperties: string[]): Annotation => {
    const annotation = factory.annotation(nameOfAnnotation).annotating(annotates)
    namesOfOptionalStringProperties.forEach((name) => {
        factory.property(annotation, name).ofType(lioncoreBuiltinsFacade.primitiveTypes.stringDataType).isOptional()
    })
    return annotation
}


const { metaConcepts } = lioncoreFacade

const ConceptDescription = defineAnnotation("ConceptDescription", metaConcepts.classifier, "conceptAlias", "conceptShortDescription", "helpUrl")

const Deprecated = defineAnnotation("Deprecated", metaConcepts.ikeyed, "comment", "build")

const KeyedDescription = defineAnnotation("KeyedDescription", metaConcepts.ikeyed, "documentation")
factory.reference(KeyedDescription, "seeAlso").ofType(node).isMultiple().isOptional()

const ShortDescription = defineAnnotation("ShortDescription", node, "description")

const VirtualPackage = defineAnnotation("VirtualPackage", node).implementing(inamed)


export const ioLionWebMpsSpecificLanguage = factory.language
ioLionWebMpsSpecificLanguage.name = languageName

export const ioLionWebMpsSpecificClassifiers = {
    ConceptDescription,
    Deprecated,
    KeyedDescription,
    ShortDescription,
    VirtualPackage
}

