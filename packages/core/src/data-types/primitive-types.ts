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

import { Registry } from "@lionweb/ts-utils"
import { ValueDeserializer, ValueSerializer } from "./base-types.js"
import { areSameEntities } from "../m3/functions.js"
import { PrimitiveType } from "../m3/types.js"

/**
 * Type def. for a sealable registry mapping `PrimitiveType`s to corresponding `ValueDeserializer`s.
 */
export type PrimitiveValueDeserializerRegistry = Registry<PrimitiveType, ValueDeserializer<unknown>>

/**
 * @return a new, empty {@link PrimitiveValueDeserializerRegistry}.
 */
export const newPrimitiveValueDeserializerRegistry = (): PrimitiveValueDeserializerRegistry =>
    new Registry<PrimitiveType, ValueDeserializer<unknown>>(areSameEntities)


/**
 * Type def. for a sealable registry mapping `PrimitiveType`s to corresponding `ValueSerializer`s.
 */
export type PrimitiveValueSerializerRegistry = Registry<PrimitiveType, ValueSerializer<unknown>>

/**
 * @return a new, empty {@link PrimitiveValueSerializerRegistry}.
 */
export const newPrimitiveValueSerializerRegistry = (): PrimitiveValueSerializerRegistry =>
    new Registry<PrimitiveType, ValueSerializer<unknown>>(areSameEntities)

