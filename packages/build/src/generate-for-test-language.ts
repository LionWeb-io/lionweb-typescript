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

import { Annotation, deserializeLanguagesFrom, LionWebVersions } from "@lionweb/core"
import { defaultTrumpfOriginatingApache2_0LicensedHeader, generateLanguage } from "@lionweb/class-core-generator"
import { LionWebJsonChunk } from "@lionweb/json"
import { readFileAsJsonSync, retrieval } from "@lionweb/node-utils"
import { generatePlantUmlForLanguage, languageAsText } from "@lionweb/utilities"
import { writeFileSync } from "node:fs"
import { join } from "node:path"
import { argv } from "node:process"

const packagePath = "../class-core-test-language"
const metaPath = join(packagePath, "meta")
const languageJsonPath = join(metaPath, "testLanguage.json")

const externalRepoName = "lionweb-integration-testing"
const pathWithinExternalRepo = "testLanguage"
const originalLanguageJsonFileName = "testLanguage.2023.1.json"

const integrationTestingFilePath = join("../../..", externalRepoName, pathWithinExternalRepo, originalLanguageJsonFileName)

await retrieval({
    sourceURL: `https://raw.githubusercontent.com/LionWeb-io/${externalRepoName}/refs/heads/main/${pathWithinExternalRepo}/${originalLanguageJsonFileName}`,
    destinationPath: languageJsonPath,
    forceLocalCopying: (argv.length > 2 && argv[2] === "--force-local"),
    localSourcePath: integrationTestingFilePath
})

const TestLanguage = deserializeLanguagesFrom({ serializationChunk: readFileAsJsonSync(languageJsonPath) as LionWebJsonChunk })[0]

// modify name of TestAnnotation.containment because of clash with NodeBase.containment:
const TestAnnotation = TestLanguage.entities.find((entity) => entity.name === "TestAnnotation") as Annotation
const TestAnnotation_containment = TestAnnotation.features.find((feature) => feature.name === "containment")!
TestAnnotation_containment.name = "containedNode"

generateLanguage(TestLanguage, join(packagePath, "src/gen"), LionWebVersions.v2023_1, { header: defaultTrumpfOriginatingApache2_0LicensedHeader })
// (the same content as in the lionweb-integration-testing repository:)
writeFileSync(join(metaPath, "TestLanguage.txt"), languageAsText(TestLanguage))
writeFileSync(join(metaPath, "TestLanguage.puml"), generatePlantUmlForLanguage(TestLanguage))

