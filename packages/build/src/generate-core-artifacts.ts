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

import { Language, LionWebVersion, LionWebVersions, serializeLanguages } from "@lionweb/core"
import { generatePlantUmlForLanguage, languageAsText, writeJsonAsFile } from "@lionweb/utilities"
import { writeFileSync } from "fs"
import { join } from "path"

const generateArtifactsFor = (lionWebVersion: LionWebVersion) => {
    const versionId = Object.entries(LionWebVersions).find(([_, value]) => value === lionWebVersion)![0]
    const path = `artifacts/core/${versionId}`
    const writeArtifacts = (language: Language, name: string) => {
        writeJsonAsFile(join(path, `${name}.json`), serializeLanguages(language))
        writeFileSync(join(path, `${name}.txt`), languageAsText(language))
        writeFileSync(join(path, `${name}.puml`), generatePlantUmlForLanguage(language))
    }
    writeArtifacts(lionWebVersion.lioncoreFacade.language, "lioncore")
    writeArtifacts(lionWebVersion.builtinsFacade.language, "builtins")
    console.log(`Generated artifacts for version ${lionWebVersion.serializationFormatVersion} of LionCore and LionCore built-ins.`)
}

generateArtifactsFor(LionWebVersions.v2023_1)

