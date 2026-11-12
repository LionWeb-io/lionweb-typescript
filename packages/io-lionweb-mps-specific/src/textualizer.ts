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
    Field,
    Language,
    LanguageEntity,
    M3Concept,
    M3Node,
    Node,
    PrimitiveType,
    StructuredDataType
} from "@lionweb/core"
import { deCamelCase, indent, withFirstLower } from "@lionweb/textgen-utils"
import { keepDefineds } from "@lionweb/ts-utils"
import { asString, Template, when } from "littoral-templates"
import { ioLionWebMpsSpecificAnnotationsFrom } from "./annotations.js"
import {
    ConceptDescription,
    Deprecated,
    IoLionWebMpsSpecificAnnotation,
    KeyedDescription,
    ShortDescription,
    VirtualPackage
} from "./implementation.js"


const displayMetaTypeOf = (node: M3Node) =>
    withFirstLower(deCamelCase(node.metaType()))

/**
 * @return human-readable text of the location/“path to” the given {@link Node `node`},
 * which is *assumed* to be a language element – i.e., a {@link M3Concept}.
 */
const pathTo = (node: Node): string => {
    if (node instanceof LanguageEntity) {
        return `${displayMetaTypeOf(node)} ${node.name} in ${pathTo(node.language)}`
    }
    if (node instanceof EnumerationLiteral) {
        return `literal ${node.name} of ${pathTo(node.enumeration)}`
    }
    if (node instanceof Feature) {
        return `${displayMetaTypeOf(node)} ${node.name} of ${pathTo(node.classifier)}`
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

    if (
        node instanceof EnumerationLiteral
        || node instanceof Feature
        || node instanceof Field
        || node instanceof PrimitiveType
    ) {
        return annotations.length > 0
            ? [
                `${displayMetaTypeOf(node)} ${node.name}:`,
                indent(annotations.map(textualizationOfAnnotation))
            ]
            : []
    }

    const textualizeWithChildren = <NT extends M3Concept, FK extends keyof NT>(propertyName: FK): Template => {
        const annotatedChildren = ((node as NT)[propertyName] as M3Concept[]).flatMap(textualizationOfAnnotationsInM3Concept)
        return (annotations.length > 0 || annotatedChildren.length > 0)
            ? [
                `${displayMetaTypeOf(node)} ${node.name}:`,
                indent([
                    annotations.map(textualizationOfAnnotation),
                    annotatedChildren
                ])
            ]
            : []
    }

    if (node instanceof Classifier) {
        return textualizeWithChildren<Classifier, "features">("features")
    }

    if (node instanceof Enumeration) {
        return textualizeWithChildren<Enumeration, "literals">("literals")
    }

    if (node instanceof Language) {
        return textualizeWithChildren<Language, "entities">("entities")
    }

    if (node instanceof StructuredDataType) {
        return textualizeWithChildren<StructuredDataType, "fields">("fields")
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

