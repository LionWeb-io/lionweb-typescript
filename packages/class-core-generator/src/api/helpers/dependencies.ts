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

import {Classifier, cycleWith, inheritsFrom, Language, nameOf, nameSorted} from "@lionweb/core"
import {uniquesAmong} from "@lionweb/utilities/dist/utils/array.js"
import {asString, when} from "littoral-templates"
import {indent} from "../../utils/index.js"


/**
 * @return all languages that any {@link Classifier classifier} of the given {@link Language language} depends on through direct inheritance.
 */
export const dependenciesThroughDirectInheritanceOf = (language: Language) =>
    uniquesAmong(
        language.entities
            .filter((entity) => entity instanceof Classifier)
            .flatMap((entity) => inheritsFrom(entity as Classifier))
            .map((classifier) => classifier.language)
            .filter((depLanguage) => depLanguage !== language)
    )


/**
 * @return the – currently only those arising from direct inheritance on classifier-level – dependencies of the given {@link Language languages},
 *  as a human-readable text
 */
export const verboseDependencies = (languages: Language[]): string => {
    const nameSortedLanguages = nameSorted(languages)
    return asString([
        nameSortedLanguages.map((language) => {
            const deps = dependenciesThroughDirectInheritanceOf(language)
            const what = `direct type-wise dependencies (through inheritance)`
            const cycle = cycleWith(language, dependenciesThroughDirectInheritanceOf)
            return deps.length === 0
                ? `language ${language.name} has no ${what}`
                : [
                    `language ${language.name} has the following ${what}:`,
                    indent([
                        nameSorted(dependenciesThroughDirectInheritanceOf(language)).map(nameOf),
                        when(cycle.length > 0)(
                            `⚠ language "${language.name}" is part of the following cycle through type-wise (through direct inheritance): ${cycle.map(nameOf).join(" -> ")}`
                        )
                    ])
                ]
        })
    ])
}

