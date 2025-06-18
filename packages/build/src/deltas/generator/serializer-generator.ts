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

import { sortedStrings } from "@lionweb/ts-utils"
import { indent } from "@lionweb/textgen-utils"
import { asString, commaSeparated } from "littoral-templates"

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

const serializationExpressionFor = (name: string, type: Type) => {
    if (type instanceof FeatureType) {
        return `metaPointerFor(delta.${name})`
    }
    if (type instanceof NodeType) {
        return type.serialization instanceof RefOnly ? `idFrom(delta.${name})` : `delta.${name}.id`
    }
    if (type instanceof IndexType) {
        return `delta.${name}`
    }
    if (type instanceof PrimitiveValueType) {
        return `serializePropertyValue(delta.${name}, delta.property)`
    }
    throw new Error(`type ${type.classifier.name} not handled by serializationExpressionFor`)
}


const serializationsForField = ({name, type}: Field) => [
    `${name}: ${serializationExpressionFor(name, type)}`,
    ...(isSerializingAsChunk(type)
            ? [`${(type.serialization as SerializeSubTree).fieldName}: serializeNodeBases([delta.${name}])`]
            : []
    )
]

const serializationOf = ({name, fields}: Delta) =>
    [
        `if (delta instanceof ${name}Delta) {`,
        indent([
            `return {`,
            indent(
                commaSeparated([
                    `kind: "${name}"`,
                    ...fields.flatMap(serializationsForField)
                ])
            ),
            `} as ${name}SerializedDelta;`
        ]),
        `}`,
        ``
    ]

export const serializerForDeltas = (deltas: Delta[], header?: string) =>
    asString([
        header ?? [],
        `import {metaPointerFor} from "@lionweb/core";`,
        `import {IDelta} from "../base.js";`,
        `import {`,
        indent(
            commaSeparated(sortedStrings(deltas.map(({name}) => `${name}Delta`)))
        ),
        `} from "../types.g.js";`,
        `import {`,
        indent(
            commaSeparated(sortedStrings(deltas.map(({name}) => `${name}SerializedDelta`)))
        ),
        `} from "./types.g.js";`,
        `import {idFrom, serializePropertyValue} from "./serializer-helpers.js";`,
        `import {serializeNodeBases} from "../../serializer.js";`,
        ``,
        ``,
        `export const serializeDelta = (delta: IDelta) => {`,
        indent([
            deltas.map(serializationOf),
            "throw new Error(`serialization of delta of class ${delta.constructor.name} not implemented`);"
        ]),
        `}`
    ])

