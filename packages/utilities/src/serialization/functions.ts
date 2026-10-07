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

import { LionWebJsonChunk, LionWebJsonMetaPointer, LionWebKey, LionWebVersion } from "@lionweb/json"

/**
 * @return an array of all languages used by any of the nodes of the given {@lion LionWebJsonChunk chunk},
 * as {@link LionWebJsonUsedLanguage language meta-pointers}.
 * This excludes languages mentioned under the `languages` properties of that chunk.
 */
export const languagesUsedIn = ({ nodes }: LionWebJsonChunk): Record<LionWebKey, LionWebVersion[]> => {
    const map: Record<LionWebKey, LionWebVersion[]> = {}
    const register = ({ language, version }: LionWebJsonMetaPointer) => {
        if (!(language in map)) {
            map[language] = []
        }
        if (map[language].indexOf(version) === -1) {
            map[language].push(version)
        }
    }

    for (const { classifier, properties, containments, references } of nodes) {
        register(classifier)
        for (const { property } of properties) {
            register(property)
        }
        for (const { containment } of containments) {
            register(containment)
        }
        for (const { reference } of references) {
            register(reference)
        }
    }

    return map
}

