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

import { Annotation, Concept, Interface, LanguageEntity, PrimitiveType } from "@lionweb/core"

type EntityMetaType = "Annotation" | "Concept" | "Enumeration" | "Interface" | "PrimitiveType"

export const entityMetaType = (entity: LanguageEntity): EntityMetaType => {
    if (entity instanceof Annotation) {
        return "Annotation"
    }
    if (entity instanceof Concept) {
        return "Concept"
    }
    if (entity instanceof Interface) {
        return "Interface"
    }
    if (entity instanceof PrimitiveType) {
        return "PrimitiveType"
    }
    throw new Error(`unhandled LanguageEntity sub type ${entity.constructor.name}`)
}

