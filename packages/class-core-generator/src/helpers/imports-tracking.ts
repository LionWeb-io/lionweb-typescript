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

import { Language, LanguageEntity, LionCoreBuiltinsFacade } from "@lionweb/core"
import { asJSIdentifier, withFirstUpper } from "@lionweb/textgen-utils"

export const importRenamingForLanguage = (language: Language) => asJSIdentifier(language.name)

export const nameOfBaseClassForLanguage = (language: Language) =>
    asJSIdentifier(language.name) + "Base"


export class Imports {

    constructor(public readonly thisLanguage: Language, public readonly lioncoreBuiltinsFacade: LionCoreBuiltinsFacade) {
    }

    private lioncoreBuiltinsIdentifier = nameOfBaseClassForLanguage(this.lioncoreBuiltinsFacade.language)

    get thisLanguageNameAsJsIdentifier() {
        return asJSIdentifier(this.thisLanguage.name)
    }

    get thisBaseClassName() {
        return this.thisLanguageNameAsJsIdentifier + "Base"
    }

    public static importAlias = (libName: string) =>
        `$lw${withFirstUpper(libName)}`
    private aliased = (libName: string, identifier: string) =>
        `${Imports.importAlias(libName)}.${identifier}`

    private readonly _jsonImports = new Set<string>()
    json(identifier: string) {
        this._jsonImports.add(identifier)
        return this.aliased("json", identifier)
    }

    private readonly _coreImports = new Set<string>()
    core(identifier: string) {
        this._coreImports.add(identifier)
        return this.aliased("core", identifier)
    }

    private readonly _genericImports = new Set<string>()
    generic(identifier: string) {
        this._genericImports.add(identifier)
        return this.aliased("classCore", identifier)
    }

    entity(entity: LanguageEntity) {
        if (entity.language === this.lioncoreBuiltinsFacade.language) {
            return this.generic(entity.name)
        }
        if (entity.language === this.thisLanguage) {
            return entity.name
        }
        this._languageImports.add(importRenamingForLanguage(entity.language))
        return `${importRenamingForLanguage(entity.language)}.${entity.name}`
    }

    private readonly _languageImports = new Set<string>()
    get languageImports() {
        return [...this._languageImports]
    }
    language(language: Language) {
        if (language === this.lioncoreBuiltinsFacade.language) {
            return this.generic(this.lioncoreBuiltinsIdentifier)
        }
        const externalName = importRenamingForLanguage(language)
        if (language === this.thisLanguage) {
            return nameOfBaseClassForLanguage(language)
        }
        this._languageImports.add(externalName)
        return `${externalName}.${nameOfBaseClassForLanguage(language)}`
    }
}

