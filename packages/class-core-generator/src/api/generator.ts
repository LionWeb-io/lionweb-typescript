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

import {deserializeLanguages, Language, lioncore, SerializationChunk} from "@lionweb/core"
import {readFileAsJson} from "@lionweb/utilities"
import {writeFileSync} from "fs"
import {join} from "path"
import {cwd} from "process"

import {indexTsFor} from "./index-ts.js"
import {languageFileFor} from "./language-file.templates.js"
import {MpsAnnotation} from "./helpers/index.js"


const properGenericImportLocation = "@lionweb/class-core"


export type GeneratorOptions = {
    mpsAnnotations: MpsAnnotation[]
    genericImportLocation: string
    header?: string
}


const withDefaults = (options?: Partial<GeneratorOptions>): GeneratorOptions => ({
    mpsAnnotations: options?.mpsAnnotations ?? [],
    genericImportLocation: options?.genericImportLocation ?? properGenericImportLocation,
    header: options?.header
})


export const generateLanguage = (language: Language, generationPath: string, options?: Partial<GeneratorOptions>): string => {
    const {name} = language
    const fileName = `${name}.g.ts`
    writeFileSync(join(generationPath, fileName), languageFileFor(language, withDefaults(options)))
    return fileName
}


export const generateApiFromLanguagesJson = (languagesJsonPath: string, generationPath: string, options?: Partial<GeneratorOptions>) => {
    console.log(`Running API generator with cwd: ${cwd()}`)
    console.log(`   Path to languages: ${languagesJsonPath}`)
    console.log(`   Generation path:   ${generationPath}`)

    const languagesJson = readFileAsJson(languagesJsonPath) as SerializationChunk
    const languages = deserializeLanguages(languagesJson, lioncore)
    generateApiFromLanguages(languages, generationPath, options)
}


export const generateApiFromLanguages = (languages: Language[], generationPath: string, maybeOptions?: Partial<GeneratorOptions>) => {
    console.log(`   Generated:`)

    const options = withDefaults(maybeOptions)

    if (languages.length > 1) {
        writeFileSync(join(generationPath, "index.g.ts"), indexTsFor(languages, options))
        console.log(`       index.g.ts`)
    }

    languages.forEach((language) => {
        const {name, version, key, id} = language
        const fileName = generateLanguage(language, generationPath, options)
        console.log(`       ${fileName} -> language: ${name} (version=${version}, key=${key}, id=${id})`)
    })

    console.log(`[done]`)
    console.log()
}

