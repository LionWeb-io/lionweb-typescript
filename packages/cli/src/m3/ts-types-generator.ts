import {extname} from "path"
import {writeFileSync} from "fs"

import {GenerationOptions, tsTypesForLanguage} from "@lionweb/utilities"
import {deserializeLanguages} from "@lionweb/core"
import {readChunk} from "../chunk.js"


const generateTsTypesFromSerialization = async (path: string, generationOptions: GenerationOptions[]) => {
    try {
        const languages = deserializeLanguages(await readChunk(path))
        const extLessPath = path.substring(0, path.length - extname(path).length)
        const tsFilePath = extLessPath + "-types.ts"
        // TODO  generate 1 file per Language:
        writeFileSync(tsFilePath, languages.map((language) => tsTypesForLanguage(language, ...generationOptions)).join("\n\n"))
        console.log(`generated TS types: "${path}" -> "${tsFilePath}"`)
    } catch (e) {
        console.error(`"${path}" does not point to a valid JSON serialization of a language`)
        throw e
    }
}


export const generateTsTypesWith = async (args: string[]) => {
    const generationOptions = args
        .filter((arg) => arg.startsWith("--"))
        .map((option) => option.substring(2).trim())
        .filter((option) => option in GenerationOptions)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((option) => (GenerationOptions as any)[option])    // e.g. "assumeSealed" -> GenerationOptions.assumeSealed

    args
        .filter((arg) => !arg.startsWith("--"))
        .forEach((path) => generateTsTypesFromSerialization(path, generationOptions))
}

