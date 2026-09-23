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

import { Enumeration, PrimitiveType, Property } from "../m3/index.js"
import { CompleteSerializationConfiguration, completeSerializationConfigurationWithDefaults } from "../configuration.js"
import { EnumerationLiteralDecoder } from "../reading.js"
import { isReferenceToSet, isResolvedReference, isUnresolvedReference } from "../references.js"
import { EnumerationLiteralEncoder } from "../writing.js"


/**
 * A type def. for functions that deserialize the given string-typed `serialization` of a value of the given `property`
 * as a runtime encoding.
 */
export type PropertyValueDeserializer = (property: Property, serialization: string) => unknown

/**
 * A type def. for objects that configure {@link PropertyValueDeserializer}s.
 */
export type PropertyValueDeserializerConfiguration = {

    encodingOfEnumerationLiteral: EnumerationLiteralEncoder<unknown>

} & Partial<Omit<CompleteSerializationConfiguration, "primitiveValueSerializerRegistry">>
// TODO  consider omitting the Partial<...> here

/**
 * @return A {@link PropertyValueDeserializer} conforming to the given `configuration`.
 */
export const propertyValueDeserializerWith = (configuration: PropertyValueDeserializerConfiguration): PropertyValueDeserializer => {
    const { primitiveValueDeserializerRegistry, problemReporter } = completeSerializationConfigurationWithDefaults(configuration)
    const primitiveValueDeserializerByType = primitiveValueDeserializerRegistry.lookupByKey
    const { encodingOfEnumerationLiteral } = configuration

    return (property, serialization) => {
        const { type } = property
        if (!isResolvedReference(type)) {
            problemReporter.reportProblem(`can't deserialize value of property "${property.name}" (on classifier "${property.classifier.name}" in language "${property.classifier.language.name}") having ${isReferenceToSet(type) ? `an unset type` : `unresolved type ${isUnresolvedReference(type) && type.resolveInfo !== undefined ? ` -> ${type.resolveInfo}` : ``}`}: ${serialization}`)
            return undefined
        }
        if (type instanceof PrimitiveType) {
            const primitiveValueDeserializer = primitiveValueDeserializerByType(type)
            if (primitiveValueDeserializer === undefined) {
                problemReporter.reportProblem(`couldn’t find a deserializer for the primitive type ${type.name}`)
                return undefined
            }
            return primitiveValueDeserializer(serialization)
        }
        if (type instanceof Enumeration) {
            const literal = type.literals.find(literal => literal.key === serialization)
            if (literal === undefined) {
                problemReporter.reportProblem(`"${serialization}" is not the key of any of the literals of the enumeration "${type.name}" in language "${type.language.name}"`)
                return undefined
            }
            return encodingOfEnumerationLiteral(literal)
        }
        // TODO  StructuredDataType
        problemReporter.reportProblem(`property ${property.name} on classifier ${property.classifier.name} is not handled by this property value deserializer, because its type is neither a primitive type nor an enumeration`)
        return undefined
    }
}


/**
 * A type def. for functions that serialize the runtime `encoding`, which is the value of the given `property`, as a string,
 * but returning `undefined` in case they don’t know how to.
 */
export type PropertyValueSerializer = (property: Property, encoding: unknown) => string | undefined

/**
 * A type def. for objects that configure {@link PropertyValueSerializer}s.
 */
export type PropertyValueSerializerConfiguration = {

    enumerationLiteralFrom: EnumerationLiteralDecoder

} & Partial<Omit<CompleteSerializationConfiguration, "primitiveValueDeserializerRegistry">>
// TODO  consider omitting the Partial<...> here

/**
 * @return A {@link PropertyValueSerializer} conforming to the given `configuration`.
 */
export const propertyValueSerializerWith = (configuration: PropertyValueSerializerConfiguration): PropertyValueSerializer => {
    const { primitiveValueSerializerRegistry, problemReporter } = completeSerializationConfigurationWithDefaults(configuration)
    const primitiveValueSerializerByType = primitiveValueSerializerRegistry.lookupByKey
    const { enumerationLiteralFrom } = configuration

    return (property, encoding) => {
        const { type } = property
        if (!isResolvedReference(type)) {
            problemReporter.reportProblem(`can't serialize value of property "${property.name}" (on classifier "${property.classifier.name}" in language "${property.classifier.language.name}") having ${isReferenceToSet(type) ? `an unset type` : `unresolved type: ${isUnresolvedReference(type) && type.resolveInfo !== undefined ? ` -> ${type.resolveInfo}` : ``}`}: ${encoding}`)
            return undefined
        }
        if (type instanceof PrimitiveType) {
            const primitiveValueSerializer = primitiveValueSerializerByType(type)
            if (primitiveValueSerializer === undefined) {
                problemReporter.reportProblem(`couldn’t find a serializer for the primitive type ${type.name}`)
                return undefined
            }
            return primitiveValueSerializer(encoding)
        }
        if (type instanceof Enumeration) {
            const enumerationLiteral = enumerationLiteralFrom(encoding, type)
            if (enumerationLiteral === null) {
                problemReporter.reportProblem(`couldn’t deduce literal of enumeration ${type.name} from runtime encoding: ${encoding}`)
                return undefined
            }
            return enumerationLiteral.key
        }
        // TODO  StructuredDataType
        problemReporter.reportProblem(`property ${property.name} on classifier ${property.classifier.name} is not handled by this property value deserializer, because its type is neither a primitive type nor an enumeration`)
        return undefined
    }
}

