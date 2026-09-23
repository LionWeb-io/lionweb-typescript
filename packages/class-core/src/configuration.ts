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

import {
    CompleteSerializationConfiguration,
    propertyValueDeserializerWith,
    propertyValueSerializerWith
} from "@lionweb/core"

import { FactoryConfiguration } from "./base-types.js"
import { combinedLanguageBaseLookupFor } from "./factory.js"
import { nodeBaseReader } from "./serializer.js"


/**
 * A type def. to capture all variability of (de-)serialization of models based on {@link INodeBase}.
 */
export type NodeBaseSerializationConfiguration = FactoryConfiguration & Partial<CompleteSerializationConfiguration>


/**
 * @return a {@link PropertyValueDeserializer} for {@link INodeBase}-based models for the given deserialization configuration.
 */
export const nodeBasePropertyValueDeserializerWith = (configuration: Omit<NodeBaseSerializationConfiguration, "primitiveValueSerializerRegistry">) => {
    const languageBaseFor = combinedLanguageBaseLookupFor(configuration.languageBases)
    return propertyValueDeserializerWith({
        encodingOfEnumerationLiteral: (literal) => languageBaseFor(literal.enumeration.language).enumLiteralFrom(literal),
        ...configuration
    })
}

/**
 * @return a {@link PropertyValueSerializer} for {@link INodeBase}-based models for the given serialization configuration.
 */
export const nodeBasePropertyValueSerializerWith = (configuration: Omit<Partial<CompleteSerializationConfiguration>, "primitiveValueDeserializerRegistry">) =>
    propertyValueSerializerWith({
        ...configuration,
        enumerationLiteralFrom: nodeBaseReader.enumerationLiteralFrom
    })

