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

import { isConcrete, Language, LanguageEntity } from "@lionweb/core"
import { asString, commaSeparated } from "littoral-templates"

import { asJSIdentifier, indent } from "../utils/textgen.js"
import { Deprecated, ioLionWebMpsSpecificAnnotationsFrom } from "@lionweb/io-lionweb-mps-specific"

export const megaFactoryFor = (megaFactoryName: string, languages: Language[], header?: string) => {
    const isNotDeprecated = (entity: LanguageEntity) =>
        !ioLionWebMpsSpecificAnnotationsFrom(entity).some((annotation) => annotation instanceof Deprecated)

    const requiresFactoryMethod = (entity: LanguageEntity) => isConcrete(entity) && isNotDeprecated(entity)

    const factoryFor = (language: Language) => [
        `${asJSIdentifier(language.name)}Factory = {`,
        indent(
            commaSeparated(
                language.entities
                    .filter(requiresFactoryMethod)
                    .map(
                        classifier =>
                            `create${classifier.name}: () => ${asJSIdentifier(language.name)}.${classifier.name}.create(newId(), this.handleDelta)`
                    )
            )
        ),
        `}`,
        ``
    ]

    const languagesWithFactoryMethods = languages.filter(language => language.entities.some(requiresFactoryMethod))

    return asString([
        header ?? [],
        `import {DeltaHandler} from "@lionweb/class-core";`,
        ``,
        `import {`,
        indent(commaSeparated(languagesWithFactoryMethods.map(({ name }) => asJSIdentifier(name)))),
        `} from "./index.g.js";`,
        ``,
        `import {newId} from "../index.js";`,
        ``,
        ``,
        `export class ${megaFactoryName} {`,
        indent([
            ``,
            `constructor(`,
            indent([`public readonly handleDelta?: DeltaHandler`]),
            `) {`,
            `}`,
            ``,
            languagesWithFactoryMethods.map(factoryFor)
        ]),
        `}`,
        ``
    ])
}

