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

import { indent } from "@lionweb/textgen-utils"
import { asString, commaSeparated, when } from "littoral-templates"

import {
    CustomType,
    Delta,
    FeatureType,
    Field,
    IndexType,
    NodeType,
    PrimitiveValueType,
    RefOnly,
    Type
} from "../definition/Deltas.g.js"
import { tsTypeForFeatureKind } from "./helpers.js"

const tsTypeForClassField = (type: Type) => {
    if (type instanceof FeatureType) {
        return tsTypeForFeatureKind(type.kind)
    }
    if (type instanceof NodeType) {
        return type.serialization instanceof RefOnly ? "SingleRef<INodeBase>" : "INodeBase"
    }
    if (type instanceof IndexType) {
        return "number"
    }
    if (type instanceof PrimitiveValueType) {
        return "T"
    }
    if (type instanceof CustomType) {
        return type.type
    }
    throw new Error(`type ${type.classifier.name} not handled by tsTypeForClassField`)
}

const classField = ({name, type}: Field) =>
    `public readonly ${name}: ${tsTypeForClassField(type)}`

const typeForDelta = ({name, documentation, fields}: Delta) => [
    when(documentation !== undefined)(() => [
        `/**`,
        documentation!.split("\n").map((line) => ` * ${line}`),
        ` */`
    ]),
    `export class ${name}Delta${fields.some((field) => field.type instanceof PrimitiveValueType) ? "<T>" : ""} implements IDelta {`,
    indent([
        when(fields.length > 0)([
            `constructor(`,
            indent(commaSeparated(
                fields.map(classField)
            )),
            `) {`,
            `}`,
        ])
    ]),
    `}`,
    ``
]


export const typesForDeltas = (deltas: Delta[], header?: string) => {
    return asString([
        header ?? [],
`import {
    Containment,
    Property,
    Reference,
    SingleRef
} from "@lionweb/core";

import { INodeBase } from "../base-types.js";
import { IDelta } from "./base.js";`,
        ``,
        ``,
        deltas.map(typeForDelta)
    ])
}

