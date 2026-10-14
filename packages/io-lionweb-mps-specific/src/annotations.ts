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

import { M3Concept } from "@lionweb/core"
import { LionWebJsonChunk } from "@lionweb/json"
import { withUpdatedLanguageVersions } from "@lionweb/utilities"

import { IoLionWebMpsSpecificAnnotation } from "./implementation.js"
import { ioLionWebMpsSpecificLanguage } from "./definition.js"


/**
 * @return the io.lionweb.mps.specific annotations present on the given node.
 */
export const ioLionWebMpsSpecificAnnotationsFrom = (node: M3Concept): IoLionWebMpsSpecificAnnotation[] =>
    node
        .annotations
        .filter((annotation) => annotation instanceof IoLionWebMpsSpecificAnnotation)


/**
 * Replaces stated version "0" of language "io-lionweb-mps-specific" with its actual version.
 */
export const repairIoLionWebMpsSpecificAnnotations = (serializationChunk: LionWebJsonChunk) =>
    withUpdatedLanguageVersions(serializationChunk, { [ioLionWebMpsSpecificLanguage.key]: ioLionWebMpsSpecificLanguage.version })

