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

import { defaultLionWebVersion, deserializeLanguages, Language, lionWebVersionFrom } from "@lionweb/core"
import { LionWebJsonChunk } from "@lionweb/json"
import { readFileAsJson } from "@lionweb/utilities"
import { writeFileSync } from "fs"
import { join } from "path"
import { cwd } from "process"

import { indexTsFor } from "./index-ts.js"
import { languageFileFor } from "./language-file.templates.js"

const properGenericImportLocation = "@lionweb/class-core"


/**
 * A type def. for options objects configuring code generation.
 */
export type GeneratorOptions = {
    /**
     * The `from`-part of the `import`-statement that imports the `class-core` package.
     * Default (which you should always use!): `@lionweb/class-core`.
     */
    genericImportLocation: string
    /**
     * The optional header for generated files.
     */
    header?: string
    /**
     * Whether to output logging on the `stdout`. Default: `true`.
     */
    verbose: boolean
}


const withDefaults = (options?: Partial<GeneratorOptions>): GeneratorOptions => ({
    genericImportLocation: options?.genericImportLocation ?? properGenericImportLocation,
    header: options?.header,
    verbose: options?.verbose ?? true
})


/**
 * Generates a file containing the API code for the given {@link Language LionWeb language}.
 * @param language A {@link Language LionWeb language}.
 * @param generationPath The path (relative to the current execution) to generate to/in.
 * @param mayBeOptions Optionally-given {@link GeneratorOptions options}.
 */
export const generateLanguage = (language: Language, generationPath: string, mayBeOptions?: Partial<GeneratorOptions>): string => {
    const {name} = language
    const fileName = `${name}.g.ts`
    writeFileSync(join(generationPath, fileName), languageFileFor(language, withDefaults(mayBeOptions)))
    return fileName
}


const logger = (verbose?: boolean): ((text?: string) => void) =>
    (verbose ?? true)
        ? (text) => { console.log(text ?? ``) }
        : (_) => {}


/**
 * Generates an API (as files) for the {@link Language LionWeb languages} given as a serialization chunk at the given path.
 * @param languagesJsonPath The path (relative to the current execution) to a LionWeb serialization chunk containing {@link Language LionWeb languages}.
 * @param generationPath The path (relative to the current execution) to generate to/in.
 * @param mayBeOptions Optionally-given {@link GeneratorOptions options}.
 */
export const generateApiFromLanguagesJson = (languagesJsonPath: string, generationPath: string, mayBeOptions?: Partial<GeneratorOptions>) => {
    const log = logger(mayBeOptions?.verbose)
    log(`Running API generator with cwd: ${cwd()}`)
    log(`   Path to languages: ${languagesJsonPath}`)
    log(`   Generation path:   ${generationPath}`)

    const languagesJson = readFileAsJson(languagesJsonPath) as LionWebJsonChunk
    const languages = deserializeLanguages(languagesJson, (lionWebVersionFrom(languagesJson.serializationFormatVersion) ?? defaultLionWebVersion).lioncoreFacade.language)
    generateApiFromLanguages(languages, generationPath, mayBeOptions)
}


/**
 * Generates an API (as files) for the {@link Language LionWeb languages} given as a serialization chunk at the given path.
 * @param languages A collection of {@link Language LionWeb languages}.
 * @param generationPath The path (relative to the current execution) to generate to/in.
 * @param mayBeOptions Optionally-given {@link GeneratorOptions options}.
 */
export const generateApiFromLanguages = (languages: Language[], generationPath: string, maybeOptions?: Partial<GeneratorOptions>) => {
    const log = logger(maybeOptions?.verbose)
    log(`   Generated:`)

    const options = withDefaults(maybeOptions)

    if (languages.length > 1) {
        writeFileSync(join(generationPath, "index.g.ts"), indexTsFor(languages, options))
        log(`       index.g.ts`)
    }

    languages.forEach((language) => {
        const {name, version, key, id} = language
        const fileName = generateLanguage(language, generationPath, options)
        log(`       ${fileName} -> language: ${name} (version=${version}, key=${key}, id=${id})`)
    })

    log(`[done]`)
    log()
}

