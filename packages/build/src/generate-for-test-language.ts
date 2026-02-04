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

import { deserializeLanguages } from "@lionweb/core"
import { defaultTrumpfOriginatingApache2_0LicensedHeader, generateLanguage } from "@lionweb/class-core-generator"
import { LionWebJsonChunk } from "@lionweb/json"
import { generatePlantUmlForLanguage, languageAsText, readFileAsJson } from "@lionweb/utilities"
import { copyFileSync, lstatSync, writeFileSync } from "fs"
import { join } from "path"
import { getFromHttps } from "./curl.js"

const packagePath = "../class-core-test-language"
const metaPath = join(packagePath, "meta")
const languageJsonPath = join(metaPath, "testLanguage.json")

// try to copy language JSON file from external repo:
const externalRepoName = "lionweb-integration-testing"
const pathWithinExternalRepo = "src/languages"
const originalLanguageJsonFileName = "testLanguage.2023.1.json"
const url = `https://raw.githubusercontent.com/LionWeb-io/${externalRepoName}/refs/heads/main/${pathWithinExternalRepo}/${originalLanguageJsonFileName}`

await getFromHttps(url)
    .then((fileAsBuffer) => {
        writeFileSync(languageJsonPath, fileAsBuffer)
        console.log(`Retrieved serialization chunk JSON for test language from ${externalRepoName} repository from GitHub.`)
    })
    .catch((error) => {
        console.error(`Couldn’t retrieve serialization chunk JSON for test language from ${externalRepoName} repository from GitHub, due to: ${error}.`)
        const integrationTestingFilePath = join("../../..", externalRepoName, pathWithinExternalRepo, originalLanguageJsonFileName)
        if (lstatSync(integrationTestingFilePath).isFile()) {
            copyFileSync(integrationTestingFilePath, languageJsonPath)
            console.log(`Copied serialization chunk JSON for test language from ${externalRepoName} repository.`)
        } else {
            console.log(`${externalRepoName} repository not found: using serialization chunk JSON for test language as provided here.`)
        }
    })
console.log()

const TestLanguage = deserializeLanguages(readFileAsJson(languageJsonPath) as LionWebJsonChunk)[0]
generateLanguage(TestLanguage, join(packagePath, "src/gen"), { header: defaultTrumpfOriginatingApache2_0LicensedHeader })
// (the same content as in the lionweb-integration-testing repository:)
writeFileSync(join(metaPath, "TestLanguage.txt"), languageAsText(TestLanguage))
writeFileSync(join(metaPath, "TestLanguage.puml"), generatePlantUmlForLanguage(TestLanguage))

