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

export type { ValueDeserializer, ValueSerializer} from "./base-types.js"
export { newPrimitiveValueDeserializerRegistry, newPrimitiveValueSerializerRegistry, type PrimitiveValueDeserializerRegistry, type PrimitiveValueSerializerRegistry } from "./primitive-types.js"
export type { PropertyValueDeserializer, PropertyValueDeserializerConfiguration, PropertyValueSerializer, PropertyValueSerializerConfiguration } from "./property-values.js"
export { propertyValueDeserializerWith, propertyValueSerializerWith } from "./property-values.js"
export { standardDeserializers, standardSerializers } from "./standard-primitive-types.js"

