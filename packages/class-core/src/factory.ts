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

import { Language } from "@lionweb/core"
import { lazyMapGet } from "@lionweb/ts-utils"
import { ILanguageBase, NodeBaseFactory } from "./base-types.js"
import { DeltaReceiver } from "./deltas/index.js"


/**
 * @return a function that looks up the {@link ILanguageBase language base} for the {@link Language language} passed to it,
 * from among the given language bases.
 * The returned function throws when the language wasn't among the languages the given bases were for.
 * The lookup is hashmap-backed, so efficient.
 */
export const combinedLanguageBaseLookupFor = (languageBases: ILanguageBase[]): ((language: Language) => ILanguageBase) => {
    // create lookup map:
    const languageKey2version2base: { [key: string]: { [version: string]: ILanguageBase } } = {}
    languageBases.forEach((languageBase) => {
        const {key, version} = languageBase.language
        const version2base = lazyMapGet(languageKey2version2base, key, () => ({}))
        lazyMapGet(version2base, version, () => languageBase)
    })

    return (language) => {
        const {key, version, name} = language
        const version2base = languageKey2version2base[key]
        if (version2base === undefined) {
            throw new Error(`language ${name} with key=${key} not registered`)
        }
        const base = version2base[version]
        if (base === undefined) {
            const candidateVersions = Object.keys(version2base)
            throw new Error(`language ${name} with key=${key} and version=${version} not registered${candidateVersions.length > 0 ? `- candidate version${candidateVersions.length > 1 ? `s` : ``}: ${candidateVersions.join(", ")}` : ``}`)
        }
        return base
    }
}


/**
 * @return a {@link NodeBaseFactory factory function} that works for all given {@link ILanguageBase language bases}.
 */
export const combinedFactoryFor = (languageBases: ILanguageBase[], receiveDelta?: DeltaReceiver): NodeBaseFactory => {
    const baseOf = combinedLanguageBaseLookupFor(languageBases)
    return (classifier, id) =>
        baseOf(classifier.language).factory(receiveDelta)(classifier, id)
}

