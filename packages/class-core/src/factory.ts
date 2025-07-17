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

import { lazyMapGet } from "@lionweb/ts-utils"
import { ILanguageBase, NodeBaseFactory } from "./base-types.js"
import { DeltaHandler } from "./deltas/index.js"

/**
 * @return a {@link NodeBaseFactory factory function} that works for all given {@link ILanguageBase language bases}.
 */
export const combinedFactoryFor = (languageBases: ILanguageBase[], handleDelta?: DeltaHandler): NodeBaseFactory => {
    // create lookup map:
    const languageKey2version2factory: { [key: string]: { [version: string]: NodeBaseFactory } } = {}
    languageBases.forEach((languageBase) => {
        const {key, version} = languageBase.language
        const version2factory = lazyMapGet(languageKey2version2factory, key, () => ({}))
        lazyMapGet(version2factory, version, () => languageBase.factory(handleDelta))
            // (Note: don't destructure factory from languageBase, as that will unbind it as "this"!)
    })

    return (classifier, id) => {
        const {key, version, name} = classifier.language
        const version2factory = languageKey2version2factory[key]
        if (version2factory === undefined) {
            throw new Error(`language ${name} with key=${key} not known`)
        }
        const factory = version2factory[version]
        if (factory === undefined) {
            const candidateVersions = Object.keys(version2factory)
            throw new Error(`language ${name} with key=${key} and version=${version} not known${candidateVersions.length > 0 ? `- candidate version${candidateVersions.length > 1 ? `s` : ``}: ${candidateVersions.join(", ")}` : ``}`)
        }
        return factory(classifier, id)
    }
}

