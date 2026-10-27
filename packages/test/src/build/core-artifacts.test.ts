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

import { Language, LionWebVersions, metaPointerForLanguage } from "@lionweb/core"
import { LionWebJsonChunk, LionWebJsonUsedLanguage, LionWebVersion } from "@lionweb/json"
import { readFileAsJsonSync, retrieval, writeJsonAsFileSync } from "@lionweb/node-utils"
import { sortedSerializationChunk } from "@lionweb/utilities"
import { existsSync, mkdirSync } from "node:fs"
import { join } from "node:path"

import { deepEqual } from "../test-utils/assertions.js"


describe("LionCore[-builtins] equivalence", () => {

    const checkEquivalence = async (version: LionWebVersion, fileName: "builtins" | "lioncore", tweakFromSpec?: (chunk: LionWebJsonChunk) => void) => {
        const artifactsPath = `artifacts/core/${version}`
        if (!existsSync(artifactsPath)) {
            mkdirSync(artifactsPath)
        }
        const fromSpecPath = join(artifactsPath, `/${fileName}.json`)
        await retrieval({
            sourceURL: `https://raw.githubusercontent.com/LionWeb-io/specification/refs/heads/main/${version}/metametamodel/${fileName}.json`,
            destinationPath: fromSpecPath,
            localSourcePath: `../../../specification/${version}/metametamodel/${fileName}.json`
        })
        const fromSpec = await readFileAsJsonSync(fromSpecPath) as LionWebJsonChunk
        if (tweakFromSpec) {
            tweakFromSpec(fromSpec)
        }
        const generated = await readFileAsJsonSync(`../build/artifacts/core/${version}/${fileName}.json`) as LionWebJsonChunk
        const sortedFromSpec = sortedSerializationChunk(fromSpec, true)
        writeJsonAsFileSync(`artifacts/core/${version}/${fileName}-from-spec-sorted.json`, sortedFromSpec)
        const sortedGenerated = sortedSerializationChunk(generated, true)
        writeJsonAsFileSync(`artifacts/core/${version}/${fileName}-generated-sorted.json`, sortedGenerated)
        deepEqual(sortedGenerated, sortedFromSpec)
    }

    const checkEquivalences = async (version: LionWebVersion, tweakFromSpec?: (chunk: LionWebJsonChunk) => void) => {
        await checkEquivalence(version, "lioncore", tweakFromSpec)
        await checkEquivalence(version, "builtins", tweakFromSpec)

    }


    it("version 2023.1", async () => {
        const areSameLanguages = (left: LionWebJsonUsedLanguage, right: Language) =>
            left.key === right.key && left.version === right.version
        const addBuiltinsFromUsedLanguages = ({ languages }: LionWebJsonChunk) => {
            if (languages.findIndex((language) => areSameLanguages(language, LionWebVersions.v2023_1.builtinsFacade.language)) === -1) {
                languages.push(metaPointerForLanguage(LionWebVersions.v2023_1.builtinsFacade.language))
                // Assume that the LionCore built-ins language is the last list element.
            }
        }
        await checkEquivalences("2023.1", addBuiltinsFromUsedLanguages)
    })

})

