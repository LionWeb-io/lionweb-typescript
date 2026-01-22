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

import { lioncoreBuiltinsFacade, LanguageFactory } from "@lionweb/core"
import { concatenator } from "@lionweb/ts-utils"

const { inamed } = lioncoreBuiltinsFacade.classifiers
const { stringDataType } = lioncoreBuiltinsFacade.primitiveTypes

const factory = new LanguageFactory("Deltas", "0", concatenator("-"), concatenator("-"))
export const deltasLanguage = factory.language

const Deltas = factory.concept("Deltas", false).isPartition()

const Type = factory.interface("Type")

const Field = factory.concept("Field", false).implementing(inamed)
factory.containment(Field, "type").ofType(Type)


const FeatureKinds = factory.enumeration("FeatureKinds")
FeatureKinds
    .havingLiterals(
        factory.enumerationLiteral(FeatureKinds, "property"),
        factory.enumerationLiteral(FeatureKinds, "containment"),
        factory.enumerationLiteral(FeatureKinds, "reference")
    )

const FeatureType = factory.concept("FeatureType", false).implementing(Type)
factory.property(FeatureType, "kind").ofType(FeatureKinds)
factory.reference(FeatureType, "container").ofType(Field).isOptional()   // FIXME  make required later

const NodeSerialization = factory.interface("NodeSerialization")

const SerializeSubTree = factory.concept("SerializeSubTree", false).implementing(NodeSerialization)
factory.property(SerializeSubTree, "fieldName").ofType(stringDataType)

factory.concept("RefOnly", false).implementing(NodeSerialization)

const NodeType = factory.concept("NodeType", false).implementing(Type)
factory.containment(NodeType, "serialization").isOptional().ofType(NodeSerialization)

factory.concept("IndexType", false).implementing(Type)

factory.concept("PrimitiveValueType", false).implementing(Type)

const CustomType = factory.concept("CustomType", false).implementing(Type)
factory.property(CustomType, "type").ofType(stringDataType)
factory.property(CustomType, "serializationType").ofType(stringDataType)
factory.property(CustomType, "serializationExpr").ofType(stringDataType)
factory.property(CustomType, "deserializationExpr").ofType(stringDataType)

const Delta = factory.concept("Delta", false).implementing(inamed)
factory.property(Delta, "documentation").isOptional().ofType(stringDataType)
factory.containment(Delta, "fields").isOptional().isMultiple().ofType(Field)

factory.containment(Deltas, "deltas").isOptional().isMultiple().ofType(Delta)

