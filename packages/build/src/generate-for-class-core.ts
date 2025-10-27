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
import { deserializeLanguages, lioncoreBuiltins, serializeLanguages } from "@lionweb/core"
import { LionWebJsonChunk } from "@lionweb/json"
import {
    generatePlantUmlForLanguage,
    genericAsTreeText,
    languageAsText,
    readFileAsJson,
    writeJsonAsFile
} from "@lionweb/utilities"
import { writeFileSync } from "fs"
import { join } from "path"
import { deltas } from "./deltas/definition/definition-base.js"
import { defineDeltas } from "./deltas/definition/definitions.js"
import { generateDeltaCode } from "./deltas/generator/generator.js"
import { deltasLanguage } from "./deltas/meta-definition.js"

const inArtifactsPath = (subPath: string) => join("artifacts", subPath)

// generate LionCore-builtins:
generateLanguage(lioncoreBuiltins, "../class-core/src", { genericImportLocation: "./index.js", header: defaultTrumpfOriginatingApache2_0LicensedHeader })

// generate artifacts for deltas definition language:
writeJsonAsFile(inArtifactsPath("delta-language.json"), serializeLanguages(deltasLanguage))
writeFileSync(inArtifactsPath("delta-language.txt"), languageAsText(deltasLanguage))
writeFileSync(inArtifactsPath("delta-language.puml"), defaultTrumpfOriginatingApache2_0LicensedHeader + "\n" + generatePlantUmlForLanguage(deltasLanguage))
generateLanguage(deltasLanguage, "src/deltas/definition", { header: defaultTrumpfOriginatingApache2_0LicensedHeader })

// generate artifacts for specification of deltas expressed in that language:
defineDeltas()
writeFileSync(inArtifactsPath("deltas.txt"), genericAsTreeText(serializeNodeBases([deltas]), [deltasLanguage]))
generateDeltaCode("../class-core/src/deltas", defaultTrumpfOriginatingApache2_0LicensedHeader)

// TestLanguage language:
const TestLanguage = deserializeLanguages(readFileAsJson(inArtifactsPath("TestLanguage.json")) as LionWebJsonChunk)[0]
writeFileSync(inArtifactsPath("TestLanguage.txt"), languageAsText(TestLanguage))
generateLanguage(TestLanguage, "../class-core-test/src/gen", { header: defaultTrumpfOriginatingApache2_0LicensedHeader })
generateLanguage(TestLanguage, "../delta-protocol-test-cli/src/gen", { header: defaultTrumpfOriginatingApache2_0LicensedHeader })

