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

import { LionWebVersions } from "@lionweb/core"
import { LionWebJsonDeltaChunk } from "@lionweb/json"
import { SerializedDelta } from "./types.g.js"
import { IDelta } from "../base.js"
import { INodeBase } from "../../base-types.js"
import { propertyValueSerializerWith, serializeNodeBases } from "../../serializer.js"


/**
 * A type for functions that deserialize {@link SerializedDelta serialized deltas} into “proper” {@link IDelta deltas}.
 */
export type DeltaDeserializer = (delta: SerializedDelta) => IDelta;


/**
 * A function that serializes the given value of the given {@link Property property},
 * using the same {@link PropertyValueSerializer} instance as the {@link serializeNodeBases} function,
 * and the same treatment of enumeration values.
 *
 * @deprecated Not parametrized in {@link LionWebVersion}.
 */
export const defaultPropertyValueSerializer = propertyValueSerializerWith({ primitiveValueSerializer: LionWebVersions.v2023_1.builtinsFacade.propertyValueSerializer })


/**
 * @return the serialization of the given {@link INodeBase `node`} as a {@link LionWebJsonDeltaChunk delta chunk}
 *  — supposedly of *single* type.
 */
export const serializeAsDeltaChunk = (node: INodeBase): LionWebJsonDeltaChunk => {
    const { nodes } = serializeNodeBases([node])
    return {
        nodes
    }
}

