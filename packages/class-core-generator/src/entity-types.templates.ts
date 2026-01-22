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
    Containment,
    Enumeration,
    Feature,
    featureMetaType,
    Interface,
    isContainment,
    isProperty,
    isRef,
    isReference,
    isUnresolvedReference,
    LanguageEntity,
    Link,
    lioncoreBuiltinsFacade,
    M3Concept,
    nameSorted,
    Node,
    PrimitiveType,
    Property,
    Reference
} from "@lionweb/core"
import {
    ConceptDescription,
    Deprecated,
    ioLionWebMpsSpecificAnnotationsFrom,
    KeyedDescription,
    ShortDescription,
    VirtualPackage
} from "@lionweb/io-lionweb-mps-specific"
import { indent, switchOrIf, withFirstUpper } from "@lionweb/textgen-utils"
import { commaSeparated, when, withNewlineAppended } from "littoral-templates"

import {
    entityMetaType,
    extendsFrom,
    featuresToConcretelyImplementOf,
    implementsFrom,
    Imports,
    isAbstract,
    optionalityPostfix,
    tsFieldTypeForFeature,
    tsTypeForClassifier,
    tsTypeForDataType,
    tsTypeForPrimitiveType,
    tsTypeForValueManager
} from "./helpers/index.js"

const cardinalityPrefix = (feature: Feature) => {
    if (feature instanceof Property) {
        return feature.optional ? "Optional" : "Required"
    }
    if (feature instanceof Link) {
        return `${feature.optional ? "Optional" : "Required"}${feature.multiple ? "Multi" : "Single"}`
    }
}

const valueManagerFor = (feature: Feature) =>
    `${cardinalityPrefix(feature)}${featureMetaType(feature)}ValueManager`

export const typeForLanguageEntity = (imports: Imports) => {

    const classMembersForProperty = (property: Property) => {
        const {name, type} = property
        return [
            `private readonly _${name}: ${imports.generic(valueManagerFor(property))}<${tsTypeForDataType(type, imports)}>;`,
            jsDocFor(property),
            `get ${name}(): ${tsTypeForDataType(type, imports)}${optionalityPostfix(property)} {`,
            indent(`return this._${name}.get();`),
            `}`,
            `set ${name}(newValue: ${tsTypeForDataType(type, imports)}${optionalityPostfix(property)}) {`,
            indent(`this._${name}.set(newValue);`),
            `}`
        ]
    }

    const classMembersForLink = (link: Link) => {
        const {name, type, multiple} = link
        const nameWithFirstUpper = withFirstUpper(name)
        const tsTypeForClassifier_ = tsTypeForClassifier(type, imports)
        const tsTypeForLink_ = link instanceof Reference
            ? `${imports.core(multiple ? "MultiRef" : "SingleRef")}<${tsTypeForClassifier_}>${multiple ? "" : optionalityPostfix(link)}`
            : `${tsTypeForClassifier_}${multiple ? "[]" : optionalityPostfix(link)}`
        return [
            `private readonly _${name}: ${imports.generic(valueManagerFor(link))}<${tsTypeForClassifier_}>;`,
            jsDocFor(link),
            `get ${name}(): ${tsTypeForLink_} {`,
            indent(`return this._${name}.get();`),
            `}`,
            when(!multiple)([
                `set ${name}(newValue: ${tsTypeForLink_}) {`,
                indent(`this._${name}.set(newValue);`),
                `}`,
                when(link instanceof Containment)([
                    `replace${nameWithFirstUpper}With(newValue: ${tsTypeForClassifier_}) {`,
                    indent(`this._${name}.replaceWith(newValue);`),
                    `}`
                ])
            ]),
            when(multiple)([
                `add${nameWithFirstUpper}(newValue: ${tsTypeForClassifier_}) {`,
                indent(`this._${name}.add(newValue);`),
                `}`,
                `remove${nameWithFirstUpper}(valueToRemove: ${tsTypeForClassifier_}) {`,
                indent(`this._${name}.remove(valueToRemove);`),
                `}`,
                `add${nameWithFirstUpper}AtIndex(newValue: ${tsTypeForClassifier_}, index: number) {`,
                indent(`this._${name}.insertAtIndex(newValue, index);`),
                `}`,
                `move${nameWithFirstUpper}(oldIndex: number, newIndex: number) {`,
                indent(`this._${name}.move(oldIndex, newIndex);`),
                `}`,
                when(link instanceof Containment)([
                    `replace${nameWithFirstUpper}AtIndex(movedChild: ${tsTypeForClassifier_}, newIndex: number) {`,
                    indent(`this._${name}.replaceAtIndex(movedChild, newIndex);`),
                    `}`
                ])
            ])
        ]
    }

    const classMembersForFeature = (feature: Feature) => {
        if (isProperty(feature)) {
            return classMembersForProperty(feature)
        }
        if (isContainment(feature) || isReference(feature)) {
            return classMembersForLink(feature)
        }
        return `// unhandled feature <${feature.constructor.name}>"${feature.name}" on classifier "${feature.classifier.name}" in language "${feature.classifier.language.name}"`
    }

    const classForConcreteClassifier = (classifier: Classifier) => {
        const features = featuresToConcretelyImplementOf(classifier)

        const getValueManagers = <FT extends Feature>(features: FT[]) => {
            if (features.length === 0) {
                return []
            }

            const featureMetaType_ = featureMetaType(features[0])
            const argumentName = featureMetaType_.toLowerCase()
            return [
                ``,
                `get${featureMetaType_}ValueManager(${argumentName}: ${imports.core(featureMetaType_)}): ${imports.generic(featureMetaType_ + "ValueManager")}<${featureMetaType_ === "Property" ? "unknown" : imports.generic("INodeBase")}> {`,
                indent(
                    switchOrIf(
                        `${argumentName}.key`,
                        features.map((feature) => [`${imports.language(feature.classifier.language)}.INSTANCE.${feature.classifier.name}_${feature.name}.key`, `this._${feature.name}`]),
                        `return super.get${featureMetaType_}ValueManager(${argumentName});`
                    )
                ),
                `}`
            ]
        }

        const extendsFragment = "extends " + ((superConcept) => {
            if (isUnresolvedReference(superConcept)) {
                return `/* unresolved reference to super concept */`
            }
            if (superConcept === undefined || superConcept === lioncoreBuiltinsFacade.classifiers.node) {
                return imports.generic("NodeBase")
            }
            return imports.entity(superConcept)
        })(extendsFrom(classifier)) + " "
        const implementsFragment = ((superInterfaces) =>
                superInterfaces.length === 0
                    ? ""
                    : ("implements " + nameSorted(superInterfaces).map((t) => imports.entity(t)).join(", ") + " ")
        )(implementsFrom(classifier))
        return [
            `export ${isAbstract(classifier) ? "abstract " : ""}class ${classifier.name} ${extendsFragment}${implementsFragment}{`,
            indent([
                when(!isAbstract(classifier))(
                    () =>
                        [
                            `static create(id: ${imports.json("LionWebId")}, receiveDelta?: ${imports.generic("DeltaReceiver")}, parentInfo?: ${imports.generic("Parentage")}): ${classifier.name} {`,
                            indent([
                                `return new ${classifier.name}(${imports.language(classifier.language)}.INSTANCE.${classifier.name}, id, receiveDelta, parentInfo);`
                            ]),
                            `}`,
                        ]
                ),
                when(features.length > 0)(
                    () =>
                        [
                            ``,
                            features.map(withNewlineAppended(classMembersForFeature)),
                            `${isAbstract(classifier) ? "protected" : "public"} constructor(classifier: ${imports.core("Classifier")}, id: ${imports.json("LionWebId")}, receiveDelta?: ${imports.generic("DeltaReceiver")}, parentInfo?: ${imports.generic("Parentage")}) {`,
                            indent([
                                `super(classifier, id, receiveDelta, parentInfo);`,
                                features.map((feature) => `this._${feature.name} = new ${imports.generic(valueManagerFor(feature))}<${tsTypeForValueManager(feature, imports)}>(${imports.language(feature.classifier.language)}.INSTANCE.${feature.classifier.name}_${feature.name}, this);`)
                            ]),
                            `}`,
                            getValueManagers(features.filter(isProperty)),
                            getValueManagers(features.filter(isContainment)),
                            getValueManagers(features.filter(isReference))
                        ]
                ),
            ]),
            `}`
        ]
    }


    const typeForEnumeration = (enumeration: Enumeration) =>
        [
            `export enum ${enumeration.name} {`,
            indent(
                commaSeparated(enumeration.literals.map(({name, key}) => `${name} = "${key}"`))
                    // Using TS string enums means that the key _is_ the literal's runtime TS representation.
            ),
            `}`
        ]


    const interfaceFor = (interface_: Interface) =>
        [
            `export interface ${interface_.name} extends ${interface_.extends.length > 0 ? interface_.extends.filter(isRef).map((superInterface) => imports.entity(superInterface)).join(", ") : imports.generic("INodeBase")} {`,
            indent(
                interface_.features.map((feature) => `${feature.name}: ${tsFieldTypeForFeature(feature, imports)};`)
            ),
            `}`
        ]


    const typeForPrimitiveType = (primitiveType: PrimitiveType) =>
        `export type ${primitiveType.name} = ${tsTypeForPrimitiveType(primitiveType)};`

    const jsDocFor = (entity: M3Concept) => {
        const annotations = ioLionWebMpsSpecificAnnotationsFrom(entity)
        const conceptDescription = annotations.find((annotation) => annotation instanceof ConceptDescription) as ConceptDescription
        const deprecated = annotations.find((annotation) => annotation instanceof Deprecated) as Deprecated
        const keyedDescription = annotations.find((annotation) => annotation instanceof KeyedDescription) as KeyedDescription
        const shortDescription = annotations.find((annotation) => annotation instanceof ShortDescription) as ShortDescription
        const virtualPackage = annotations.find((annotation) => annotation instanceof VirtualPackage) as VirtualPackage
        const requiresJsDoc =
               !!(conceptDescription?.conceptShortDescription)
            || !!(conceptDescription?.helpUrl)
            || !!(shortDescription?.description)
            || keyedDescription !== undefined
            || deprecated !== undefined
            || !!(virtualPackage?.name)
        const linkName = (node: Node) =>
            node instanceof LanguageEntity
                ? node.name
                : "??? (not a language's entity)"
        return when(requiresJsDoc)([
            `/**`,
            when(!!(conceptDescription?.conceptShortDescription))(
                () => ` * ${conceptDescription.conceptShortDescription}`
            ),
            when(!!(conceptDescription?.helpUrl))(
                () => ` * {@see} ${conceptDescription.helpUrl}`
            ),
            when(!!(shortDescription?.description))(
                () => ` * ${shortDescription.description}`
            ),
            when(keyedDescription !== undefined)(
                () => [
                    when(keyedDescription.documentation !== undefined)(` * ${keyedDescription.documentation}`),
                    keyedDescription.seeAlso.map((seeAlso) => ` * {@see} {@link ${linkName(seeAlso)}}`)
                ]
            ),
            when(deprecated !== undefined)(
                () => ` * @deprecated ${deprecated.comment ?? ""}${deprecated.build === undefined ? "" : ` (build: ${deprecated.build})`}`
            ),
            when(!!(virtualPackage?.name))(
                () => `(virtual package: ${virtualPackage.name})`
            ),
            ` */`
        ])
    }

    return (entity: LanguageEntity) =>
        [
            jsDocFor(entity),
            (() => {
                if (entity instanceof Interface) {
                    return interfaceFor(entity)
                }
                if (entity instanceof Classifier) {
                    return classForConcreteClassifier(entity)
                }
                if (entity instanceof Enumeration) {
                    return typeForEnumeration(entity)
                }
                if (entity instanceof PrimitiveType) {
                    return typeForPrimitiveType(entity)
                }
                return `// unhandled language entity <${entityMetaType(entity)}>"${entity.name}"`
            })()
        ]

}

