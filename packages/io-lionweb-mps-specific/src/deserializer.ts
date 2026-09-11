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
    consoleProblemReporter,
    deserializeLanguagesFrom,
    deserializerWith,
    Language,
    lioncoreReaderFor,
    LionWebVersion,
    LionWebVersions,
    nodesExtractorUsing,
    ProblemReporter
} from "@lionweb/core"
import { ioLionWebMpsSpecificLanguage } from "./definition.js"
import { combinedWriterFor } from "./facade.js"


/**
 * Type def. for objects that contain all necessary data to deserialize a {@link LionWebJsonChunk serialization chunk}
 * that potentially contains nodes that are annotated with annotations from the `io.lionweb.mps.specific` language.
 */
export type IoLionWebMpsSpecificDeserializationData = {
    /**
     * The {@link LionWebJsonChunk serialization chunk} to deserialize.
     */
    serializationChunk: LionWebJsonChunk
    /**
     * The version of the LionWeb serialization format to deserialize from.
     * Default = {@link LionWebVersions.v2023_1}.
     */
    lionWebVersion?: LionWebVersion
    /**
     * A {@link ProblemReporter} to report problems with.
     * Default = {@link consoleProblemReporter}.
     */
    problemReporter?: ProblemReporter
}


/**
 * @return the deserialization of the given {@link LionWebJsonChunk serialization chunk} as an array of {@link Language languages}.
 * Any LionCore/M3 node can be annotated using annotations from the `io.lionweb.mps.specific` language.
 * Deserialization happens according to the optionally given {@link LionWebVersion}, which defaults to {@link LionWebVersions.v2023_1}.
 * Problems are reported through the optionally given {@link ProblemReporter}, which defaults to {@link consoleProblemReporter}.
 */
export const deserializeLanguagesWithIoLionWebMpsSpecificFrom = ({serializationChunk, lionWebVersion = LionWebVersions.v2023_1, problemReporter = consoleProblemReporter}: IoLionWebMpsSpecificDeserializationData) =>
    deserializerWith({
        writer: combinedWriterFor(lionWebVersion),
        languages: [lionWebVersion.lioncoreFacade.language, ioLionWebMpsSpecificLanguage],
        problemReporter
    })(
        serializationChunk,
        [lionWebVersion.lioncoreFacade.language, lionWebVersion.builtinsFacade.language].flatMap(nodesExtractorUsing(lioncoreReaderFor(lionWebVersion)))
    ).filter((node) => node instanceof Language)


/**
 * Legacy version of {@link deserializeLanguagesWithIoLionWebMpsSpecificFrom} that’s not parametrized with a {@link LionWebVersion},
 * but uses the {@link LionWebVersions.v2023_1}.
 *
 * @deprecated Use {@link deserializeLanguagesWithIoLionWebMpsSpecificFrom} instead.
 */
export const deserializeLanguagesWithIoLionWebMpsSpecific = (serializationChunk: LionWebJsonChunk, problemReporter: ProblemReporter = consoleProblemReporter) =>
    deserializeLanguagesFrom({serializationChunk, problemReporter})

