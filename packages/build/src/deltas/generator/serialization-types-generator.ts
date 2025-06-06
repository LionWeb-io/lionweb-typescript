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

import { indent } from "@lionweb/class-core-generator"
import { asString, when } from "littoral-templates"

import {
    Delta,
    FeatureType,
    Field,
    IndexType,
    NodeType,
    PrimitiveValueType,
    RefOnly,
    SerializeSubTree,
    Type
} from "../definition/Deltas.g.js"
import { isSerializingAsChunk } from "./helpers.js"

const tsTypeForTypeOfSerializationField = (type: Type) => {
    if (type instanceof FeatureType) {
        return "LionWebJsonMetaPointer"
    }
    if (type instanceof NodeType) {
        return type.serialization instanceof RefOnly ? "IdOrUnresolved" : "LionWebId"
    }
    if (type instanceof IndexType) {
        return "number"
    }
    if (type instanceof PrimitiveValueType) {
        return "string"
    }
    throw new Error(`type ${type.classifier.name} not handled by tsTypeForTypeOfSerializationField`)
}

const fieldsForSerializationType = ({name, type}: Field) => [
    `${name}: ${tsTypeForTypeOfSerializationField(type)}`,
    when(isSerializingAsChunk(type))(() =>
        `${((type as NodeType).serialization as SerializeSubTree).fieldName}: LionWebJsonChunk`
    )
]

const typeForDelta = ({name, fields}: Delta) =>
    [
        `export type ${name}SerializedDelta = {`,
        indent([
            `kind: "${name}"`,
            fields.map(fieldsForSerializationType)
        ]),
        `}`,
        ``
    ]


export const serializationTypesForDeltas = (deltas: Delta[], header?: string) =>
    asString([
        header ?? [],
        `import {IdOrUnresolved} from "@lionweb/core";`,
        `import {LionWebId, LionWebJsonMetaPointer, LionWebJsonChunk} from "@lionweb/json";`,
        ``,
        ``,
        `export type SerializedDelta =`,
        indent([
            deltas.map(({name}) => `| ${name}SerializedDelta`),
            `;`
        ]),
        ``,
        ``,
        deltas.map(typeForDelta)
    ])

