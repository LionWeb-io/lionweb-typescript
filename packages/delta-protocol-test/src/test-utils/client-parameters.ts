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

import { nodeBaseReader } from "@lionweb/class-core"
import { TestLanguageBase } from "@lionweb/class-core-test-language"
import { LionWebVersions, propertyValueDeserializerWith, propertyValueSerializerWith } from "@lionweb/core"

const testLanguageBase = TestLanguageBase.INSTANCE

export const defaultPropertyValueDeserializer = propertyValueDeserializerWith({
    lionWebVersion: LionWebVersions.v2023_1,
    primitiveTypeDeserializerRegistry: LionWebVersions.v2023_1.builtinsFacade.primitiveValueSerializerRegistry,
    encodingOfEnumerationLiteral: testLanguageBase.enumLiteralFrom.bind(testLanguageBase)
})

export const defaultPropertyValueSerializer = propertyValueSerializerWith({
    lionWebVersion: LionWebVersions.v2023_1,
    primitiveTypeSerializerRegistry: LionWebVersions.v2023_1.builtinsFacade.primitiveValueSerializerRegistry,
    enumerationLiteralFrom: nodeBaseReader.enumerationLiteralFrom
})

export const defaultTestClientParameters = {
    url: "",
    repositoryId: "myRepo",
    clientId: "A",
    languageBases: [testLanguageBase],
    propertyValueDeserializer: defaultPropertyValueDeserializer,
    propertyValueSerializer: defaultPropertyValueSerializer
}

