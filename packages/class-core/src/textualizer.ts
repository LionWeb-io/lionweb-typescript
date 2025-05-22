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

import { allFeaturesOf, Containment, Feature, Property, Reference, unresolved } from "@lionweb/core"
import { asString, indentWith, Template } from "littoral-templates"

import { INodeBase } from "./base-types.js"
import { LionCore_builtinsBase } from "./lionCore_builtins.g.js"

const indent = indentWith("    ")(1)

const prependWith = (template: Template, prefix: string): Template =>
    prefix + asString(template)


type INodeBaseOrNotThere = INodeBase | typeof unresolved | undefined

const asINodeBases = (value: INodeBaseOrNotThere | INodeBaseOrNotThere[]): INodeBase[] => {
    const isINodeBase = (value: INodeBaseOrNotThere): value is INodeBase =>
        !(value === unresolved || value === undefined)

    if (Array.isArray(value)) {
        return value
            .filter((subValue) => isINodeBase(subValue))
            .map((subValue) => subValue as INodeBase)
    }
    return isINodeBase(value) ? [value] : []
}


/**
 * @return a function that renders the roots of a given forest of {@link INodeBase nodes} in a textual tree-representation.
 * @param identificationFor a function that renders an identification for the given {@link INodeBase node} — typically its name or its ID.
 */
export const asTreeTextWith = (identificationFor: (node: INodeBase) => string): ((nodes: INodeBase[]) => string) => {

    const asText = (node: INodeBase): Template => {
        const featureValueAsText = (feature: Feature) => {
            if (feature instanceof Property) {
                const valueManager = node.getPropertyValueManager(feature)
                const displayValue = (() => {
                    if (!valueManager.isSet()) {
                        return `$<not set>`
                    }
                    const value = valueManager.getDirectly()
                    if (feature.type === LionCore_builtinsBase.INSTANCE.String) {
                        return `"${value}"`
                    }
                    return value
                })()
                return `${feature.name} = ${displayValue}`
            }
            if (feature instanceof Containment) {
                const valueManager = node.getContainmentValueManager(feature)
                const children = asINodeBases(valueManager.getDirectly())
                return [
                    `${feature.name}:${children.length === 0 ? " <nothing>" : ""}`,
                    indent(children.map(asText))
                ]
            }
            if (feature instanceof Reference) {
                const valueManager= node.getReferenceValueManager(feature)
                const references = asINodeBases(valueManager.getDirectly())
                return [
                    `${feature.name} -> ${references.length === 0 ? "<none>" : references.map(identificationFor).join(", ")}`
                ]
            }
            return `!!! can't handle feature ${feature.name} (of meta type ${feature.metaType()})`
        }

        const annotationAsText = (annotation: INodeBase) =>
            prependWith(asText(annotation), "@ ")

        return [
            `${node.classifier.name} (id: ${node.id})`,
            indent([
                allFeaturesOf(node.classifier).map(featureValueAsText),
                node.annotations.map(annotationAsText)
            ])
        ]
    }

    return (nodes: INodeBase[]) => asString(
        nodes
            .filter((node) => node.parent === undefined) // root nodes
            .map(asText)
    )
}

