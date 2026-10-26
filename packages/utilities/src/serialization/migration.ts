// Copyright 2026 TRUMPF Laser SE and other contributors
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
// SPDX-FileCopyrightText: 2026 TRUMPF Laser SE and other contributors
// SPDX-License-Identifier: Apache-2.0

import { chunkTransformerWith, LionWebJsonChunk, LionWebJsonMetaPointer } from "@lionweb/json"
import { LionWebVersion, LionWebVersions } from "@lionweb/core"

const M3Key = LionWebVersions.v2023_1.lioncoreFacade.language.key
const BuiltinsKey = LionWebVersions.v2023_1.builtinsFacade.language.key
const v2023_1LionCoreM3IdPrefix = "-id-"
const v2023_1LionCoreBuiltinsIdPrefix = "LionCore-builtins-"

/**
 * @return a {@link LionWebJsonChunk serialization chunk} in which _all_ references to LionCore M3 and built-ins languages
 * have been migrated (set) to the given {@link LionWebVersion `targetVersion}.
 */
export const migratedToLionWebVersion = (chunk: LionWebJsonChunk, targetVersion: LionWebVersion): LionWebJsonChunk => {
    const setVersionForLionCoreInMetaPointer = ({ language, version, key }: LionWebJsonMetaPointer): LionWebJsonMetaPointer => ({
        language,
        version: (language === M3Key || language === BuiltinsKey) ? targetVersion.serializationFormatVersion : version,
        key
    })
    return chunkTransformerWith({
        serializationFormatVersion: (_) => targetVersion.serializationFormatVersion,
        usedLanguage: ({ key, version }) => ({
            key,
            version: (key === M3Key || key === BuiltinsKey) ? targetVersion.serializationFormatVersion : version
        }),
        classifierMetaPointer: setVersionForLionCoreInMetaPointer,
        featureMetaPointer: setVersionForLionCoreInMetaPointer,
        referenceTarget: (target) => {
            const { reference } = target
            if (reference !== null) {
                if (reference.startsWith(v2023_1LionCoreBuiltinsIdPrefix)) {
                    return {
                        reference: null,
                        resolveInfo: `LionWeb.LionCore_builtins.${reference.substring(v2023_1LionCoreBuiltinsIdPrefix.length)}`
                    }
                }
                if (reference.startsWith(v2023_1LionCoreM3IdPrefix)) {
                    return {
                        reference: null,
                        resolveInfo: `LionWeb.LionCore_M3.${reference.substring(v2023_1LionCoreM3IdPrefix.length)}`
                    }
                }
            }
            return target
        }
    })(chunk)
}

