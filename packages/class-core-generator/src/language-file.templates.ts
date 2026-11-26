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

import { Concept, isResolvedReference, Language, LionWebVersion, nameSorted } from "@lionweb/core"
import { indent } from "@lionweb/textgen-utils"
import { dependencyOrderOf, sortedStringsByUppercase } from "@lionweb/ts-utils"
import { asString, commaSeparated, when, withNewlineAppended } from "littoral-templates"

import { typeForLanguageEntity } from "./entity-types.templates.js"
import { GeneratorOptions } from "./generator.js"
import { Imports, statementPostfix } from "./helpers/index.js"
import { reflectiveClassFor } from "./reflective-layer.templates.js"

export const languageFileFor = (language: Language, lionWebVersion: LionWebVersion, options: GeneratorOptions) => {

    const { name, version, key, id, entities } = language

    const imports = new Imports(language, lionWebVersion.builtinsFacade)

    const sp = statementPostfix(options)    // (abbrev. of “statement postfix”)

    const orderedEntities = dependencyOrderOf(
        options.sortByName ? nameSorted(entities) : entities,   // sort alphabetically 1st (if requested), then topologically, to stabilize generated code as much as possible
        (entity) =>
            (entity instanceof Concept && isResolvedReference(entity.extends)) ? [entity.extends] : []
    )
    if (orderedEntities === false) {
        throw new Error(`language ${name} has a cycle among the graph of entities with edges formed by the inheritance dependency`)
    }

    const postImportsPart = [
        ``,
        reflectiveClassFor(language, imports, options.sortByName, options.semicolons),
        ``,
        ``,
        orderedEntities
            .filter((entity) => entity.language === language)
            .map(withNewlineAppended(typeForLanguageEntity(imports, options.sortByName, options.semicolons)))
    ]

    return asString([
        options?.header ?? [],
        `/*
 * language's metadata:
 *     name:    ${name}
 *     version: ${version}
 *     key:     ${key}
 *     id:      ${id}
 */`,
        ``,
        ``,
        `import * as ${Imports.importAlias("class-core")} from "${options.genericImportLocation}"${sp}`,
        `import * as ${Imports.importAlias("core")} from "@lionweb/core"${sp}`,
        `import * as ${Imports.importAlias("json")} from "@lionweb/json"${sp}`,
        when(imports.languageImports.length > 0)(
            `import {`, indent(commaSeparated(sortedStringsByUppercase(imports.languageImports))), `} from "${`./index.g.js`}"${sp}`
        ),
        postImportsPart
    ])
}

