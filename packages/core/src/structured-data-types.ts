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

import { asMinimalJsonString, mapValues } from "@lionweb/ts-utils"
import { identificationForField } from "./m3/aux-functions.js"
import { Enumeration, PrimitiveType, StructuredDataType } from "./m3/index.js"
import { isResolvedReference, tryToRenderAsText } from "./references.js"
import { ProblemReporter } from "./reporter.js"


/**
 * Type def. for both the serialization – as plain JSON, prior to conversion to a string –
 * and the runtime representation of a value of a {@link StructuredDataType}.
 * The `unknown` type for the value should actually be `string | Structure`,
 * but that produces a (directly-)circular type reference,
 * which TypeScript can’t handle (yet).
 */
export type StructuredData = Record<string, unknown>

/**
 * @return whether the given `value` conforms to the {@link StructuredData} type def. (=type guard)
 */
const isStructuredData = (value: unknown): value is StructuredData =>
    value !== null
    && typeof value === "object"
    && !Array.isArray(value)


/**
 * Type def. for functions that can serialize simple data of either {@link Enumeration} or {@link PrimitiveType} type.
 */
export type SimpleDataDeserializer = (type: Enumeration | PrimitiveType, serialization: string) => unknown

/**
 * Type def. for functions that can deserialize the given `serialization` of an instance of the given `structuredDataType`.
 */
export type StructuredDataDeserializer = (structuredDataType: StructuredDataType, serialization: StructuredData, problemReporter: ProblemReporter) => StructuredData

/**
 * @return a {@link StructuredDataDeserializer}, given a {@link SimpleDataDeserializer}.
 *
 * Note that the {@link StructuredDataDeserializer} throws an error when it encounters a cyclic structured data,
 * but without providing anything in the way of diagnostic information.
 * (At least, you don’t get a `RangeError: Maximum call stack size exceeded`.)
 * This would be an “exotic” situation, though:
 * in principle, `serialization` would be parsed JSON which can’t have any cyclicity.
 * So, for this to arise, a bad actor would have to try and deserialize cyclic structured data
 * that couldn’t be serialized as JSON in the first place.
 */
export const structuredDataDeserializer = (simpleDataDeserializer: SimpleDataDeserializer) => {
    const visited: StructuredData[] = []
    const deserialized: StructuredDataDeserializer = (structuredDataType, serialization, problemReporter) => {
        if (visited.indexOf(serialization) > -1) {
            throw new Error(`unable to deserialize cyclic structured data`)
        }
        visited.push(serialization)
        const deserialization: StructuredData = {}
        const keys = mapValues(serialization, (_) => true)
        for (const field of structuredDataType.fields) {
            if (!(field.key in serialization)) {
                problemReporter.reportProblem(`${identificationForField(field)} is not present in serialization: ${asMinimalJsonString(serialization)}`)
                continue
            }
            keys[field.key] = false
            if (!isResolvedReference(field.type)) {
                const maybeTypeAsText = tryToRenderAsText(field.type)
                problemReporter.reportProblem(`${identificationForField(field)} has an unresolved type${maybeTypeAsText === undefined ? "" : `: ${maybeTypeAsText}`}`)
                continue
            }
            const encoding = serialization[field.key]
            if (field.type instanceof Enumeration || field.type instanceof PrimitiveType) {
                if (encoding === null || typeof encoding === "string") {
                    const value = encoding === null ? undefined : simpleDataDeserializer(field.type, encoding)
                    deserialization[field.name] = value
                    if (value === undefined) {
                        problemReporter.reportProblem(`${identificationForField(field)} doesn’t deserialize as ${field.type.name.toLowerCase()} from: "${encoding}"`)
                    }
                } else {
                    problemReporter.reportProblem(`${identificationForField(field)} is not encoded as string or null in deserialization, but as: ${encoding} (${typeof encoding})`)
                }
            } else if (field.type instanceof StructuredDataType) {
                if (isStructuredData(encoding)) {
                    const subDeserialization = deserialized(field.type, encoding as StructuredData, problemReporter)
                    deserialization[field.name] = subDeserialization
                } else {
                    problemReporter.reportProblem(`${identificationForField(field)} is not serialized as structured data despite its type being the SDT "${field.type.name}"`)
                }
            } else {
                throw new Error(`has an unhandled meta-type in deserialization`)
            }
        }
        const extraKeys = Object.entries(keys)
            .filter(([_, stillThere]) => stillThere)
            .map(([key, _]) => key)
        if (extraKeys.length > 0) {
            problemReporter.reportProblem(`the following unknown field keys were encountered in a serialization of an instance of SDT type "${structuredDataType.name}": ${extraKeys.map((key) => `"${key}"`).join(", ")}`)
        }
        return deserialization
    }
    return deserialized
}


/**
 * Type def. for functions that can serialize simple data of either {@link Enumeration} or {@link PrimitiveType} type.
 */
export type SimpleDataSerializer = (type: Enumeration | PrimitiveType, value: unknown) => string | undefined

/**
 * Type def. for functions that can serialize the given `structure` instance of the given `structuredDataType`.
 */
export type StructuredDataSerializer = (structuredDataType: StructuredDataType, structuredData: StructuredData, problemReporter: ProblemReporter) => StructuredData

/**
 * @return a {@link StructuredDataSerializer}, given a {@link SimpleDataSerializer}.
 * Note that the {@link StructuredDataSerializer} throws an error when it encounters a cyclic structured data,
 * but without providing anything in the way of diagnostic information.
 * (At least, you don’t get a `RangeError: Maximum call stack size exceeded`.)
 */
export const structuredDataSerializer = (simpleDataSerializer: SimpleDataSerializer) => {
    const visited: StructuredData[] = []
    const serialized: StructuredDataSerializer = (structuredDataType, structuredData, problemReporter) => {
        if (visited.indexOf(structuredData) > -1) {
            throw new Error(`unable to serialize cyclic structured data`)
        }
        visited.push(structuredData)
        const serialization: { [fieldName: string]: unknown } = {}
        const names = mapValues(structuredData, (_) => true)
        for (const field of structuredDataType.fields) {
            if (!(field.name in structuredData)) {
                problemReporter.reportProblem(`${identificationForField(field)} is not set in given structure: ${asMinimalJsonString(structuredData)}`)
                continue
            }
            names[field.name] = false
            if (!isResolvedReference(field.type)) {
                const maybeTypeAsText = tryToRenderAsText(field.type)
                problemReporter.reportProblem(`${identificationForField(field)} has an unresolved type${maybeTypeAsText === undefined ? "" : `: ${maybeTypeAsText}`}`)
                continue
            }
            const value = structuredData[field.name]
            if (field.type instanceof Enumeration || field.type instanceof PrimitiveType) {
                serialization[field.key] = simpleDataSerializer(field.type, value)
            } else if (field.type instanceof StructuredDataType) {
                if (isStructuredData(value)) {
                    const subSerialization = serialized(field.type, value, problemReporter)
                    serialization[field.key] = subSerialization
                } else {
                    problemReporter.reportProblem(`${identificationForField(field)} — its value is not structured data despite its type being the SDT "${field.type.name}"`)
                }
            } else {
                throw new Error(`${identificationForField(field)} has an unhandled meta-type in serialization`)
            }
        }
        const extraNames = Object.entries(names)
            .filter(([_, stillThere]) => stillThere)
            .map(([name, _]) => name)
        if (extraNames.length > 0) {
            problemReporter.reportProblem(`the following unknown field names were encountered in structured data of SDT type "${structuredDataType.name}": ${extraNames.map((key) => `"${key}"`).join(", ")}`)
        }
        return serialization
    }
    return serialized
}

