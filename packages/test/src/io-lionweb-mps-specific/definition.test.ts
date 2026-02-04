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

import {
    IoLionWebMpsSpecificAnnotation,
    ioLionWebMpsSpecificClassifiers,
    ioLionWebMpsSpecificLanguage
} from "@lionweb/io-lionweb-mps-specific"
import * as classes from "@lionweb/io-lionweb-mps-specific/dist/implementation.js"

import { Classifier, LionWebVersions, M3Node, serializeLanguages } from "@lionweb/core"
import { genericAsTreeText, writeJsonAsFile } from "@lionweb/utilities"
import { join } from "path"
import { writeFileSync } from "fs"
import { deepEqual, isTrue } from "../test-utils/assertions.js"

describe(`io.lionweb.mps.specific language`, () => {

    it(`its definition can be persisted (as JSON and in the generic textual format)`, () => {
        const path = `artifacts/${ioLionWebMpsSpecificLanguage.name.replaceAll(".", "-")}`
        const serializationChunk = serializeLanguages(ioLionWebMpsSpecificLanguage)
        writeJsonAsFile(join(path, `${ioLionWebMpsSpecificLanguage.name}-reserialized.json`), serializationChunk)
        writeFileSync(join(path, `${ioLionWebMpsSpecificLanguage.name}.generic.txt`), genericAsTreeText(serializationChunk, [LionWebVersions.v2023_1.lioncoreFacade.language]))
    })

    it(`its classifiers dictionary matches its definition`, () => {
        ioLionWebMpsSpecificLanguage.entities
            .forEach(({name}) => {
                isTrue(name in classes, `entity "${name}" not mapped to a class`)
            })
        Object.values(classes)
            .forEach(({name}) => {
                if (name !== IoLionWebMpsSpecificAnnotation.name) {
                    const entity = (ioLionWebMpsSpecificClassifiers as Record<string, unknown>)[name]
                    isTrue(entity !== undefined, `class "${name}" doesn’t correspond to anything`)
                    isTrue(entity instanceof M3Node, `class "${name}" doesn’t correspond to anything`)
                    isTrue(entity instanceof Classifier, `class "${name}" doesn’t correspond to a classifier, but to a ${(entity! as M3Node).metaType()}`)
                }
            })
        deepEqual(
            ioLionWebMpsSpecificClassifiers,
            Object.fromEntries(
                ioLionWebMpsSpecificLanguage.entities
                    .map((entity) => [
                        entity.name,
                        entity
                    ])
            )
        )
    })

})

