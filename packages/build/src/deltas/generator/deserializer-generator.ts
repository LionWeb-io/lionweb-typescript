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
import { sortedStrings } from "@lionweb/ts-utils"
import { asString, commaSeparated } from "littoral-templates"

import {
    Delta,
    FeatureType,
    IndexType,
    NodeType,
    PrimitiveValueType,
    RefOnly,
    Type
} from "../definition/Deltas.g.js"
import { tsTypeForFeatureKind } from "./helpers.js"
import { isUnresolvedReference } from "@lionweb/core"

const deserializationExpressionForField = (name: string, type: Type) => {
    if (type instanceof FeatureType) {
        const tsMetaType = tsTypeForFeatureKind(type.kind)
        return `resolved${tsMetaType}From(delta.${name}, ${(isUnresolvedReference(type.container) ? undefined : type.container?.name) ?? "<?container?>"}.classifier)`
    }
    if (type instanceof NodeType) {
        return type.serialization instanceof RefOnly ? `idMapping.fromRefId(delta.${name})` : `idMapping.nodeBaseFromId(delta.${name})`
    }
    if (type instanceof IndexType || type instanceof PrimitiveValueType) {
        return `delta.${name}`
    }
    throw new Error(`unhandled subtype ${type.constructor.name} of Type in deserializationExpressionForField`)
}

const deserializationBlockForDelta = ({name, fields}: Delta) =>
    [
        fields.map((field) => `const ${field.name} = ${deserializationExpressionForField(field.name, field.type)};`),
        `return new ${name}Delta(${fields.map(({name}) => name).join(", ")});`
    ]


export const deserializerForDeltas = (deltas: Delta[], header?: string) =>
    asString([
        header ?? [],
        `import { featureResolversFor } from "@lionweb/core";`,
        `import { ILanguageBase } from "../../base-types.js";`,
        `import { IDelta } from "../base.js";`,
        `import { IdMapping } from "../../id-mapping.js";`,
        `import { SerializedDelta } from "./types.g.js";`,
        `import { DeltaDeserializer } from "./base.js";`,
        `import {`,
        indent(commaSeparated(sortedStrings(deltas.map(({name}) => `${name}Delta`)))),
        `} from "../types.g.js";`,
        ``,
        ``,
        `export const deltaDeserializer = (languageBases: ILanguageBase[], idMapping: IdMapping): DeltaDeserializer => {`,
        indent([
            `const { resolvedPropertyFrom, resolvedContainmentFrom, resolvedReferenceFrom } = featureResolversFor(languageBases.map(({language}) => language));`,
            `const deserializedDelta = (delta: SerializedDelta): IDelta => {`,
            indent([
                `switch (delta.kind) {`,
                indent([
                    deltas.map((delta) => [
                        `case "${delta.name}": {`,
                        indent(deserializationBlockForDelta(delta)),
                        `}`
                    ])
                ]),
                `}`
            ]),
            `}`,
            `return deserializedDelta;`
        ]),
        `}`,
        ``
    ])

