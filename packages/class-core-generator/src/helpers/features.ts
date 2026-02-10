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
    DataType,
    Enumeration,
    Feature,
    isBuiltinNodeConcept,
    isContainment,
    isProperty,
    isReference,
    isUnresolvedReference,
    LanguageEntity,
    Link,
    PrimitiveType,
    Property,
    referenceToSet,
    SingleRef
} from "@lionweb/core"
import { Imports, tsTypeForPrimitiveType } from "./index.js"


export const typeOf = (feature: Feature): SingleRef<LanguageEntity> => {
    if (feature instanceof Property) {
        return feature.type
    }
    if (feature instanceof Link) {
        return feature.type
    }
    return referenceToSet()
}


export const tsTypeForDataType = (dataType: SingleRef<DataType>, imports: Imports) => {
    if (isUnresolvedReference(dataType)) {
        return `unknown /* [ERROR] can't compute a TS type for an unresolved data type */`
    }
    if (dataType instanceof PrimitiveType) {
        return tsTypeForPrimitiveType(dataType)
    }
    if (dataType instanceof Enumeration) {
        return imports.entity(dataType)
    }
    return `unknown /* [ERROR] can't compute a TS type for data type ${dataType.name} that has an unhandled/-known meta-type ${dataType.constructor.name} */`
}


const isBuiltinNode = (type: SingleRef<LanguageEntity>): boolean => {
    if (isUnresolvedReference(type)) {
        throw new Error(`can’t say whether an unresolved reference is the built-in Node concept`)
    }
    return type instanceof Classifier && isBuiltinNodeConcept(type)
}

export const tsTypeForClassifier = (classifier: SingleRef<Classifier>, imports: Imports, isReference = false) => {
    if (isUnresolvedReference(classifier)) {
        return `unknown /* [ERROR] can't compute a TS type for an unresolved classifier */`
    }
    if (isBuiltinNode(classifier)) {
        return isReference
            ? imports.core("Node")
            : imports.generic("INodeBase")
    }
    return imports.entity(classifier)
}


export const optionalityPostfix = (feature: Feature) => feature.optional ? " | undefined" : ""

export const tsFieldTypeForFeature = (feature: Feature, imports: Imports): string => {
    const type = typeOf(feature)
    if (isUnresolvedReference(type)) {
        return `unknown /* [ERROR] can't compute a TS type for feature ${feature.name} on classifier ${feature.classifier.name} with unresolved type (${type}) */`
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
        const typeId = isBuiltinNode(type) ? imports.generic("INodeBase") : imports.entity(type)
        return `${typeId}${feature.multiple ? "[]" : optionalityPostfix(feature)}`
    }
    if (isReference(feature)) {
        const typeId = isBuiltinNode(type) ? imports.generic("INodeBase") : imports.entity(type)
        return `${imports.core("SingleRef")}<${typeId}>${feature.multiple ? "[]" : optionalityPostfix(feature)}`
    }
    return `unknown /* [ERROR] can't compute a TS type for feature ${feature.name} on classifier ${feature.classifier.name} whose type has an unhandled/-known meta-type ${type.constructor.name} */`
}

export const tsTypeForValueManager = (feature: Feature, imports: Imports): string => {
    const type = typeOf(feature)
    if (isUnresolvedReference(type)) {
        return `unknown /* [ERROR] can't compute a TS type for feature ${feature.name} on classifier ${feature.classifier.name} with unresolved type (${type}) */`
    }
    if (isProperty(feature)) {
        return (() => {
            if (type instanceof PrimitiveType) {
                return tsTypeForPrimitiveType(type)
            }
            if (type instanceof Enumeration) {
                return type.name
            }
            return `unknown /* [ERROR] can't compute a TS type for feature ${feature.name} on classifier ${feature.classifier.name} whose type has an unhandled/-known meta-type ${type.constructor.name} */`
        })()
    }
    if (!(isContainment(feature) || isReference(feature))) {
        return `unknown /* [ERROR] can't compute a TS type for feature ${feature.name} on classifier ${feature.classifier.name} whose type has an unhandled/-known meta-type ${type.constructor.name} */`
    }
    if (isBuiltinNode(type)) {
        if (isContainment(feature)) {
            return imports.generic("INodeBase")
        }
        if (isReference(feature)) {
            return imports.core("Node")
        }
    }
    return imports.entity(type)
}

