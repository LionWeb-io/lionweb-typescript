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

import { LionWebJsonChunk } from "@lionweb/json"
import {
    DefaultPrimitiveTypeDeserializer,
    defaultSimplisticHandler,
    deserializeChunk,
    Language,
    lioncore,
    lioncoreBuiltins,
    nodesExtractorUsing,
    SimplisticHandler
} from "@lionweb/core"
import { lioncoreExtractionFacade } from "@lionweb/core/dist/m3/facade.js"
import { ioLionWebMpsSpecificLanguage } from "./definition.js"
import { combinedWriter } from "./facade.js"

/**
 * @return the deserialization of the given {@link LionWebJsonChunk serialization chunk} as an array of {@link Language languages}.
 * Any LionCore/M3 node can be annotated using annotations from the `io.lionweb.mps.specific` language.
 * Problems are reported through the given {@link SimplisticHandler} which defaults to {@link defaultSimplisticHandler}.
 */
export const deserializeLanguagesWithIoLionWebMpsSpecific = (serializationChunk: LionWebJsonChunk, problemHandler: SimplisticHandler = defaultSimplisticHandler) =>
    deserializeChunk(
        serializationChunk,
        combinedWriter,
        [lioncore, ioLionWebMpsSpecificLanguage],
        [lioncore, lioncoreBuiltins].flatMap(nodesExtractorUsing(lioncoreExtractionFacade)),
        new DefaultPrimitiveTypeDeserializer(),
        problemHandler
    ).filter((node) => node instanceof Language) as Language[]

