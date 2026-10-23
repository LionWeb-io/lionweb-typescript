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

import { LionWebJsonChunk, LionWebJsonMetaPointer, LionWebKey, LionWebVersion, chunkTransformerWith } from "@lionweb/json"


/**
 * Configuration for version replacement.
 *
 * Tip: combine a `overallReplacementVersion` with a `versionMap`
 * that lists languages for which the version needs to remain stable.
 */
export type VersionReplacementConfiguration = Partial<{
    /**
     * A map from *language key* to *language version _to set to_*.
     * Any meta pointer referencing that language gets its version set to the value in the map.
     */
    versionMap: Record<LionWebKey, LionWebVersion>,
    /**
     * A version to set in ***every*** meta pointer,
     * _except_ for meta pointers referencing a language present in `versionMap`
     * (which takes precedence.)
     *
     * This is useful for migrations of one language, or version-uniform languages.
     */
    overallReplacementVersion: LionWebVersion
}>

/**
 * @return a copy of the given {@link LionWebJsonChunk serialization chunk} with language versions
 * updated according to the given {@link VersionReplacementConfiguration}.
 */
export const withUpdatedLanguageVersions = (
    chunk: LionWebJsonChunk,
    { versionMap, overallReplacementVersion }: VersionReplacementConfiguration
): LionWebJsonChunk => {
    const updatedLanguageTo = (languageKey: LionWebKey, currentVersion: LionWebVersion): LionWebVersion =>
        versionMap && languageKey in versionMap
            ? versionMap[languageKey]
            : (overallReplacementVersion ?? currentVersion)
    const updatedMetaPointer = ({ language, version, key }: LionWebJsonMetaPointer): LionWebJsonMetaPointer => ({
        language,
        version: updatedLanguageTo(language, version),
        key
    })

    return chunkTransformerWith({
        usedLanguage: ({ key, version }) => ({
            key,
            version: updatedLanguageTo(key, version)
        }),
        classifierMetaPointer: updatedMetaPointer,
        featureMetaPointer: updatedMetaPointer
    })(chunk)
}

