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
    AccumulatingProblemReporter,
    deserializeLanguagesFrom,
    keyOf,
    lioncoreReaderFor,
    LionWebVersion,
    LionWebVersions,
    nodesExtractorUsing
} from "@lionweb/core"
import { LionWebJsonChunk, LionWebJsonMetaPointer, LionWebKey } from "@lionweb/json"
import { readFileAsJsonSync } from "@lionweb/node-utils"
import { expect } from "chai"
import { join } from "node:path"

import { migratedToLionWebVersion } from "@lionweb/utilities"


const testLanguagePath = "../class-core-test-language/meta/testLanguage.json"
const artifactsDir = "artifacts/utilities/testLanguage"
const nonV2023_1LionCoreM3ResolveInfoPrefix = "LionWeb.LionCore_M3."
const nonV2023_1LionCoreBuiltinsResolveInfoPrefix = "LionWeb.LionCore_builtins."

const isLionCoreLanguageKey = (languageKey: LionWebKey) =>
    languageKey === "LionCore-M3" || languageKey === "LionCore-builtins"

const checkLionCoreReferences = (chunk: LionWebJsonChunk, lionWebVersion: LionWebVersion) => {
    const { serializationFormatVersion } = lionWebVersion

    const extractedNodes = nodesExtractorUsing(lioncoreReaderFor(lionWebVersion))
    const keysOfLionCoreM3Referables = extractedNodes(lionWebVersion.lioncoreFacade.language).map(keyOf)
    const keysOfLionCoreBuiltinsReferables = extractedNodes(lionWebVersion.builtinsFacade.language).map(keyOf)

    const checkMetaPointer = ({ language, version }: LionWebJsonMetaPointer) => {
        if (isLionCoreLanguageKey(language)) {
            expect(version).to.equal(serializationFormatVersion)
        }
    }
    expect(chunk.serializationFormatVersion).to.equal(serializationFormatVersion)
    for (const usedLanguage of chunk.languages) {
        if (isLionCoreLanguageKey(usedLanguage.key)) {
            expect(usedLanguage.version).to.equal(serializationFormatVersion)
        }
    }
    for (const node of chunk.nodes) {
        checkMetaPointer(node.classifier)
        for (const { property } of node.properties) {
            checkMetaPointer(property)
        }
        for (const { containment } of node.containments) {
            checkMetaPointer(containment)
        }
        for (const { reference, targets } of node.references) {
            checkMetaPointer(reference)
            for (const { reference, resolveInfo } of targets) {
                if (resolveInfo === null) {
                    expect(reference).to.not.be.null
                } else {
                    if (resolveInfo.startsWith(nonV2023_1LionCoreM3ResolveInfoPrefix)) {
                        const localQualifiedName = resolveInfo.substring(nonV2023_1LionCoreM3ResolveInfoPrefix.length)
                        expect(keysOfLionCoreM3Referables.indexOf(localQualifiedName)).to.not.equal(-1)
                    }
                    if (resolveInfo.startsWith(nonV2023_1LionCoreBuiltinsResolveInfoPrefix)) {
                        const localQualifiedName = resolveInfo.substring(nonV2023_1LionCoreBuiltinsResolveInfoPrefix.length)
                        expect(keysOfLionCoreBuiltinsReferables.indexOf(`LionCore-builtins-${localQualifiedName}`)).to.not.equal(-1)
                    }
                }
            }
        }
    }
}

describe("migration", () => {

    it("migrates testLanguage.json from 2023.1 to 2024.1", () => {
        const migratedChunk = migratedToLionWebVersion(readFileAsJsonSync(testLanguagePath) as LionWebJsonChunk, LionWebVersions.v2024_1)
        checkLionCoreReferences(migratedChunk, LionWebVersions.v2024_1)
        expect(migratedChunk).to.deep.equal(readFileAsJsonSync(join(artifactsDir, "expected-testLanguage.2024.1.json")))
        const problemReporter = new AccumulatingProblemReporter()
        deserializeLanguagesFrom({ serializationChunk: migratedChunk, lionWebVersion: LionWebVersions.v2024_1, problemReporter })
        expect(problemReporter.allProblems).to.deep.equal([])
    })

    it("migrates testLanguage.json from 2023.1 to 2026.1", () => {
        const migratedChunk = migratedToLionWebVersion(readFileAsJsonSync(testLanguagePath) as LionWebJsonChunk, LionWebVersions.v2026_1)
        expect(migratedChunk).to.deep.equal(readFileAsJsonSync(join(artifactsDir, "expected-testLanguage.2026.1.json")))
        const problemReporter = new AccumulatingProblemReporter()
        deserializeLanguagesFrom({ serializationChunk: migratedChunk, lionWebVersion: LionWebVersions.v2026_1, problemReporter })
        expect(problemReporter.allProblems).to.deep.equal([])
    })

    it("migrates testLanguage.json from 2024.1 to 2026.1", () => {
        const migratedChunk = migratedToLionWebVersion(
            migratedToLionWebVersion(readFileAsJsonSync(testLanguagePath) as LionWebJsonChunk, LionWebVersions.v2024_1),
            LionWebVersions.v2026_1
        )
        expect(migratedChunk).to.deep.equal(readFileAsJsonSync(join(artifactsDir, "expected-testLanguage.2026.1.json")))
        const problemReporter = new AccumulatingProblemReporter()
        deserializeLanguagesFrom({ serializationChunk: migratedChunk, lionWebVersion: LionWebVersions.v2026_1, problemReporter })
        expect(problemReporter.allProblems).to.deep.equal([])
    })

})
