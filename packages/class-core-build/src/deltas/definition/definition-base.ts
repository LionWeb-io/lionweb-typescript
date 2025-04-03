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

import {
    Delta,
    Deltas,
    FeatureKinds,
    FeatureType,
    Field,
    IndexType,
    NodeSerialization,
    NodeType,
    PrimitiveValueType,
    RefOnly,
    SerializeSubTree,
    Type
} from "./Deltas.g.js"


export const deltas = Deltas.create("Deltas")

let id = 0
const newId = () =>
    `${++id}`


export const defineDelta = (kind: string, fields: Field[], documentation?: string) => {
    const delta = Delta.create(newId())
    delta.name = kind
    delta.documentation = documentation
    deltas.addDeltas(delta)
    fields.forEach((field) => {
        delta.addFields(field)
    })
}

const field = (name: string, type: Type): Field => {
    const field = Field.create(newId())
    field.name = name
    field.type = type
    return field
}

export const serializeSubTreeAs = (fieldName: string) => {
    const serialization = SerializeSubTree.create(newId())
    serialization.fieldName = fieldName
    return serialization
}

export const refOnly = () =>
    RefOnly.create(newId())

export const node = (fieldName: string, serialization?: NodeSerialization): Field => {
    const nodeNode = NodeType.create(newId())
    nodeNode.serialization = serialization
    return field(fieldName, nodeNode)
}

export const feature = (fieldName: string, kind: FeatureKinds, container?: Field): Field => {
    const featureNode = FeatureType.create(newId())
    featureNode.kind = kind
    featureNode.container = container
    return field(fieldName, featureNode)
}

export const primitiveValue = (fieldName: string) =>
    field(fieldName, PrimitiveValueType.create(newId()))

export const index = (fieldName: string) =>
    field(fieldName, IndexType.create(newId()))

export const parentage = (containerName: string, featureName: string, featureKind: FeatureKinds): Field[] => {
    const nodeField = node(containerName)
    return [
        nodeField,
        feature(featureName, featureKind, nodeField)
    ]
}

