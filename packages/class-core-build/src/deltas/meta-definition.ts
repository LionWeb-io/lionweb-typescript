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

import {builtinClassifiers, builtinPrimitives, concatenator, LanguageFactory} from "@lionweb/core"

const factory = new LanguageFactory("Deltas", "0", concatenator("-"), concatenator("-"))
export const deltasLanguage = factory.language

const Deltas = factory.concept("Deltas", false).isPartition()

const Type = factory.interface("Type")

const Field = factory.concept("Field", false).implementing(builtinClassifiers.inamed)
const Field_type = factory.containment(Field, "type").ofType(Type)
Field.havingFeatures(Field_type)


const FeatureKinds = factory.enumeration("FeatureKinds")
FeatureKinds
    .havingLiterals(
        factory.enumerationLiteral(FeatureKinds, "property"),
        factory.enumerationLiteral(FeatureKinds, "containment"),
        factory.enumerationLiteral(FeatureKinds, "reference")
    )

const FeatureType = factory.concept("FeatureType", false).implementing(Type)
const FeatureType_kind = factory.property(FeatureType, "kind").ofType(FeatureKinds)
const FeatureType_container = factory.reference(FeatureType, "container").ofType(Field)
    .isOptional()   // FIXME  make required later
FeatureType.havingFeatures(FeatureType_kind, FeatureType_container)

const NodeSerialization = factory.interface("NodeSerialization")

const SerializeSubTree = factory.concept("SerializeSubTree", false).implementing(NodeSerialization)
const SerializeSubTree_fieldName = factory.property(SerializeSubTree, "fieldName").ofType(builtinPrimitives.stringDatatype)
SerializeSubTree.havingFeatures(SerializeSubTree_fieldName)

const RefOnly = factory.concept("RefOnly", false).implementing(NodeSerialization)

const NodeType = factory.concept("NodeType", false).implementing(Type)
const NodeType_serialization = factory.containment(NodeType, "serialization").isOptional().ofType(NodeSerialization)
NodeType.havingFeatures(NodeType_serialization)

const IndexType = factory.concept("IndexType", false).implementing(Type)

const PrimitiveValueType = factory.concept("PrimitiveValueType", false).implementing(Type)

const Delta = factory.concept("Delta", false).implementing(builtinClassifiers.inamed)
const Delta_documentation = factory.property(Delta, "documentation").isOptional().ofType(builtinPrimitives.stringDatatype)
const Delta_fields = factory.containment(Delta, "fields").isOptional().isMultiple().ofType(Field)
Delta.havingFeatures(Delta_documentation, Delta_fields)

const Deltas_deltas = factory.containment(Deltas, "deltas").isOptional().isMultiple().ofType(Delta)
Deltas.havingFeatures(Deltas_deltas)

deltasLanguage.havingEntities(
    Deltas,
    Delta,
    Field,
    Type,
    FeatureKinds,
    FeatureType,
    NodeType,
    NodeSerialization,
    SerializeSubTree,
    RefOnly,
    IndexType,
    PrimitiveValueType
)

