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

import { serializeNodeBases } from "@lionweb/class-core" // Note: this is a circular dependency!
import { defaultTrumpfOriginatingApache2_0LicensedHeader, generateLanguage } from "@lionweb/class-core-generator"
import { deserializeLanguages, lioncoreBuiltinsFacade, serializeLanguages } from "@lionweb/core"
import { LionWebJsonChunk } from "@lionweb/json"
import {
    generatePlantUmlForLanguage,
    genericAsTreeText,
    languageAsText,
    readFileAsJson,
    writeJsonAsFile
} from "@lionweb/utilities"
import { copyFileSync, lstatSync, writeFileSync } from "fs"
import { join } from "path"
import { deltas } from "./deltas/definition/definition-base.js"
import { defineDeltas } from "./deltas/definition/definitions.js"
import { generateDeltaCode } from "./deltas/generator/generator.js"
import { deltasLanguage } from "./deltas/meta-definition.js"
import { getFromHttps } from "./curl.js"


const inArtifactsPath = (subPath: string) => join("artifacts", subPath)

// generate LionCore-builtins:
generateLanguage(lioncoreBuiltinsFacade.language, "../class-core/src", { genericImportLocation: "./index.js", header: defaultTrumpfOriginatingApache2_0LicensedHeader })

// generate artifacts for deltas definition language:
writeJsonAsFile(inArtifactsPath("delta-language.json"), serializeLanguages(deltasLanguage))
writeFileSync(inArtifactsPath("delta-language.txt"), languageAsText(deltasLanguage))
writeFileSync(inArtifactsPath("delta-language.puml"), defaultTrumpfOriginatingApache2_0LicensedHeader + "\n" + generatePlantUmlForLanguage(deltasLanguage))
generateLanguage(deltasLanguage, "src/deltas/definition", { header: defaultTrumpfOriginatingApache2_0LicensedHeader })

// generate artifacts for specification of deltas expressed in that language:
defineDeltas()
writeFileSync(inArtifactsPath("deltas.txt"), genericAsTreeText(serializeNodeBases([deltas]), [deltasLanguage]))
generateDeltaCode("../class-core/src/deltas", defaultTrumpfOriginatingApache2_0LicensedHeader)

// copy language JSON file from external repo:
const externalRepoName = "lionweb-integration-testing"
const pathWithinExternalRepo = "src/languages"
const languageJsonFileName = "testLanguage.2023.1.json"
const url = `https://raw.githubusercontent.com/LionWeb-io/${externalRepoName}/refs/heads/main/${pathWithinExternalRepo}/${languageJsonFileName}`
const languageJsonPath = inArtifactsPath(languageJsonFileName)

await getFromHttps(url)
    .then((fileAsBuffer) => {
        writeFileSync(languageJsonPath, fileAsBuffer)
        console.log(`Retrieved serialization chunk JSON for test language from ${externalRepoName} repository from GitHub.`)
    })
    .catch((error) => {
        console.error(`Couldn’t retrieve serialization chunk JSON for test language from ${externalRepoName} repository from GitHub, due to: ${error}.`)
        const integrationTestingFilePath = join("../../..", externalRepoName, pathWithinExternalRepo, languageJsonFileName)
        if (lstatSync(integrationTestingFilePath).isFile()) {
            copyFileSync(integrationTestingFilePath, languageJsonPath)
            console.log(`Copied serialization chunk JSON for test language from ${externalRepoName} repository.`)
        } else {
            console.log(`${externalRepoName} repository not found: using serialization chunk JSON for test language as provided here.`)
        }
    })
console.log()

// TestLanguage language:
const TestLanguage = deserializeLanguages(readFileAsJson(languageJsonPath) as LionWebJsonChunk)[0]
generateLanguage(TestLanguage, "../class-core-test-language/src/gen", { header: defaultTrumpfOriginatingApache2_0LicensedHeader })
// (the same content as in the lionweb-integration-testing repository:)
writeFileSync(inArtifactsPath("TestLanguage.txt"), languageAsText(TestLanguage))
writeFileSync(inArtifactsPath("TestLanguage.puml"), generatePlantUmlForLanguage(TestLanguage))

