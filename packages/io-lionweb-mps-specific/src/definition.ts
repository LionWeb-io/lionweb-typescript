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

import { Classifier, deserializeLanguages, Language, LionWebVersions } from "@lionweb/core"
import { LionWebJsonChunk } from "@lionweb/json"

import languageDefinitionJson from "../meta/io.lionweb.mps.specific.json" with { type: "json" }

const { lioncoreFacade, builtinsFacade } = LionWebVersions.v2023_1

export const ioLionWebMpsSpecificLanguage: Language = deserializeLanguages(languageDefinitionJson as LionWebJsonChunk, lioncoreFacade.language, builtinsFacade.language)[0]

const classifierNamed = (name: string) =>
    ioLionWebMpsSpecificLanguage.entities
        .find((entity) => entity instanceof Classifier && entity.name === name)! as Classifier

/**
 * The classifiers of the language, as a constant dictionary for type(d) convenience.
 */
export const ioLionWebMpsSpecificClassifiers = {
    ConceptDescription: classifierNamed("ConceptDescription"),
    Deprecated: classifierNamed("Deprecated"),
    KeyedDescription: classifierNamed("KeyedDescription"),
    ShortDescription: classifierNamed("ShortDescription"),
    VirtualPackage: classifierNamed("VirtualPackage")
} as const
/*
 * Note: `as const` only works for object literals, not for programmatically-created objects.
 * There’s a unit test that checks whether `ioLionWebMpsSpecificClassifiers` is complete and correct.
 */

