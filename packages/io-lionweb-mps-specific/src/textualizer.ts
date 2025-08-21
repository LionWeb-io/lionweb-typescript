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
    Classifier,
    Enumeration,
    EnumerationLiteral,
    Feature,
    Language,
    LanguageEntity,
    M3Concept,
    Node,
    PrimitiveType
} from "@lionweb/core"
import { indent, withFirstLower } from "@lionweb/textgen-utils"
import { keepDefineds } from "@lionweb/ts-utils"
import { asString, Template, when } from "littoral-templates"
import {
    ConceptDescription,
    Deprecated,
    IoLionWebMpsSpecificAnnotation,
    KeyedDescription,
    ShortDescription,
    VirtualPackage
} from "./implementation.js"
import { ioLionWebMpsSpecificAnnotationsFrom } from "./annotations.js"


/**
 * @return human-readable text of the location/“path to” the given {@link Node node},
 * which is *assumed* to be a language element – i.e., a {@link M3Concept}.
 */
const pathTo = (node: Node): string => {
    if (node instanceof LanguageEntity) {
        return `${withFirstLower(node.metaType())} ${node.name} in ${pathTo(node.language)}`
    }
    if (node instanceof EnumerationLiteral) {
        return `literal ${node.name} of ${pathTo(node.enumeration)}`
    }
    if (node instanceof Feature) {
        return `${withFirstLower(node.metaType())} ${node.name} of ${pathTo(node.classifier)}`
    }
    if (node instanceof Language) {
        return `language ${node.name}`
    }
    throw new Error(`don't know how to handle an instance of ${node.constructor.name}`)
}


/**
 * @return a textualization of the given io.lionweb.mps.specific annotation.
 */
const textualizationOfAnnotation = (annotation: IoLionWebMpsSpecificAnnotation): Template => {

    const textualizeProperty = <T extends IoLionWebMpsSpecificAnnotation>(propertyName: keyof T, displayName: string): (string | undefined) => {
        const value = (annotation as T)[propertyName]
        return value === undefined
            ? undefined
            : `${displayName}: ${value}`
    }

    const textualizePropertiesWithDisplayNames = <T extends IoLionWebMpsSpecificAnnotation>(properties: { [displayName: string]: keyof T}): string[] =>
        keepDefineds(
            Object.entries(properties)
                .map(([displayName, propertyName]) => textualizeProperty(propertyName, displayName))
        )

    const textualizeProperties = <T extends IoLionWebMpsSpecificAnnotation>(...propertyNames: (keyof T)[]): string[] =>
        keepDefineds(
            propertyNames
                .map((propertyName) => textualizeProperty(propertyName, propertyName as string))
        )


    if (annotation instanceof ConceptDescription) {
        const fragments = textualizePropertiesWithDisplayNames<ConceptDescription>({ "short description": "conceptShortDescription", "alias": "conceptAlias", "help URL": "helpUrl" })
        return fragments.length === 0
            ? `@ConceptDescription: (no info)`
            : [
                `@ConceptDescription:`,
                indent(fragments)
            ]
    }

    if (annotation instanceof Deprecated) {
        const fragments = textualizeProperties<Deprecated>("comment", "build")
        return fragments.length === 0
            ? `@Deprecated: (no info)`
            : [
                `@Deprecated:`,
                indent(fragments)
            ]
    }

    if (annotation instanceof KeyedDescription) {
        const fragments = textualizeProperties<KeyedDescription>("documentation")
        return (fragments.length === 0 && annotation.seeAlso.length === 0)
            ? `@KeyedDescription: (no info)`
            : [
                `@KeyedDescription: `,
                indent([
                    fragments,
                    when(annotation.seeAlso.length > 0)([
                        `see also:`,
                        indent(annotation.seeAlso.map(pathTo))
                    ])
                ])
        ]
    }

    if (annotation instanceof ShortDescription) {
        const fragments = textualizeProperties<ShortDescription>("description")
        return fragments.length === 0
            ? `@ShortDescription: (no info)`
            : [
                `@ShortDescription:`,
                indent(fragments)
            ]
    }

    if (annotation instanceof VirtualPackage) {
        const fragments = textualizeProperties<VirtualPackage>("name")
        return fragments.length === 0
            ? `@VirtualPackage: (no info)`
            : [
                `@VirtualPackage:`,
                indent(fragments)
            ]
    }

    throw new Error(`don't know how to handle an instance of ${annotation.constructor.name}`)
}


/**
 * @return textualization of the given {@link M3Concept language element} provided it either has (1 or more) annotations itself,
 * or if any of its nested language elements – i.e.: descendants – have (1 or more) annotations.
 * Otherwise, it returns an empty array `[]`.
 */
const textualizationOfAnnotationsInM3Concept = (node: M3Concept): Template => {
    const annotations = ioLionWebMpsSpecificAnnotationsFrom(node)

    if (node instanceof Classifier) {
        const annotatedFeatures = node.features.flatMap((feature) => textualizationOfAnnotationsInM3Concept(feature as M3Concept))
        return (annotations.length > 0 || annotatedFeatures.length > 0)
            ? [
                `${withFirstLower(node.metaType())} ${node.name}:`,
                indent([
                    annotations.map(textualizationOfAnnotation),
                    annotatedFeatures
                ])
            ]
            : []
    }

    if (node instanceof Enumeration) {
        const annotatedLiterals = node.literals.flatMap((literal) => textualizationOfAnnotationsInM3Concept(literal))
        return (annotations.length > 0 || annotatedLiterals.length > 0)
            ? [
                `enumeration ${node.name}:`,
                indent([
                    annotations.map(textualizationOfAnnotation),
                    annotatedLiterals
                ])
            ]
            : []
    }

    if (node instanceof EnumerationLiteral) {
        return annotations.length > 0
            ? [
                `enumeration literal ${node.name}:`,
                indent(annotations.map(textualizationOfAnnotation))
            ]
            : []
    }

    if (node instanceof Feature) {
        return annotations.length > 0
            ? [
                `${withFirstLower(node.metaType())} ${node.name}:`,
                indent(annotations.map(textualizationOfAnnotation))
            ]
            : []
    }

    if (node instanceof Language) {
        const annotatedEntities = node.entities.flatMap((entity) => textualizationOfAnnotationsInM3Concept(entity))
        return (annotations.length > 0 || annotatedEntities.length > 0)
            ? [
                `language ${node.name}:`,
                indent([
                    annotations.map(textualizationOfAnnotation),
                    annotatedEntities
                ])
            ]
            : []
    }

    if (node instanceof PrimitiveType) {
        return annotations.length > 0
            ? [
                `primitive type ${node.name}:`,
                indent(annotations.map(textualizationOfAnnotation))
            ]
            : []
    }

    // can't happen as node has type 'never' at this point, because of type exhaustion,
    // but need to return a Template:
    return []
}


/**
 * @return textualization of all instances of io.lionweb.mps.specific annotations, in the given languages' tree structure.
 * **Note**: only language elements having annotations (at any nesting depth) are rendered.
 * This is useful to get a quick overview of the annotations.
 */
export const textualizationOfAnnotationsIn = (languages: Language[]): string =>
    asString(languages.map(textualizationOfAnnotationsInM3Concept))

