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
import { LionWebVersions } from "@lionweb/core"
import { generatePlantUmlForLanguage, genericAsTreeText, languageAsText } from "@lionweb/utilities"
import { writeFileSync } from "fs"
import { join } from "path"
import { defineDeltas, deltas, deltasLanguage, generateDeltaCode } from "./deltas/index.js"

const artifactsPath = "artifacts/deltas"

// generate LionCore-builtins:
generateLanguage(LionWebVersions.v2023_1.builtinsFacade.language, "../class-core/src", { genericImportLocation: "./index.js", header: defaultTrumpfOriginatingApache2_0LicensedHeader })

// generate artifacts for deltas definition language:
writeFileSync(join(artifactsPath, "delta-language.txt"), languageAsText(deltasLanguage))
writeFileSync(join(artifactsPath, "delta-language.puml"), defaultTrumpfOriginatingApache2_0LicensedHeader + "\n" + generatePlantUmlForLanguage(deltasLanguage))
generateLanguage(deltasLanguage, "src/deltas/definition", { header: defaultTrumpfOriginatingApache2_0LicensedHeader })

// generate artifacts for specification of deltas expressed in that language:
defineDeltas()
writeFileSync(join(artifactsPath, "deltas.txt"), genericAsTreeText(serializeNodeBases([deltas]), [deltasLanguage]))
generateDeltaCode("../class-core/src/deltas", defaultTrumpfOriginatingApache2_0LicensedHeader)

