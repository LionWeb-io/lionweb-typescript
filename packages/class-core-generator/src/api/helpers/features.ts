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
    builtinClassifiers,
    Classifier,
    Datatype,
    Enumeration,
    Feature,
    isContainment,
    isProperty,
    isReference,
    LanguageEntity,
    Link,
    PrimitiveType,
    Property,
    SingleRef
} from "@lionweb/core"
import {Imports, tsTypeForPrimitiveType} from "./index.js"


export const typeOf = (feature: Feature): SingleRef<LanguageEntity> => {
    if (feature instanceof Property) {
        return feature.type
    }
    if (feature instanceof Link) {
        return feature.type
    }
    return null
}


export const tsTypeForDatatype = (datatype: SingleRef<Datatype>, imports: Imports) => {
    if (datatype === null) {
        return `unknown /* [ERROR] can't compute a TS type for a null datatype */`
    }
    if (datatype instanceof PrimitiveType) {
        return tsTypeForPrimitiveType(datatype)
    }
    if (datatype instanceof Enumeration) {
        return imports.entity(datatype)
    }
    return `unknown /* [ERROR] can't compute a TS type for datatype ${datatype.name} that has an unhandled/-known meta-type ${datatype.constructor.name} */`
}


export const tsTypeForClassifier = (classifier: SingleRef<Classifier>, imports: Imports) => {
    if (classifier === null) {
        return `unknown /* [ERROR] can't compute a TS type for a null classifier */`
    }
    return classifier === builtinClassifiers.node ? imports.generic("INodeBase") : imports.entity(classifier)
}


export const optionalityPostfix = (feature: Feature) => feature.optional ? " | undefined" : ""

export const tsFieldTypeForFeature = (feature: Feature, imports: Imports): string => {
    const type = typeOf(feature)
    if (type === null) {
        return `unknown /* [ERROR] can't compute a TS type for feature ${feature.name} on classifier ${feature.classifier.name} with null type */`
    }
    if (isProperty(feature)) {
        const typeId = (() => {
            if (type instanceof PrimitiveType) {
                return tsTypeForPrimitiveType(type)
            }
            if (type instanceof Enumeration) {
                return type.name
            }
            return `unknown /* [ERROR] can't compute a TS type for feature ${feature.name} on classifier ${feature.classifier.name} whose type has an unhandled/-known meta-type ${type.constructor.name} */`
        })()
        return `${typeId}${(optionalityPostfix(feature))}`
    }
    if (isContainment(feature)) {
        const typeId = type === builtinClassifiers.node ? imports.generic("INodeBase") : imports.entity(type)
        return `${typeId}${feature.multiple ? "[]" : optionalityPostfix(feature)}`
    }
    if (isReference(feature)) {
        const typeId = type === builtinClassifiers.node ? imports.generic("INodeBase") : imports.entity(type)
        return `${imports.core("SingleRef")}<${typeId}>${feature.multiple ? "[]" : optionalityPostfix(feature)}`
    }
    return `unknown /* [ERROR] can't compute a TS type for feature ${feature.name} on classifier ${feature.classifier.name} whose type has an unhandled/-known meta-type ${type.constructor.name} */`
}

export const tsTypeForValueManager = (feature: Feature, imports: Imports): string => {
    const type = typeOf(feature)
    if (type === null) {
        return `unknown /* [ERROR] can't compute a TS type for feature ${feature.name} on classifier ${feature.classifier.name} with null type */`
    }
    if (isProperty(feature)) {
        const typeId = (() => {
            if (type instanceof PrimitiveType) {
                return tsTypeForPrimitiveType(type)
            }
            if (type instanceof Enumeration) {
                return type.name
            }
            return `unknown /* [ERROR] can't compute a TS type for feature ${feature.name} on classifier ${feature.classifier.name} whose type has an unhandled/-known meta-type ${type.constructor.name} */`
        })()
        return typeId
    }
    if (isContainment(feature) || isReference(feature)) {
        return type === builtinClassifiers.node ? imports.generic("INodeBase") : imports.entity(type)
    }
    return `unknown /* [ERROR] can't compute a TS type for feature ${feature.name} on classifier ${feature.classifier.name} whose type has an unhandled/-known meta-type ${type.constructor.name} */`
}

