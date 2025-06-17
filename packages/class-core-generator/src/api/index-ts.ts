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
import { dependencyOrderOf } from "@lionweb/ts-utils"
import { dependenciesThroughDirectInheritanceOf } from "@lionweb/utilities"
import { asString, commaSeparated } from "littoral-templates"

import { indent } from "../utils/textgen.js"
import { GeneratorOptions } from "./generator.js"
import { importRenamingForLanguage, nameOfBaseClassForLanguage } from "./helpers/index.js"

export const indexTsFor = (languages: Language[], options: GeneratorOptions) => {
    const dependenciesInOrderOfDirectInheritance = dependencyOrderOf(languages, dependenciesThroughDirectInheritanceOf)
    if (dependenciesInOrderOfDirectInheritance === false) {
        console.error(
            `⚠ CYCLE detected! Proceeding with order of languages as-is, instead of in type-wise (through direct inheritance) dependency order ⇒ generated code might not initialize!`
        )
    }
    const languagesForImports =
        dependenciesInOrderOfDirectInheritance === false
            ? languages
            : dependenciesInOrderOfDirectInheritance.filter(language => languages.indexOf(language) > -1)

    return asString([
        options.header === undefined ? [] : [options.header, ``],
        `import {ILanguageBase, LionCore_builtinsBase} from "${options.genericImportLocation}";`,
        ``,
        languagesForImports.map(language => `import * as ${importRenamingForLanguage(language)} from "./${language.name}.g.js";`),
        ``,
        `// ensure that all languages get wired up by triggering that through their first entity:`,
        `LionCore_builtinsBase.INSTANCE.String;`,
        languages
            .filter(({ entities }) => entities.length > 0)
            .map(
                language =>
                    `${importRenamingForLanguage(language)}.${nameOfBaseClassForLanguage(language)}.INSTANCE.${language.entities[0].name};`
            ),
        ``,
        `export const allLanguageBases: ILanguageBase[] = [`,
        indent(
            commaSeparated(
                languagesForImports.map(
                    language => `${importRenamingForLanguage(language)}.${nameOfBaseClassForLanguage(language)}.INSTANCE`
                )
            )
        ),
        `];`,
        ``,
        `export {`,
        indent(commaSeparated(languages.map(importRenamingForLanguage))),
        `};`,
        ``
    ])
}

