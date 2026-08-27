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

import { deserializeLanguages, lionWebVersionFrom, LionWebVersions } from "@lionweb/core"
import { LionWebJsonChunk } from "@lionweb/json"
import { readFileAsJsonSync } from "@lionweb/node-utils"
import {
    generateMermaidForLanguage,
    generatePlantUmlForLanguage,
    languageAsText
} from "@lionweb/utilities"
import { writeFileSync } from "node:fs"
import { join } from "node:path"
import { exit } from "node:process"

const languageName = "io.lionweb.mps.specific"
const packagePath = join("..", languageName.replaceAll(".", "-"))   // (-> package)
const metaPath = join(packagePath, "meta")

// read language definition from package:
const chunkPath = join(metaPath, `${languageName}.json`)
const chunk = readFileAsJsonSync(chunkPath) as LionWebJsonChunk
const maybeLionWebVersion = lionWebVersionFrom(chunk.serializationFormatVersion)
if (maybeLionWebVersion === undefined) {
    console.error(`Couldn’t determine known LionWeb version from serialization chunk with path = ${chunkPath}.`)
    console.log(`(Known LionWeb versions: ${Object.keys(LionWebVersions).join(", ")}.`)
    exit(2)
}
const language = deserializeLanguages(chunk, maybeLionWebVersion.lioncoreFacade.language)[0]

writeFileSync(join(metaPath, `${languageName}.txt`), languageAsText(language))
writeFileSync(join(metaPath, `${languageName}.puml`), generatePlantUmlForLanguage(language))
writeFileSync(join(metaPath, `${languageName}.md`), generateMermaidForLanguage(language))

