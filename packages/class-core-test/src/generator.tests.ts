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

import { languageFileFor } from "@lionweb/class-core-generator/dist/language-file.templates.js"
import { LanguageFactory, lioncoreBuiltinsFacade } from "@lionweb/core"
import { concatenator } from "@lionweb/ts-utils"
import { isTrue } from "./assertions.js"

describe(`class-core generator`, () => {

    it(`concept extends from Node or from nothing => class extends from NodeBase`, () => {
        const factory = new LanguageFactory("test", "0", concatenator("-"), concatenator("-"))
        factory.concept("ConceptExtendingNode", false, lioncoreBuiltinsFacade.classifiers.node)
        factory.concept("ConceptExtendingNothing", false)
        const languageFile = languageFileFor(factory.language, { verbose: false, genericImportLocation: "@lionweb/class-core" })
        const matchExtendsNode = languageFile.match(/export class ConceptExtendingNode extends (\w+) \{/)
        isTrue(matchExtendsNode !== null && matchExtendsNode[1] === "NodeBase")
        const matchExtendsNothing = languageFile.match(/export class ConceptExtendingNothing extends (\w+) \{/)
        isTrue(matchExtendsNothing !== null && matchExtendsNothing[1] === "NodeBase")
    })

})

